export interface AccessTokenInfo {
  getTime: number;
  expiresIn: number;
  accessToken: string;
}

export enum AuthType {
  COOKIE = 'COOKIE',
  CALLBACK_TOKEN = 'CALLBACK_TOKEN',
}

export enum AgentType {
  Custom = 'Custom',
  Contacts = 'Contacts',
  Telephone = 'Telephone',
  Schedule = 'Schedule',
  Customer = 'Customer',
  Attendance = 'Attendance',
  Approval = 'Approval',
  Hongbao = 'Hongbao',
}

// 身份校验失败原因
export enum AuthFailResult {
  UserRejectQrCode = 'UserRejectQrCode', // 用户扫码未通过
  QueryUserIdFail = 'QueryUserIdFail', // 查询用户 ID 失败
  QueryUserInfoFail = 'QueryUserInfoFail', // 查询用户信息失败
  UserInactive = 'UserInactive', // 当前用户被禁用或未激活
  NoCode = 'NoCode', // 企业微信未返回 code
}

export interface Result {
  errcode: number;
  errmsg: string;
}

export interface WechatWorkData {
  [key: string]: any;
}

export interface BaseConfig {
  corpId: string;
  agentId?: string;
  agentSecret?: string;
  contactsSecret?: string;
  telephoneSecret?: string;
  scheduleSecret?: string;
  customerSecret?: string;
  attendanceAgentId?: string;
  attendanceSecret?: string;
  approvalAgentId?: string;
  approvalSecret?: string;
  hongbaoAgentId?: string;
  hongbaoSecret?: string;
}

export interface AuthConfig {
  type?: AuthType;
  returnDomainName: string;
  loginPath?: string;
  logoutPath?: string;
  loginSuccessPath?: string;
  loginFailPath?: string;
  noRedirectPaths?: string[];
  tokenName?: string;
  tokenExpires?: number;
  jwtSecret: string;
  cookieHttpOnly?: boolean;
}

export interface WechatWorkConfig {
  baseConfig: BaseConfig;
  authConfig?: AuthConfig;
}
