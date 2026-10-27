# DSH Markup 市场资料与更名记录

2026-10-27：本项目由 `dsh-doc-review` 更名为 **`dsh-markup`**，展示名为 **DSH Markup · 对话批注与文档审阅**。这是同一项目的延续，旧 GitHub 地址重定向到新仓库。新版本为 `0.2.0`；GitHub Release 与本地构建已完成，npm 发布等待重新登录，目录更名申请已提交；提交不等于市场已上线新名。

## 项目资料

- 源码：https://github.com/nickzhangcomes/dsh-markup
- 新 npm 包：https://www.npmjs.com/package/dsh-markup（0.2.0 尚未发布，等待 npm 重新登录）
- 原 npm 包：`dsh-doc-review@0.1.1`，新包发布确认后标注迁移提示。
- 许可证：MIT。
- 宿主声明：DSH `>=0.2.1-rc.3`。旧版已在 macOS DSH 0.2.1-rc.3 验证桌面拖动；Windows、Linux 未独立验证。
- 包含 `dsh.bundle.patch`、顶层数组格式的 `cordis.patch.yml` 和预构建 `lib/`。
- 截图：[screenshots.json](../../screenshots.json)，4 张原有演示图。
- 迁移说明：[中文 README](../../README.md#020-更名与迁移) / [English README](../../README.en.md#upgrade-from-dsh-doc-review)。原存储键与持久化引用标识保留。
- 数据说明：[中文 README](../../README.md#数据访问与模型调用) / [English README](../../README.en.md#data-access-and-model-calls)。模型调用经 DSH 配置的模型服务，可能消耗 token。

中文简介：为 DeepSeek Harness 的模型回复添加多处批注、文档阅读、评论线程和正文修订，并将阅读摘要带回主对话。

English summary: Review DeepSeek Harness responses with inline annotations, document reading, comment threads, and text revisions, then bring a reading summary back to the main conversation.

新安装命令：`dsh plugin --profile desktop add dsh-markup@latest`；网页 profile 将 `desktop` 换成 `web`。已装旧包请先按 README 的迁移步骤处理，避免新旧包同时启用。

## 原收录记录与更名进度

| 市场 | 原记录 | 更名处理 |
| --- | --- | --- |
| Open Plugin Market | [Issue #76](https://github.com/polang233/dsh-plugin-index/issues/76)，维护者已确认接收 | [更名资料已回复](https://github.com/polang233/dsh-plugin-index/issues/76#issuecomment-6446775249)，待维护者更新 |
| deepseekharnessplugins.com | [PR #40](https://github.com/cccakeee/awesome-dsh-plugins/pull/40) | 已在同一 PR 更新新名和固定 Git 安装来源，解决与最新 main 的冲突；9 项测试通过，待合并 |
| DSHDesk | [Issue #92](https://github.com/majiayu000/dsh-plugin-registry/issues/92)，旧名已上线 | [更名资料已回复](https://github.com/majiayu000/dsh-plugin-registry/issues/92#issuecomment-6446777443)，待更新生产条目 |
| DeepSeek 1024 | [原 PR #690](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/pull/690)，已合并 | [更名 PR #729](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/pull/729)，静态检查通过，待维护者审核 |
| dsh-market | [原 PR #9552](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/9552)，已合并 | [更名 PR #9913](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/9913)，本地条目校验和 GitHub 两项自动检查通过，待审核 |
| DSHFind | [旧名条目](https://dshfind.com/zh/plugins/nickzhangcomes/dsh-doc-review)，已自动发现 | [迁移 Issue #58](https://github.com/hikariming/dshfind/issues/58)，请求维护者保留历史数据并添加旧 URL 重定向 |

原两项一次性投稿任务 `dsh-market` 和 `dshfind` 均已完成并删除。更名申请不重复增加第二个功能相同的条目；具体是否上线以各市场实际记录为准。

## 目录规则与投稿材料

- Open Plugin Market：[资料](open-plugin-market.md)、[贡献指南](https://github.com/polang233/dsh-plugin-index/blob/main/.github/CONTRIBUTING.md)。
- dsh-market：[条目 YAML](awesome-dsh-plugin.yml)、[贡献指南](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)。条目为 `data/plugins/nickzhangcomes__dsh-markup.yml`；不手动修改生成的 README，不添加目录自动识别的 `npm:` 字段。
- deepseekharnessplugins.com：[贡献指南](https://github.com/cccakeee/awesome-dsh-plugins/blob/main/docs/CONTRIBUTING.zh-CN.md)，维护 CSV 后由脚本生成展示文档。
- DeepSeek 1024：[贡献指南](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/CONTRIBUTING.md)，维护单个 JSON 条目，不手动修改生成的 README。
- DSHFind：[自动发现规则](https://github.com/hikariming/dshfind#submit-your-plugin)。旧名首次发现时间为 `2026-10-26T03:54:50.593Z`，核对时类型和 npm 安装探测尚未得出结果。

所有匹配都以 **`nickzhangcomes/dsh-markup`**（曾用名 `nickzhangcomes/dsh-doc-review`）为准，避免混淆其他作者的同名旧项目。不宣称目录推荐或独立安全审计。

## 本机更名验收

2026-10-27：web 和 desktop profile 均已安装 `dsh-markup@0.2.0`，旧包不再列为依赖。桌面详情显示新名称、版本和 `1 total · 1 running`，原会话可见文档模式入口。桌面图形安装器等待网络未完成，改由该应用自带的插件管理接口、同一 pnpm 版本从本地缓存安装成功，保留供应链校验、兼容性检查和激活流程。
