import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import * as cookie from 'cookie';
import { verify } from 'jsonwebtoken';
import { WechatWorkConfig } from '../interfaces';
import { DEFAULT_TOKEN_NAME, wechatWorkQrCodePageUrl } from '../constants';
import { MODULE_OPTIONS_TOKEN } from '../wechat-work.module-definition';

interface JwtPayload {
  userId: string;
}

@Injectable()
export class WechatWorkAuthService {
  private readonly logger = new Logger(WechatWorkAuthService.name);
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly config: WechatWorkConfig,
  ) {}

  async validateContext(ctx: any): Promise<boolean> {
    // noRedirectPaths 开头的地址跳转控制权交给前端
    let isNoRedirectPath = false;

    for (const item of this.config.authConfig.noRedirectPaths) {
      if (ctx.req.route.path.indexOf(item) === 0) {
        isNoRedirectPath = true;
        break;
      }
    }

    let token = '';
    // 先从 cookie 中取 token
    const tokenName = this.config.authConfig.tokenName || DEFAULT_TOKEN_NAME;
    const cookies = cookie.parse(ctx.req.headers.cookie || '');
    const tokenFromCookie = cookies[tokenName] || '';

    if (tokenFromCookie) {
      token = tokenFromCookie;
    } else {
      // 如果 cookie 中没有 token 再从 header 中取 authorization
      const authorizationStr = ctx.req.headers && ctx.req.headers.authorization;

      if (!authorizationStr) {
        if (isNoRedirectPath) {
          throw new HttpException('Not found token', HttpStatus.UNAUTHORIZED);
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

    ctx.req.user = await this.validateUserToken(token, ctx, isNoRedirectPath);
    return true;
  }

  /**
   * 验证token是否有效
   * @param token String
   * @param ctx
   * @param isNoRedirectPath
   */
  async validateUserToken(token: string, ctx: any, isNoRedirectPath: boolean) {
    try {
      const verifiedToken = verify(
        token,
        this.config.authConfig.jwtSecret,
      ) as JwtPayload;
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

  redirectWechatWorkQrCodePage(ctx: any): void {
    const { corpId, agentId } = this.config.baseConfig;
    const { returnDomainName, loginPath } = this.config.authConfig;
    ctx.redirect(
      wechatWorkQrCodePageUrl(corpId, agentId, returnDomainName, loginPath),
    );
  }
}
