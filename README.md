# NestJS WechatWorkModule

企业微信 NestJS 工具包，目前主要包括企业微信 API 的 Service 封装、登录校验守卫(JWT实现)、扫码登录支持等功能。

## 安装

```bash
npm install nestjs-wechat-work
```

## 使用

```
// 导入 Module
import { Module } from '@nestjs/common';
import { WechatWorkModule } from 'nestjs-wechat-work';

@Module({
  imports: [
    WechatWorkModule.register({
      baseConfig: {
        corpId: 'xxx', // 企业微信企业ID 必填
        secret: 'xxx', // 企业微信应用密钥 必填
        agentId: 'xxx', // 企业微信应用ID 必填
      },
      authConfig: {
        returnDomainName: 'https://admin.xxx.com', // 扫码回跳域名 必填
        loginPath: '/login', // 登陆处理
        logoutPath: '/logout', // 登出处理
        loginSuccPath: '/', // 登陆成功后跳转地址
        loginFailPath: '/login-fail.html', // 登陆失败后跳转地址，可以应用中自定义
        noRedirectPath: '/api/', // 哪些地址不直接跳转而是将控制权交给前端
      },
    }),
  ],
  providers: [],
})
export class AppModule {}

// 使用 Service 和 Guard
import { Controller, Get, UseGuards, } from '@nestjs/common';
import { WechatWorkService, AuthGuard, } from 'nestjs-wechat-work';

@Controller('api')
export class SomeController {
  constructor(private readonly wechatWorkService: WechatWorkService) {}

  @UseGuards(AuthGuard)
  @Get('test')
  async test() {
    return await this.wechatWorkService.getUserInfo('userId');
  }
}

```

