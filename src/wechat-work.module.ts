import { DynamicModule, Global, Module, HttpModule, MiddlewareConsumer, RequestMethod, Provider } from '@nestjs/common';
import { WechatWorkBaseService, WechatWorkContactsService, WechatWorkAuthService } from './services';
import { WechatWorkAuthMiddleware } from './middleware';
import { WechatWorkAsyncConfig, WechatWorkConfig, WechatWorkConfigFactory } from './interfaces';
import { WECHAT_WORK_MODULE_CONFIG } from './constants';
import { createWechatWorkConfigProvider } from './wechat-work.providers';

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
      providers: createWechatWorkConfigProvider(config),
    };
  }

  static registerAsync(config: WechatWorkAsyncConfig): DynamicModule {
    return {
      module: WechatWorkModule,
      imports: config.imports || [],
      providers: this.createAsyncProviders(config),
    };
  }

  private static createAsyncProviders(
    config: WechatWorkAsyncConfig,
  ): Provider[] {
    if (config.useExisting || config.useFactory) {
      return [this.createAsyncConfigProvider(config)];
    }
    return [
      this.createAsyncConfigProvider(config),
      {
        provide: config.useClass,
        useClass: config.useClass,
      },
    ];
  }

  private static createAsyncConfigProvider(
    config: WechatWorkAsyncConfig,
  ): Provider {
    if (config.useFactory) {
      return {
        provide: WECHAT_WORK_MODULE_CONFIG,
        useFactory: config.useFactory,
        inject: config.inject || [],
      };
    }
    return {
      provide: WECHAT_WORK_MODULE_CONFIG,
      useFactory: async (configFactory: WechatWorkConfigFactory) =>
        await configFactory.createWechatWorkConfig(),
      inject: [config.useExisting || config.useClass],
    };
  }

  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(WechatWorkAuthMiddleware).forRoutes('*');
  }
}
