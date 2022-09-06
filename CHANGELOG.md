# Changelog

## [Unreleased]

## [9.0.0] - 2022-09-06

### Changed
- 升级依赖
- 换用 pnpm 管理依赖
- 支持 NestJS V9
- 主版本号规则向 NestJS 主版号对齐
- 使用 `ConfigurableModuleBuilder` 优化配置逻辑
- tslint 换用 eslint

## [1.2.0] - 2021-12-13
### Added
- 新增 cookieHttpOnly 配置，默认为 true

### Changed
- 可以在 loginPath 中加一个 loginFrom 参数，在 loginSuccessPath 中附上该参数，loginSuccessPath 可以再跳转到 loginFrom 的地址（loginFrom 可以是任意地址，loginSuccessPath 要做好白名单控制）

## [1.1.0] - 2021-04-08
### Added
- 除 cookie 模式以外，支持 callback_token 模式以适应前后端分离场景

### Changed
- 无

## [1.0.5] - 2021-02-22
### Added
- 增加 registerAsync 以支持异步配置

### Changed
- 由于异步配置无法在中间件中使用，所以中间的的适用路由放开到所有
- 配置的注入方式由 Class 改为 Inject
- 查询通讯录接口由使用通讯录 secret 变为应用 secret
