# dsh-doc-review

把模型的长回复当成一份稿子来审：**原地批注、像读文档一样阅读、让 Agent 直接改正文**。一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）插件。

## 解决什么问题

模型给了一大段回复，你有好几处想说的：这句不对、那段太啰嗦、这里讲得好别动。平时只能在输入框里复制原文、写"第二段那句……"，一条一条描述位置，又累又容易漏；想就某一句追问，又怕把主对话带偏；模型改完之后，也看不出到底改了哪。

这个插件让你**直接在回复上标注**，然后一次性发回去；或者把回复**打开成文档**，边读边高亮、评论，让 Agent 在评论里回答、直接改正文。

## 能做什么

### 对话模式：原地批注，一次发回

![对话模式批注](https://raw.githubusercontent.com/nickzhangcomes/dsh-doc-review/v0.1.0/docs/screenshots/1-conversation.png)

- 选中回复里的任意文字，弹出工具栏：**评论**（主操作）、**认可**、**反对**（一键，理由可选）。
- 批注以卡片形式显示在回复右侧，原文对应位置会被标出。
- 底部发送条选择发送方式：**逐条回应**（模型按编号逐条答复）或 **出修订版**（模型输出修改后的完整版本）。
- 发出的消息在对话里折叠成一张小卡片，不会刷屏；点开可以看全文。

### 文档模式：像读文档一样读回复

点回复下方的 **以文档模式阅读**，回复会在 dsh 里打开成一份文档，不跳转。

![文档模式](https://raw.githubusercontent.com/nickzhangcomes/dsh-doc-review/v0.1.0/docs/screenshots/2-docmode.png)

- **高亮**：标记讲得好的地方（再选中可以取消高亮）。
- **评论**：评论以线程形式显示在右侧边栏。Agent 默认在线程里回复（开关会记住你的选择，也可以在评论里写 @Agent）。
- **直接改正文**：在评论里说"帮我改简洁一点""删掉这句"，Agent 会直接修改文档，修改处会闪一下，随时可以**撤销**。
- 所有评论共享同一份上下文，Agent 知道你在别处问过什么。
- 右上角的评论面板可以按 **未解决 / 已解决** 查看全部评论。

### 读完带回主对话

退出文档模式时会问你要不要把这次阅读带回主会话：

![带回主会话](https://raw.githubusercontent.com/nickzhangcomes/dsh-doc-review/v0.1.0/docs/screenshots/3-exit.png)

选 **带回主会话** 后，阅读摘要（高亮、评论、讨论、修订后的全文）会作为参考材料附在输入框上方，随你的下一条消息一起发给 Agent：

![摘要附在输入框上方](https://raw.githubusercontent.com/nickzhangcomes/dsh-doc-review/v0.1.0/docs/screenshots/4-bring-back.png)

## 安装

需要 dsh **0.2.1-rc.3** 或更新版本；当前验证版本为 **0.2.1-rc.3**。

从 GitHub 安装：

```bash
# 桌面版
dsh plugin --profile desktop add github:nickzhangcomes/dsh-doc-review

# 网页版
dsh plugin --profile web add github:nickzhangcomes/dsh-doc-review
```

也可以从 [Releases](https://github.com/nickzhangcomes/dsh-doc-review/releases) 下载 `.tgz` 安装包，再运行：

```bash
dsh plugin --profile desktop add file:/path/to/dsh-doc-review-0.1.0.tgz
```

将 `/path/to/` 替换为安装包所在目录的完整路径。npm 发布后，可使用 `dsh plugin --profile desktop add dsh-doc-review` 按包名安装。

安装后**重启桌面版**（或刷新网页）。profile 名称以你本机为准，可以用 `ls ~/.dsh/profiles` 查看。

卸载：`dsh plugin --profile desktop remove dsh-doc-review`

## 说明

- 文档模式里的 Agent 回复，来自从当前对话分出的一个临时会话（侧边栏会出现"文档模式 · …"），会正常消耗 token；退出文档模式后它会自动归档。
- 批注、高亮和评论保存在本机浏览器存储里，不会跨设备同步。
- 窗口较窄、回复右侧放不下卡片时，批注会收成编号标记，点击查看。
- 插件用到了 dsh 的一些内部接口，dsh 升级后如有异常，请更新插件或提 issue。

## 本地开发

使用 Node.js 20 或更新版本，在项目目录运行：

```bash
npm ci
npm run build
npm pack
```

`npm pack` 会先重新构建，确保安装包包含最新代码。

## License

MIT
