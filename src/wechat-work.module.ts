import { DynamicModule, Global, Module, HttpModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { WechatWorkConfig } from './wechat-work.config';
import { WechatWorkBaseService, WechatWorkContactsService, WechatWorkAuthService } from './services';
import { WechatWorkAuthMiddleware } from './middleware';

@Global()
@Module({
  imports: [HttpModule],
  providers: [WechatWorkBaseService, WechatWorkContactsService, WechatWorkAuthService, WechatWorkConfig],
  exports: [WechatWorkBaseService, WechatWorkContactsService, WechatWorkAuthService, WechatWorkConfig],
})
export class WechatWorkModule {
  constructor(private readonly config: WechatWorkConfig) {}
  static register(config: WechatWorkConfig): DynamicModule {
    return {
      module: WechatWorkModule,
      providers: [
        {
          provide: WechatWorkConfig,
          useValue: config,
        },
      ],
    };
  }
  configure(consumer: MiddlewareConsumer) {
    if (this.config.authConfig) {
      consumer
      .apply(WechatWorkAuthMiddleware)
      .forRoutes(
        { path: this.config.authConfig.loginPath, method: RequestMethod.GET },
        { path: this.config.authConfig.logoutPath, method: RequestMethod.GET },
      );
    }
  }
}
