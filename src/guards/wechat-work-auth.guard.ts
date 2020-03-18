import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WechatWorkAuthService } from '../services';

@Injectable()
export class WechatWorkAuthGuard implements CanActivate {
  private readonly logger = new Logger(WechatWorkAuthGuard.name);
  constructor(private readonly wechatWorkAuthService: WechatWorkAuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx: any = context.switchToHttp().getResponse();
    return this.wechatWorkAuthService.validateContext(ctx);
  }
}
