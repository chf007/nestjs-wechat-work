import { WechatWorkConfig } from './interfaces';
import { WECHAT_WORK_MODULE_CONFIG } from './constants';

export function createWechatWorkConfigProvider(
  config: WechatWorkConfig,
): any[] {
  return [{ provide: WECHAT_WORK_MODULE_CONFIG, useValue: config || {} }];
}
