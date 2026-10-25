# [plugin-add] dsh-doc-review

## 插件地址 / Plugin link

- npm：`dsh-doc-review` — https://www.npmjs.com/package/dsh-doc-review
- 源码：https://github.com/nickzhangcomes/dsh-doc-review

## 简短说明 / Summary

为 DeepSeek Harness 的模型回复添加多处批注、文档阅读、评论线程和正文修订，并将阅读摘要带回主对话。

Review DeepSeek Harness responses with inline annotations, document reading, comment threads, and text revisions, then bring a reading summary back to the main conversation.

## 补充信息 / Additional details

- 维护者：nickzhangcomes。
- 已发布 npm 版本：0.1.1；MIT 许可证。
- 兼容性声明：DSH `>=0.2.1-rc.3`；已验证宿主 `0.2.1-rc.3`。插件界面为中文，提供中英文 README。
- `package.json` 声明 `dsh.bundle.patch`，发布包包含 `cordis.patch.yml` 和预构建入口。
- 0.1.1 修复批注浮层拦截桌面窗口拖动的问题。macOS 本机已验证批注输入、发送条、文档模式、标题栏缩放；用户已确认实际鼠标拖动恢复。没有据此宣称 Windows、Linux 或未来宿主版本已经验收。
- 4 张演示截图及顺序：https://github.com/nickzhangcomes/dsh-doc-review/blob/main/screenshots.json
- 数据访问与模型调用说明：https://github.com/nickzhangcomes/dsh-doc-review#数据访问与模型调用
- 文档评论由 DSH 配置的模型处理并消耗 token；审阅记录保存在本地 `localStorage`，不提供跨设备同步。
