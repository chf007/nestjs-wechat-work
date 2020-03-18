# NestJS WechatWorkModule

企业微信 NestJS 工具包，目前主要包括企业微信 API 的 Service 封装、登录校验守卫(JWT实现)、扫码登录支持等功能。
适用于使用企业微信的团队基于 NestJS 开发小型管理后台用。

> access_token 缓存在内存中，每次调用企业微信 API 时先检查缓存，如果过期或失效则重新获取并缓存起来。

> 多实例应用各自维护缓存，机器少的情况下应该不会超出企业微信 API 频率限制。如果机器数很多，说明业务搞大了，恭喜你，到时候请换用别的解决方案或者 fork 代码自行扩展功能，例如使用中心化服务或使用 redis 缓存。

# 当前特性

WechatWorkBaseService   
WechatWorkContactsService
WechatWorkAuthGuard

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
        corpId: 'string', // 企业ID 必填
        agentId: 'string', // 自建应用ID
        agentSecret: 'string', // 自建应用secret
        contactsSecret: 'string', // 通讯录secret
        telephoneSecret: 'string', // 企业电话secret
        scheduleSecret: 'string', // 日程secret
        customerSecret: 'string', // 外部联系人secret
        attendanceAgentId: 'string', // 打卡agent
        attendanceSecret: 'string', // 打卡secret
        approvalAgentId: 'string', // 审批agentId
        approvalSecret: 'string', // 审批secret
        hongbaoAgentId: 'string', // 企业红包agentId
        hongbaoSecret: 'string', // 企业红包secret
      },
      authConfig: {
        returnDomainName: 'https://admin.xxx.com', // 扫码回跳域名 必填
        loginPath: '/login', // 登陆处理
        logoutPath: '/logout', // 登出处理
        loginSuccessPath: '/', // 登陆成功后跳转地址
        loginFailPath: '/login-fail.html', // 登陆失败后跳转地址，可以应用中自定义
        noRedirectPaths: [ // 哪些开头的地址不直接跳转而是将控制权交给前端，
          '/api/',
          '/apiv2/',
        ],
        tokenName: '_token', // token cookie name
        tokenExpires: 3600 * 24 * 7, // token 过期秒数
        jwtSecret: 'adsadsad', // jwt secret 必填
      },
    }),
  ],
  providers: [],
})
export class AppModule {}

// 使用 Service
import { Controller, Get, UseGuards, } from '@nestjs/common';
import { WechatWorkBaseService, WechatWorkContactsService, } from 'nestjs-wechat-work';

@Controller('api')
export class SomeController {
  constructor(private readonly wechatWorkBaseService: WechatWorkBaseService, private readonly wechatWorkContactsService: WechatWorkContactsService) {}

  @Get('test')
  async test() {
    return await this.wechatWorkContactsService.getUserInfo('wechatwork userId');
  }
}

// 使用 Auth
// 约定 
// 分为页面路由和API路由，页面路由如果没有登录直接跳企业微信扫码页，API路由如果没有登录只返回错误码，是否跳转由前端来决定
// noRedirectPath 用来配置API路由规则，符合此规则的不直接跳企业微信扫码页，只返回错误码，是否跳转由前端来决定
// 模块内 AuthController 会监控 loginPath 路由，如传入code则校验企业微信用户信息如正确则生成jwt token，写入cookie，然后跳转至 loginSuccessPath，如失败则跳至 loginFailPath；如直接访问，则直接跳转至企业微信扫码页。loginSuccessPath 和 loginFailPath 对应的页面要自已实现。
// 模块内 AuthController 会监控 logoutPath 路由，如访问，则清空 Cookie，跳转至 loginSuccessPath。前端也应相应处理。
// 用户基本信息会存储在 req 上下文中
import { Controller, Get, UseGuards, Req, Request, } from '@nestjs/common';
import { WechatWorkBaseService, WechatWorkContactsService, WechatWorkAuthGuard } from 'nestjs-wechat-work';

@Controller('api')
export class SomeController {
  constructor(private readonly wechatWorkBaseService: WechatWorkBaseService, private readonly wechatWorkContactsService: WechatWorkContactsService) {}

  @UseGuards(WechatWorkAuthGuard)
  @Get('test')
  async test(@Req() request: any) {
    return await this.wechatWorkContactsService.getUserInfo(request.user.userId);
  }
}


```

