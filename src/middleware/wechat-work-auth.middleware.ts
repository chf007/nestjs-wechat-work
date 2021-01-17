import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import * as queryString from 'query-string';
import { WechatWorkConfig } from '../wechat-work.config';
import { WechatWorkBaseService, WechatWorkContactsService } from '../services';
import { DEFAULT_TOKEN_NAME, DEFAULT_TOKEN_EXPIRES } from '../constants';
import { AuthFailResult } from '../interfaces';
import { getPathById, flatten } from '../utils';

@Injectable()
export class WechatWorkAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: WechatWorkConfig,
    private readonly wechatWorkBaseService: WechatWorkBaseService,
    private readonly wechatWorkContactsService: WechatWorkContactsService,
  ) {}
  async use(req: Request, res: Response, next: Function) {
    const { corpId, agentId } = this.config.baseConfig;
    const {
      returnDomainName,
      loginPath,
      logoutPath,
      loginSuccessPath,
      loginFailPath,
      tokenName = DEFAULT_TOKEN_NAME,
      tokenExpires = DEFAULT_TOKEN_EXPIRES,
      jwtSecret,
    } = this.config.authConfig;
    const loginFailPathObj = queryString.parseUrl(loginFailPath);

    if (req.route.path === loginPath) {
      // 如果当前请求是访问 loginPath，如传入code则校验企业微信用户信息如正确则生成jwt token，写入cookie，然后跳转至 loginSuccessPath，如失败则跳至 loginFailPath；如直接访问，则直接跳转至企业微信扫码页。
      if (req.query.code) {
        let userIdData;
        try {
          userIdData = await this.wechatWorkBaseService.getUserId(
            req.query.code as string,
          );
        } catch (err) {
          userIdData = {};
        }
        if (!userIdData.UserId) {
          loginFailPathObj.query.result = AuthFailResult.QueryUserIdFail;
          return res.redirect(queryString.stringifyUrl(loginFailPathObj));
        }

        let userInfoData;
        try {
          userInfoData = await this.wechatWorkContactsService.getUserInfo(
            userIdData.UserId,
          );
        } catch (err) {
          userInfoData = {};
        }
        if (!userInfoData.userid) {
          loginFailPathObj.query.result = AuthFailResult.QueryUserInfoFail;
          return res.redirect(queryString.stringifyUrl(loginFailPathObj));
        }

        if (!userInfoData.enable || userInfoData.status !== 1) {
          loginFailPathObj.query.result = AuthFailResult.UserInactive;
          return res.redirect(queryString.stringifyUrl(loginFailPathObj));
        }

        const departmentDetail = [];
        let departmentInfoData;
        try {
          departmentInfoData = await this.wechatWorkContactsService.getAllDepartmentList();
        } catch (err) {
          departmentInfoData = {};
        }
        if (!departmentInfoData.errcode) {
          for (const item of userInfoData.department) {
            departmentDetail.push(
              flatten(getPathById(item, departmentInfoData.department)),
            );
          }
        }

        // 注意有些字段仅通讯录secret能取到
        const userData = {
          userId: userIdData.UserId,
          name: userInfoData.name,
          email: userInfoData.email,
          avatar: userInfoData.avatar,
          thumb_avatar: userInfoData.thumb_avatar,
          departmentDetail,
        };

        const jwtToken = sign(userData, jwtSecret, {
          expiresIn: tokenExpires,
        });
        return res.cookie(tokenName, jwtToken, {
          httpOnly: true,
          secure: false,
          expires: new Date(Date.now() + tokenExpires * 1000),
        }).redirect(loginSuccessPath);
      } else {
        if (req.query.state) {
          loginFailPathObj.query.result = AuthFailResult.UserRejectQrCode;
          return res.redirect(queryString.stringifyUrl(loginFailPathObj));
        } else {
          return res.redirect(
            `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${encodeURIComponent(
              returnDomainName + loginPath,
            )}&state=STATE`,
          );
        }
      }
    } else if (req.route.path === logoutPath) {
      // 如果当前请求是访问 logoutPath，则清空 cookie 然后跳转至 loginSuccessPath。
      return res.clearCookie(tokenName).redirect(loginSuccessPath);
    } else {
      next();
    }
  }
}
