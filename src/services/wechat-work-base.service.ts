import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  AccessTokenInfo,
  Result,
  WechatWorkData,
  AgentType,
  WechatWorkConfig,
} from '../interfaces';
import {
  WECHAT_WORK_API_SERVER_HOST,
  WECHAT_WORK_MODULE_NAME,
} from '../constants';
import { MODULE_OPTIONS_TOKEN } from '../wechat-work.module-definition';

@Injectable()
export class WechatWorkBaseService {
  private readonly logger = new Logger(WechatWorkBaseService.name);
  private accessTokenInfo: AccessTokenInfo;
  public apiServer = WECHAT_WORK_API_SERVER_HOST;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly config: WechatWorkConfig,
    private readonly httpService: HttpService,
  ) {}

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
    if (agentType === AgentType.Custom) {
      secret = agentSecret;
    }
    if (agentType === AgentType.Contacts) {
      secret = contactsSecret;
    }
    if (agentType === AgentType.Telephone) {
      secret = telephoneSecret;
    }
    if (agentType === AgentType.Schedule) {
      secret = scheduleSecret;
    }
    if (agentType === AgentType.Customer) {
      secret = customerSecret;
    }
    if (agentType === AgentType.Attendance) {
      secret = attendanceSecret;
    }
    if (agentType === AgentType.Approval) {
      secret = approvalSecret;
    }
    if (agentType === AgentType.Hongbao) {
      secret = hongbaoSecret;
    }

    if (!secret) {
      throw new HttpException(
        `[${WECHAT_WORK_MODULE_NAME}][getAccessToken] must be set agentType: ${agentType}'s secret`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !this.accessTokenInfo ||
      (this.accessTokenInfo &&
        Date.now() - this.accessTokenInfo.getTime >
          this.accessTokenInfo.expiresIn * 1000)
    ) {
      this.logger.log(`[${WECHAT_WORK_MODULE_NAME}][getAccessToken] use api`);

      const result = await this.httpService
        .get(
          `${this.apiServer}/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`,
        )
        .toPromise();

      if (result.data.errcode) {
        this.logger.error(
          `[${WECHAT_WORK_MODULE_NAME}][getAccessToken] errcode: ${result.data.errcode}, errmsg: ${result.data.errmsg}`,
        );
        throw new HttpException(
          `[${WECHAT_WORK_MODULE_NAME}][getAccessToken] errcode: ${result.data.errcode}, errmsg: ${result.data.errmsg}`,
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
      this.logger.log(
        `[${WECHAT_WORK_MODULE_NAME}][getUserId] code cannot be empty`,
      );
      throw new HttpException(
        '[getUserId] code cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }
    const accessToken = await this.getAccessToken(AgentType.Custom);
    const result = await this.httpService
      .get(
        `${this.apiServer}/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`,
      )
      .toPromise();

    if (result.data.errcode) {
      this.logger.error(
        `[${WECHAT_WORK_MODULE_NAME}][getUserId] errcode: ${result.data.errcode}, errmsg: ${result.data.errmsg}`,
      );
      throw new HttpException(
        `[getUserId] errcode: ${result.data.errcode}, errmsg: ${result.data.errmsg}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }
}
