import { DynamicModule, Global, Module } from '@nestjs/common';
import { WechatWorkConfig } from './wechat-work.config';
import { WechatWorkService } from './wechat-work.service';

@Global()
@Module({
  imports: [],
  providers: [WechatWorkService, WechatWorkConfig],
  exports: [WechatWorkService, WechatWorkConfig],
})
export class CtripApolloClientModule {
  static register(config: WechatWorkConfig): DynamicModule {
    return {
      module: CtripApolloClientModule,
      providers: [
        {
          provide: WechatWorkConfig,
          useValue: config,
        },
      ],
    };
  }
}
