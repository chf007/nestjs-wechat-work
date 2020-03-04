export interface BaseConfig {
  corpId: string;
  secret: string;
  agentId: string;
};

export interface AuthConfig {
  returnDomainName: string;
  loginPath?: string;
  logoutPath?: string;
  loginSuccPath?: string;
  loginFailPath?: string;
  noRedirectPath?: string;
};

export class WechatWorkConfig {
  baseConfig: BaseConfig;
  authConfig?: AuthConfig;
}
