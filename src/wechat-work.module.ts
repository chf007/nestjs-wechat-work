import { DynamicModule, Global, Module, HttpModule } from '@nestjs/common';
import { WechatWorkConfig } from './wechat-work.config';
import { WechatWorkBaseService, WechatWorkContactsService } from './services';

@Global()
@Module({
  imports: [HttpModule],
  providers: [WechatWorkBaseService, WechatWorkContactsService, WechatWorkConfig],
  exports: [WechatWorkBaseService, WechatWorkContactsService, WechatWorkConfig],
})
export class WechatWorkModule {
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
}
