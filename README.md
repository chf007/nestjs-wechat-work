# NestJS WechatWorkModule

企业微信 NestJS 工具包，目前主要包括企业微信 API 的 Service 封装、登录校验守卫(JWT实现)、扫码登录支持等功能。

> access_token 缓存在内存中，每次调用企业微信 API 时先检查缓存，如果过期或失效则重新获取并缓存起来。
> 多实例应用各自维护缓存，机器少的情况下应该不会超出企业微信 API 频率限制。如果机器数很多，说明业务搞大了，恭喜你，到时候请换用别的解决方案或者 fork 代码自行扩展功能，例如使用中心化服务或使用 redis 缓存。

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

