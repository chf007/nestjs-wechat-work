import {
  Injectable,
  HttpException,
  HttpService,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WechatWorkConfig } from '../wechat-work.config';
import {
  AccessTokenInfo,
  Result,
  WechatWorkData,
  AgentType,
} from '../interfaces';

@Injectable()
export class WechatWorkBaseService {
  private readonly logger = new Logger(WechatWorkBaseService.name);
  public readonly config: WechatWorkConfig;
  private accessTokenInfo: AccessTokenInfo;
  public apiServer = 'https://qyapi.weixin.qq.com';

  constructor(
    config: WechatWorkConfig,
    private readonly httpService: HttpService,
  ) {
    this.config = config;
  }

  async getAccessToken(agentType: AgentType): Promise<string> {
    const {
      corpId,
      agentSecret,
      contactsSecret,
      telephoneSecret,
      scheduleSecret,
      customerSecret,
      attendanceSecret,
      approvalSecret,
      hongbaoSecret,
    } = this.config.baseConfig;

    let secret = '';
    // 优先使用通讯录secret
    if (agentType === AgentType.Custom) {
      secret = agentSecret;
    }
    if (agentType === AgentType.Contacts) {
      secret = contactsSecret ? contactsSecret : agentSecret;
    }
    if (agentType === AgentType.Telephone) {
      secret = telephoneSecret;
    }
    // 优先使用日程secret 自建应用要先将自建应用配置到“可调用接口的应用”里
    if (agentType === AgentType.Schedule) {
      secret = scheduleSecret ? scheduleSecret : agentSecret;
    }
    // 优先使用外部联系人secret
    if (agentType === AgentType.Customer) {
      secret = customerSecret ? customerSecret : agentSecret;
    }
    if (agentType === AgentType.Attendance) {
      secret = attendanceSecret;
    }
    // 优先使用审批应用secret
    if (agentType === AgentType.Approval) {
      secret = approvalSecret ? approvalSecret : agentSecret;
    }
    if (agentType === AgentType.Hongbao) {
      secret = hongbaoSecret;
    }

    if (!secret) {
      throw new HttpException(
        `[getAccessToken] must be set agentType: ${agentType}'s secret`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !this.accessTokenInfo ||
      (this.accessTokenInfo &&
        Date.now() - this.accessTokenInfo.getTime >
          this.accessTokenInfo.expiresIn * 1000)
    ) {
      this.logger.log(`[getAccessToken] use api`);

      const result = await this.httpService
        .get(
          `${
            this.apiServer
          }/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`,
        )
        .toPromise();

      if (result.data.errcode) {
        this.logger.error(
          `[getAccessToken] errcode: ${result.data.errcode}, errmsg: ${
            result.data.errmsg
          }`,
        );
        throw new HttpException(
          `[getAccessToken] errcode: ${result.data.errcode}, errmsg: ${
            result.data.errmsg
          }`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.accessTokenInfo = {
        accessToken: result.data.access_token,
        expiresIn: result.data.expires_in,
        getTime: Date.now(),
      };
    }

    return this.accessTokenInfo.accessToken;
  }

  async getUserId(code: string): Promise<Result & WechatWorkData> {
    if (!code) {
      this.logger.log(`[getUserId] code cannot be empty`);
      throw new HttpException(
        '[getUserId] code cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    const accessToken = await this.getAccessToken(AgentType.Contacts);
    const result = await this.httpService
      .get(
        `${
          this.apiServer
        }/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`,
      )
      .toPromise();

    if (result.data.errcode) {
      this.logger.error(
        `[getUserId] errcode: ${result.data.errcode}, errmsg: ${
          result.data.errmsg
        }`,
      );
      throw new HttpException(
        `[getUserId] errcode: ${result.data.errcode}, errmsg: ${
          result.data.errmsg
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }
}
