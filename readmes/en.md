# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/us.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## What is [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)?

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** is a professional, **100% free and open-source** solution designed to transform WhatsApp into a powerful automation tool. Built on top of the **Baileys** engine, this API provides a simple REST interface to manage sessions, send complex media, and create intelligent interactions without the need for a heavy database.

> [!TIP]
> Perfect for developers looking for speed in integrating bots, notifications, and automated guest service systems.

---


## 🚀 Highlighted Features

- **Stateless Buttons**: Create interactive flows without needing a database, using encrypted webhooks.
- **Pairing Code (No QR)**: Connect via numerical code, ideal for servers without a GUI or cameras.
- **Automatic Audio Conversion**: Send audios that appear as recorded voice messages (PTT) natively on iOS and Android.
- **Smart Media Queue**: Automatic management to avoid excessive memory consumption.
- **Dynamic Placeholders**: Personalize messages and webhooks with variables like `{{name}}`, `{{day}}`, and `{{phone}}`.

---

## 🛤️ Main Routes

### 📨 Sending Messages
- `POST /send` - Send Text Message
- `POST /send_reaction` - Send Reaction with Emoji
- `POST /send_wbuttons` - Send Message with Button (Stateless)
- `POST /send_sticker` - Send Sticker
- `POST /send_image` - Send Image
- `POST /send_video` - Send Video
- `POST /send_audio` - Send Audio (with automatic conversion)
- `POST /send_document` - Send Document

### 🔍 Queries and Management
- `POST /contacts/info` - Detailed Contact Information
- `GET /fetch_messages` - Fetch Message History
- `GET /recent_contacts` - List Recent Contacts
- `GET /management/volume_stats` - Check Disk Usage
- `DELETE /management/cleanup` - Clear Message History

### 🔗 Connection and Session
- `GET /status` - Connection and Session Status
- `GET /qr` - View Interactive QR Code
- `GET /qr/image` - Get QR Code Image (Base64)
- `POST /qr/pair` - Generate Numerical Pairing Code
- `POST /qr/logout` - Disconnect and Reset Session

### 📡 Webhooks (Global)
- `POST /webhook/config` - Configure Webhook URL
- `POST /webhook/toggle` - Enable/Disable Receiving
- `DELETE /webhook/delete` - Remove Configuration

### ⚙️ Profile and Privacy
- `POST /settings/profile` - Change Bot Name and Photo
- `POST /settings/privacy` - Adjust Privacy (Last seen, etc.)
- `POST /settings/block` - Block/Unblock Contact

---

## 🚂 100% Free Hosting on Railway ☁️

This API has been optimized to be hosted **completely for free** through **Railway**. Take advantage of the Free plan resources to keep your bot online 24/7 with no server costs.

👉 **[Click here to see the Railway setup guide](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 Official Documentation

For detailed technical documentation, code examples, and interactive playground, visit our official website.

👉 **[Access the Official Documentation](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ Credits & Acknowledgements

This project is only possible thanks to the amazing work of the open-source community:

- **[Itsukichan](https://github.com/itsukichann/baileys)**: For the fantastic Baileys fork that helps with the ease of creating functions following the documentation.
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**: The base library that revolutionized connecting with WhatsApp.
- **[Railway](https://railway.app/)**: For providing high-quality free infrastructure (1 vCPU, 0.5GB RAM, and 500MB storage in the Free plan).

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute the code. For more details, see the [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE) file.

---

Made with 💜 by [Kauã Ferreira](https://www.instagram.com/kauafpss_/).

**Have fun automating with [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)!** 😎📱🚀

👉 **[Back to Main README](../README.md)**
