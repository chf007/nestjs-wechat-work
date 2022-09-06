export const DEFAULT_TOKEN_NAME = '_token';
export const DEFAULT_TOKEN_EXPIRES = 3600 * 24 * 7;
export const WECHAT_WORK_MODULE_CONFIG = 'WECHAT_WORK_MODULE_CONFIG';
export const WECHAT_WORK_API_SERVER_HOST = 'https://qyapi.weixin.qq.com';
export const WECHAT_WORK_MODULE_NAME = 'nestjs-wechat-work';
export const wechatWorkQrCodePageUrl = (
  corpId: string,
  agentId: string,
  returnDomainName: string,
  loginPath: string,
  state = 'STATE',
) =>
  `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${encodeURIComponent(
    returnDomainName + loginPath,
  )}&state=${state}`;
