# 市场投稿资料

以下是作者资料、投稿记录和自动发现说明。dsh-market 状态更新于 2026-10-26 06:50 UTC；其他市场保留 2026-10-25 的核对记录。提交申请不等于审核通过。

## 投稿状态

| 市场 | 最近记录 | 后续处理 |
| --- | --- | --- |
| Open Plugin Market | [Issue #76](https://github.com/polang233/dsh-plugin-index/issues/76) 已提交 | 等维护者审核 |
| deepseekharnessplugins.com | [PR #40](https://github.com/cccakeee/awesome-dsh-plugins/pull/40) 已提交 | 等维护者合并，随后网站同步 |
| DSHDesk | [Issue #92](https://github.com/majiayu000/dsh-plugin-registry/issues/92) 已提交 | 等审核/定时同步；也支持 Topic 自动发现 |
| DeepSeek 1024 | [PR #690](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/pull/690) 静态检查通过且已合并 | 网站目录同步中；npm 安装识别由市场自动采集 |
| dsh-market | [PR #9552](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/9552) 于 2026-10-26 正式提交，自动检查运行中 | 等维护者审核、合并；一次性自动投稿任务已完成并删除 |
| DSHFind | 已具备公开仓库和 `dsh-plugin` Topic | 自动发现；两轮扫描后仍未收录才补交 Issue |

以上申请均可由维护者的 GitHub 账号提交，目前没有必须作者亲自填表的剩余入口。dsh-market 延后投稿已完成。仍保留一次 DSHFind 检查：纽约时间 2026-10-26 23:20（北京 10 月 27 日 11:20），若精确仓库仍未收录，按当时规则去重后补交 Issue。剩余检查是作者本机 Codex 的一次性任务，执行结果以实际回执为准。

市场中可能存在同名项目，应使用完整仓库标识 **`nickzhangcomes/dsh-doc-review`** 确认本插件，不能仅凭包名判断已收录。

## 插件资料

| 字段 | 内容 |
| --- | --- |
| 名称 / npm 包名 | `dsh-doc-review` |
| 维护者 | `nickzhangcomes` |
| 源码 | https://github.com/nickzhangcomes/dsh-doc-review |
| npm | https://www.npmjs.com/package/dsh-doc-review |
| 当前发布版本 | `0.1.1` |
| 许可证 | MIT |
| 宿主版本声明 | `>=0.2.1-rc.3` |
| 已验证宿主 | DSH `0.2.1-rc.3`；`0.1.1` 的窗口拖动修复在 macOS 桌面版验收 |
| 未独立验证 | Windows、Linux 桌面版及未来 DSH 版本 |
| 界面语言 | 中文；提供中英文说明文档 |
| 展示分类 | 界面增强 / UI Enhancements；兼具文档审阅功能 |
| 截图声明 | [screenshots.json](../../screenshots.json)，4 张截图 |

中文简介：为 DeepSeek Harness 的模型回复添加多处批注、文档阅读、评论线程和正文修订，并将阅读摘要带回主对话。

English summary: Review DeepSeek Harness responses with inline annotations, document reading, comment threads, and text revisions, then bring a reading summary back to the main conversation.

桌面安装：`dsh plugin --profile desktop add dsh-doc-review@latest`

网页安装：`dsh plugin --profile web add dsh-doc-review@latest`

数据说明：[中文 README](../../README.md#数据访问与模型调用) / [English README](../../README.en.md#data-access-and-model-calls)。插件读取会话内容并保存本地审阅记录；请求 Agent 回复时会通过 DSH 调用配置的模型服务，传入文档和评论并消耗 token。关闭 Agent 开关的评论可能在后续提问时作为上下文发送。

## Open Plugin Market

- [收录表单](https://github.com/polang233/dsh-plugin-index/issues/new?template=plugin-add.yml)
- [贡献指南](https://github.com/polang233/dsh-plugin-index/blob/main/.github/CONTRIBUTING.md)
- 可复制的标题和正文：[open-plugin-market.md](open-plugin-market.md)

## dsh-market / awesome-dsh-plugin

- 提交位置：[awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
- [贡献指南](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)
- [PR #9552](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/9552) 已提交：从最新上游 `main`（`a7ae7b2`）建立个人 Fork 的 `add-dsh-doc-review` 分支，仅新增 [awesome-dsh-plugin.yml](awesome-dsh-plugin.yml) 对应的 `data/plugins/nickzhangcomes__dsh-doc-review.yml`，没有提交生成的 README。
- 已重新核对当前贡献规则及 open/closed PR，没有本仓库的已有条目或重复申请。仓库创建于 `2026-10-25T06:29:57Z`，PR 创建于 `2026-10-26T06:50:19Z`，当时年龄为 **24 小时 20 分 22 秒**，满足 1 天门槛。
- 本地使用目录自带 `validateEntries` 校验通过，双语 README 生成和站点构建通过（6,897 条目、2 种语言）。GitHub 自动检查运行中，正式收录仍待维护者审核；不自行合并。
- npm 映射由目录自动读取发布包的 `repository` 字段；条目无需添加 `npm:` 字段。

## deepseekharnessplugins.com

- [提交规则](https://deepseekharnessplugins.com/zh/submit)
- 向 [cccakeee/awesome-dsh-plugins](https://github.com/cccakeee/awesome-dsh-plugins) 对应分类提交条目，合并后由网站同步。
- 目录现行规则以仓库内 [贡献指南](https://github.com/cccakeee/awesome-dsh-plugins/blob/main/docs/CONTRIBUTING.zh-CN.md) 为准：新增 `data/verified-plugins.csv` 条目，记录挂载证据、精确安装命令、许可证和数据流，再用 `scripts/generate_docs.py` 生成 README 与分类页。
- 本次 PR 包含 1 行 CSV 及 4 个生成文档，目录自带 9 项测试通过；没有刷新无关目录数据。

## DeepSeek 1024

- [贡献规则](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/CONTRIBUTING.md)：在 `catalog/plugins/` 新增单个 JSON，包含分类和中英文简介；不修改生成的 README。
- 本次条目通过官方静态校验，并由目标仓库自动合并。目录合并与网站同步是两个阶段。
- 同时支持 `dsh-plugin` Topic 自动发现；PR 提供明确分类和中英文展示资料，详见[数据来源](https://github.com/imsai-sh/awesome-deepseek-harness-plugins/blob/main/docs/plugin-discovery.md)。

## 自动发现目录

- [dshfind](https://github.com/hikariming/dshfind#submit-your-plugin)：通过公开仓库的 `dsh-plugin` Topic 自动发现，规则说明每天 02:17 UTC 同步。两个同步周期后仍未收录才开 Issue；本次已安排条件式补交。
- [dshdesk 收录规范](https://plugin.dshdesk.com/policy)：检查 Topic、公开非归档且非 Fork 的仓库、`dsh.bundle.patch` 和 YAML 结构；[发布页](https://plugin.dshdesk.com/publish)说明每 2 小时同步。本次已通过其官方 GitHub 备用入口补充资料，无需重复填站内表单。

本仓库已经包含可安装的 `dsh.bundle.patch`、顶层数组形式的 `cordis.patch.yml` 和预构建 `lib/`。审核描述应仅说明实际功能与验证范围，不宣称官方推荐或安全审计通过。
