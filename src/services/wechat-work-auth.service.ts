import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { verify } from 'jsonwebtoken';
import { WechatWorkConfig } from '../wechat-work.config';
import { DEFAULT_TOKEN_NAME } from '../constants';

@Injectable()
export class WechatWorkAuthService {
  private readonly logger = new Logger(WechatWorkAuthService.name);
  public readonly config: WechatWorkConfig;
  constructor(config: WechatWorkConfig) {
    this.config = config;
  }

  async validateContext(ctx: any) {
    // noRedirectPaths 开头的地址跳转控制权交给前端
    let isNoRedirectPath = false;

    for (const item of this.config.authConfig.noRedirectPaths) {
      if (ctx.req.route.path.indexOf(item) === 0) {
        isNoRedirectPath = true;
        break;
      }
    }

    let token = '';
    // 先从cookie中取token
    const tokenName = this.config.authConfig.tokenName || DEFAULT_TOKEN_NAME;
    const cookies = cookie.parse(ctx.req.headers.cookie);
    const tokenFromCookie = cookies[tokenName] || '';

    if (tokenFromCookie) {
      token = tokenFromCookie;
    } else {
      // 如果cookie中没有token再从header中取authorization
      const authorizationStr = ctx.req.headers && ctx.req.headers.authorization;

      if (!authorizationStr) {
        if (isNoRedirectPath) {
          return false;
        } else {
          this.redirectWechatWorkQrCodePage(ctx);
        }
      }

      const [bearer, tokenFromAuthorization] = authorizationStr.split(' ');
      if (bearer !== 'Bearer' || !tokenFromAuthorization) {
        if (isNoRedirectPath) {
          throw new HttpException('Not found token', HttpStatus.UNAUTHORIZED);
        } else {
          this.redirectWechatWorkQrCodePage(ctx);
        }
      }

      token = tokenFromAuthorization;
    }

    if (!token) {
      if (isNoRedirectPath) {
        throw new HttpException('Not found token', HttpStatus.UNAUTHORIZED);
      } else {
        this.redirectWechatWorkQrCodePage(ctx);
      }
    }

    const user = await this.validateUserToken(token, ctx, isNoRedirectPath);
    ctx.req.user = user;
    return true;
  }

  /**
   * 验证token是否有效
   * @param token String
   */
  async validateUserToken(token: string, ctx: any, isNoRedirectPath: boolean) {
    try {
      const verifiedToken = verify(token, this.config.authConfig.jwtSecret);
      if (!verifiedToken || !verifiedToken.userId) {
        if (isNoRedirectPath) {
          throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        } else {
          this.redirectWechatWorkQrCodePage(ctx);
        }
      }
      return verifiedToken;
    } catch (e) {
      if (isNoRedirectPath) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      } else {
        this.redirectWechatWorkQrCodePage(ctx);
      }
    }
  }

  redirectWechatWorkQrCodePage(ctx: any) {
    const { corpId, agentId } = this.config.baseConfig;
    const { returnDomainName, loginPath } = this.config.authConfig;
    ctx.redirect(
      `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${encodeURIComponent(
        returnDomainName + loginPath,
      )}&state=STATE`,
    );
  }
}
