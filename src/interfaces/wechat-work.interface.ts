export interface AccessTokenInfo {
  getTime: number;
  expiresIn: number;
  accessToken: string;
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
  UserRejectQrCode = 'UserRejectQrCode', // 扫码未通过
  QueryUserIdFail = 'QueryUserIdFail', // 查询用户ID失败
  QueryUserInfoFail = 'QueryUserInfoFail', // 查询用户信息失败
  UserInactive = 'UserInactive', // 当前用户被禁用或未激活
}

export interface Result {
  errcode: number;
  errmsg: string;
}

export interface WechatWorkData {
  [key: string]: any;
}
