import {
  Injectable,
  HttpException,
  HttpService,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Result, WechatWorkData, AgentType, WechatWorkConfig } from '../interfaces';
import { WechatWorkBaseService } from './wechat-work-base.service';
import { WECHAT_WORK_MODULE_CONFIG } from '../constants';

@Injectable()
export class WechatWorkContactsService {
  private readonly logger = new Logger(WechatWorkContactsService.name);
  public apiServer = 'https://qyapi.weixin.qq.com';

  constructor(
    @Inject(WECHAT_WORK_MODULE_CONFIG) private readonly config: WechatWorkConfig,
    private readonly httpService: HttpService,
    private readonly wechatWorkBaseService: WechatWorkBaseService,
  ) {}

  // 成员管理
  async getUserInfo(userId: string): Promise<Result & WechatWorkData> {
    if (!userId) {
      this.logger.log(`[getUserInfo] userId cannot be empty`);
      throw new HttpException('[getUserInfo] userId cannot be empty', HttpStatus.BAD_REQUEST);
    }
    const accessToken = await this.wechatWorkBaseService.getAccessToken(AgentType.Contacts);
    const result = await this.httpService.get(
      `${this.apiServer}/cgi-bin/user/get?access_token=${accessToken}&userid=${userId}`
    ).toPromise();

    if (result.data.errcode) {
      this.logger.error(
        `[getUserInfo] errcode: ${result.data.errcode}, errmsg: ${
          result.data.errmsg
        }`,
      );
      throw new HttpException(`[getUserInfo] errcode: ${result.data.errcode}, errmsg: ${
        result.data.errmsg
      }`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.data;
  }

  // 部门管理
  async getDepartmentList(id: number): Promise<Result & WechatWorkData> {
    if (!id) {
      this.logger.log(`[getDepartmentList] userId cannot be empty`);
      throw new HttpException('[getDepartmentList] userId cannot be empty', HttpStatus.BAD_REQUEST);
    }
    const accessToken = await this.wechatWorkBaseService.getAccessToken(AgentType.Contacts);
    const result = await this.httpService.get(
      `${this.apiServer}/cgi-bin/department/list?access_token=${accessToken}&id=${id}`
    ).toPromise();

    if (result.data.errcode) {
      this.logger.error(
        `[getDepartmentList] errcode: ${result.data.errcode}, errmsg: ${
          result.data.errmsg
        }`,
      );
      throw new HttpException(`[getDepartmentList] errcode: ${result.data.errcode}, errmsg: ${
        result.data.errmsg
      }`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.data;
  }

  async getAllDepartmentList(): Promise<Result & WechatWorkData> {
    const accessToken = await this.wechatWorkBaseService.getAccessToken(AgentType.Contacts);
    const result = await this.httpService.get(
      `${this.apiServer}/cgi-bin/department/list?access_token=${accessToken}`
    ).toPromise();

    if (result.data.errcode) {
      this.logger.error(
        `[getAllDepartmentList] errcode: ${result.data.errcode}, errmsg: ${
          result.data.errmsg
        }`,
      );
      throw new HttpException(`[getAllDepartmentList] errcode: ${result.data.errcode}, errmsg: ${
        result.data.errmsg
      }`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.data;
  }

}
