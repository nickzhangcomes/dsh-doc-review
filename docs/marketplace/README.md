# 市场投稿资料

以下是作者资料和可复用的投稿草稿，不代表已经提交、审核通过或获得市场背书。规则核对日期：2026-10-25。

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
- 将 [awesome-dsh-plugin.yml](awesome-dsh-plugin.yml) 作为 `data/plugins/nickzhangcomes__dsh-doc-review.yml` 加入目录仓库并提交 PR；不要手工修改其生成的 README。
- 当前规则要求目标仓库创建满 1 天。仓库创建于 `2026-10-25T06:29:57Z`，满 24 小时为纽约时间 **2026-10-26 02:29:57**，应在此之后提交并重新核对当时规则。
- npm 映射由目录自动读取发布包的 `repository` 字段；条目无需添加 `npm:` 字段。

## deepseekharnessplugins.com

- [提交规则](https://deepseekharnessplugins.com/zh/submit)
- 向 [cccakeee/awesome-dsh-plugins](https://github.com/cccakeee/awesome-dsh-plugins) 对应分类提交条目，合并后由网站同步。
- 中文条目草稿：

```markdown
- [dsh-doc-review](https://github.com/nickzhangcomes/dsh-doc-review) — 为模型回复添加多处批注、文档阅读、评论线程和正文修订，并将阅读摘要带回主对话。
```

## 自动发现目录

- [dshfind](https://github.com/hikariming/dshfind#submit-your-plugin)：通过公开仓库的 `dsh-plugin` Topic 自动发现；同步并不保证即时收录。
- [dshdesk 收录规范](https://plugin.dshdesk.com/policy)：检查 Topic、公开非归档仓库及 `dsh.bundle.patch` 和 YAML 结构；可在[发布页](https://plugin.dshdesk.com/publish)补充审核资料。

本仓库已经包含可安装的 `dsh.bundle.patch`、顶层数组形式的 `cordis.patch.yml` 和预构建 `lib/`。审核描述应仅说明实际功能与验证范围，不宣称官方推荐或安全审计通过。
