# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/cn.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## 什么是 [[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)](https://zapdocs.kauafpss.qzz.io)？

**[[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)](https://zapdocs.kauafpss.qzz.io)** 是一个专业的、**100% 免费且开源**的解决方案，旨在将 WhatsApp 转换为强大的自动化工具。该 API 建立在 **Baileys** 引擎之上，提供简单的 REST 接口来管理会话、发送复杂媒体，并在无需繁重数据库的情况下创建智能交互。

> [!TIP]
> 非常适合寻求快速集成机器人、通知和自动客勤服务系统的开发人员。

---


## 🚀 特色功能

- **无状态按钮**：无需数据库即可创建交互式流，使用加密的 Webhook。
- **无需二维码配对**：通过数字代码连接，非常适合没有图形界面或摄像头的服务器。
- **自动音频转换**：发送在 iOS 和 Android 上原生显示为录制语音消息 (PTT) 的音频。
- **智能媒体队列**：自动管理，避免内存消耗过度。
- **动态占位符**：使用 `{{name}}`、`{{day}}` 和 `{{phone}}` 等变量个性化消息和 Webhook。

---

## 🛤️ 主要路由

### 📨 消息发送
- `POST /send` - 发送文本消息
- `POST /send_reaction` - 发送表情回应
- `POST /send_wbuttons` - 发送带按钮的消息 (无状态)
- `POST /send_sticker` - 发送贴纸
- `POST /send_image` - 发送图片
- `POST /send_video` - 发送视频
- `POST /send_audio` - 发送音频 (自动转换)
- `POST /send_document` - 发送文档

### 🔍 查询与管理
- `POST /contacts/info` - 联系人详细信息
- `GET /fetch_messages` - 获取消息历史
- `GET /recent_contacts` - 列出最近联系人
- `GET /management/volume_stats` - 检查磁盘使用情况
- `DELETE /management/cleanup` - 清除消息历史

### 🔗 连接与会话
- `GET /status` - 连接与会话状态
- `GET /qr` - 查看交互式二维码
- `GET /qr/image` - 获取二维码图片 (Base64)
- `POST /qr/pair` - 生成数字配对代码
- `POST /qr/logout` - 断开连接并重置会话

### 📡 Webhooks (全局)
- `POST /webhook/config` - 配置 Webhook URL
- `POST /webhook/toggle` - 启用/禁用接收
- `DELETE /webhook/delete` - 删除配置

### ⚙️ 个人资料与隐私
- `POST /settings/profile` - 修改机器人名称和照片
- `POST /settings/privacy` - 调整隐私设置 (最后上线等)
- `POST /settings/block` - 屏蔽/取消屏蔽联系人

---

## 🚂 在 Railway 上 100% 免费托管 ☁️

该 API 已针对通过 **Railway** 进行**完全免费**托管进行了优化。利用免费计划资源，让您的机器人 24/7 在线，无需支付服务器费用。

👉 **[点击此处查看 Railway 设置指南](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 官方文档

有关详细的技术文档、代码示例和交互式游乐场，请访问我们的官方网站。

👉 **[访问官方文档](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ 致谢与贡献

本项目得以实现，离不开开源社区的辛勤工作：

- **[Itsukichann](https://github.com/itsukichann/baileys)**：感谢出色的 Baileys 分支，它通过遵循文档轻松创建功能提供了帮助。
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**：彻底改变了与 WhatsApp 连接方式的基础库。
- **[Railway](https://railway.app/)**：感谢提供高质量的免费基础设施（免费计划提供 1 vCPU、0.5GB RAM 和 500MB 存储空间）。

---

## 📄 许可证

本项目采用 **MIT 许可证**。您可以自由使用、修改和分发代码。更多详情请参阅 [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE) 文件。

---

由 [Kauã Ferreira](https://www.instagram.com/kauafpss_/) 用 💜 制作。

**祝您在 [[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)](https://zapdocs.kauafpss.qzz.io) 的自动化旅程中玩得愉快！** 😎📱🚀

👉 **[返回主 README](../README.md)**
