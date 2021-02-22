# Changelog

## [Unreleased]

## [1.0.5] - 2021-02-22
### Added
- 增加 registerAsync 以支持异步配置

### Changed
- 由于异步配置无法在中间件中使用，所以中间的的适用路由放开到所有
- 配置的注入方式由 Class 改为 Inject
- 查询通讯录接口由使用通讯录 secret 变为应用 secret
