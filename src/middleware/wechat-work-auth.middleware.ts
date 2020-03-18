import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { WechatWorkConfig } from '../wechat-work.config';
import { WechatWorkBaseService } from '../services';
import { DEFAULT_TOKEN_NAME, DEFAULT_TOKEN_EXPIRES } from '../constants';

@Injectable()
export class WechatWorkAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: WechatWorkConfig,
    private readonly wechatWorkBaseService: WechatWorkBaseService,
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

    if (req.route.path === loginPath) {
      // 如果当前请求是访问 loginPath，如传入code则校验企业微信用户信息如正确则生成jwt token，写入cookie，然后跳转至 loginSuccessPath，如失败则跳至 loginFailPath；如直接访问，则直接跳转至企业微信扫码页。
      if (req.query.code) {
        let userData;
        try {
          userData = await this.wechatWorkBaseService.getUserId(
            req.query.code,
          );
        } catch (err) {
          userData = {};
        }
        if (!userData.UserId) {
          res.redirect(loginFailPath);
        }

        const jwtToken = sign({ userId: userData.UserId }, jwtSecret, {
          expiresIn: tokenExpires,
        });
        res.cookie(tokenName, jwtToken, {
          httpOnly: true,
          secure: false,
          expires: new Date(Date.now() + tokenExpires * 1000),
        }).redirect(loginSuccessPath);
      } else {
        if (req.query.state) {
          res.redirect(loginFailPath);
        } else {
          res.redirect(
            `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${encodeURIComponent(
              returnDomainName + loginPath,
            )}&state=STATE`,
          );
        }
      }
    } else if (req.route.path === logoutPath) {
      // 如果当前请求是访问 logoutPath，则清空 cookie 然后跳转至 loginSuccessPath。
      res.clearCookie(tokenName);
      res.redirect(loginSuccessPath);
    } else {
      next();
    }
  }
}
