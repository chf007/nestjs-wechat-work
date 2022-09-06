import { Global, Module, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  WechatWorkBaseService,
  WechatWorkContactsService,
  WechatWorkAuthService,
} from './services';
import { WechatWorkAuthMiddleware } from './middleware';
import { ConfigurableModuleClass } from './wechat-work.module-definition';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    WechatWorkBaseService,
    WechatWorkContactsService,
    WechatWorkAuthService,
  ],
  exports: [
    WechatWorkBaseService,
    WechatWorkContactsService,
    WechatWorkAuthService,
  ],
})
export class WechatWorkModule extends ConfigurableModuleClass {
  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(WechatWorkAuthMiddleware).forRoutes('*');
  }
}
