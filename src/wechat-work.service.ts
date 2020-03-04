import { Injectable, Logger } from '@nestjs/common';
import { WechatWorkConfig } from './wechat-work.config';

@Injectable()
export class WechatWorkService {
  public readonly config: WechatWorkConfig;
  apollo: any;

  constructor(config: WechatWorkConfig) {
    this.config = config;

    
  }

}
