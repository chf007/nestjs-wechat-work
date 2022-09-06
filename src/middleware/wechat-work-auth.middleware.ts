import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import * as queryString from 'query-string';
import { WechatWorkBaseService, WechatWorkContactsService } from '../services';
import { DEFAULT_TOKEN_EXPIRES, DEFAULT_TOKEN_NAME } from '../constants';
import { AuthFailResult, AuthType, WechatWorkConfig } from '../interfaces';
import { flatten, getPathById } from '../utils';
import { MODULE_OPTIONS_TOKEN } from '../wechat-work.module-definition';

@Injectable()
export class WechatWorkAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly config: WechatWorkConfig,
    private readonly wechatWorkBaseService: WechatWorkBaseService,
    private readonly wechatWorkContactsService: WechatWorkContactsService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    const { corpId, agentId } = this.config.baseConfig;
    const {
      type = AuthType.COOKIE,
      returnDomainName,
      loginPath,
      logoutPath,
      loginSuccessPath,
      loginFailPath,
      tokenName = DEFAULT_TOKEN_NAME,
      tokenExpires = DEFAULT_TOKEN_EXPIRES,
      jwtSecret,
      cookieHttpOnly = true,
    } = this.config.authConfig;
    const loginFailPathObj = queryString.parseUrl(loginFailPath);

    if (req.baseUrl === loginPath) {
      // 如果当前请求是访问 loginPath，如传入 code 则校验企业微信用户信息如正确则生成 jwt token，写入 cookie，然后跳转至 loginSuccessPath，如失败则跳至 loginFailPath；如直接访问，则直接跳转至企业微信扫码页。
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
          departmentInfoData =
            await this.wechatWorkContactsService.getAllDepartmentList();
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

        // 注意有些字段仅通讯录 secret 能取到
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

        const parsedPath = queryString.parseUrl(loginSuccessPath, {
          parseFragmentIdentifier: true,
        });
        // 可以在 loginPath 中加一个 _loginFrom 参数，在 loginSuccessPath 中附上该参数，loginSuccessPath 可以再跳转到 _loginFrom 的地址
        // _loginFrom 可以是任意地址，loginSuccessPath 再跳要做好白名单控制
        if (req.query._loginFrom) {
          parsedPath.query._loginFrom = req.query._loginFrom as string;
        }
        if (type === AuthType.COOKIE) {
          return res
            .cookie(tokenName, jwtToken, {
              httpOnly: cookieHttpOnly,
              secure: false,
              expires: new Date(Date.now() + tokenExpires * 1000),
            })
            .redirect(queryString.stringifyUrl(parsedPath));
        } else if (type === AuthType.CALLBACK_TOKEN) {
          parsedPath.query[tokenName] = jwtToken;
          return res.redirect(queryString.stringifyUrl(parsedPath));
        }
      } else {
        loginFailPathObj.query.result = req.query.state
          ? AuthFailResult.UserRejectQrCode
          : AuthFailResult.NoCode;
        return res.redirect(queryString.stringifyUrl(loginFailPathObj));
      }
    } else if (req.baseUrl === logoutPath) {
      // 如果当前请求是访问 logoutPath，则清空 cookie 然后跳转至 loginSuccessPath。
      if (type === AuthType.COOKIE) {
        return res.clearCookie(tokenName).redirect(loginSuccessPath);
      }
      // 其他类型 loginSuccessPath 自行处理
      return res.redirect(loginSuccessPath);
    } else {
      next();
    }
  }
}
