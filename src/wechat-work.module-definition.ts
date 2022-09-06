import { ConfigurableModuleBuilder } from '@nestjs/common';
import { WechatWorkConfig } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<WechatWorkConfig>()
    .setExtras<{ isGlobal?: boolean }>(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
