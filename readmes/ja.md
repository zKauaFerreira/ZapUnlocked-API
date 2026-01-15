# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/jp.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) とは何ですか？

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** は、WhatsApp を強力な自動化ツールに変えるために設計された、プロフェッショナルで **100% 無料かつオープンソース** のソリューションです。**Baileys** エンジンをベースに構築されたこの API は、セッション管理、複雑なメディアの送信、インテリジェントなインタラクションの作成を、重いデータベースを必要とせずに行えるシンプルな REST インターフェースを提供します。

> [!TIP]
> ボット、通知、自動ゲストサービスシステムの統合にスピードを求める開発者に最適です。

---


## 🚀 主な機能

- **ステートレスボタン**: 加密された webhook を使用して、データベースを必要とせずにインタラクティブなフローを作成できます。
- **QRコード不要のペアリング**: 数値コードで接続。GUIやカメラのないサーバーに最適です。
- **自動オーディオ変換**: iOSおよびAndroidで、録音された音声メッセージ（PTT）としてネイティブに表示されるオーディオを送信します。
- **スマートメディアキュー**: メモリの過剰消費を防ぐための自動管理。
- **動的プレースホルダー**: `{{name}}`、`{{day}}`、`{{phone}}` などの変数を使用して、メッセージや webhook をパーソナライズできます。

---

## 🛤️ 主要なルート

### 📨 メッセージ送信
- `POST /send` - テキストメッセージの送信
- `POST /send_reaction` - 絵文字でのリアクション送信
- `POST /send_wbuttons` - ボタン付きメッセージの送信 (ステートレス)
- `POST /send_sticker` - ステッカーの送信
- `POST /send_image` - 画像の送信
- `POST /send_video` - ビデオの送信
- `POST /send_audio` - オーディオの送信 (自動変換付き)
- `POST /send_document` - ドキュメントの送信

### 🔍 照会と管理
- `POST /contacts/info` - 連絡先の詳細情報
- `GET /fetch_messages` - メッセージ履歴の取得
- `GET /recent_contacts` - 最近の連絡先一覧
- `GET /management/volume_stats` - ディスク使用量の確認
- `DELETE /management/cleanup` - メッセージ履歴の削除

### 🔗 接続とセッション
- `GET /status` - 接続とセッションのステータス
- `GET /qr` - インタラクティブな QR コードを表示
- `GET /qr/image` - QR コード画像を取得 (Base64)
- `POST /qr/pair` - 数値ペアリングコードを生成
- `POST /qr/logout` - 切断してセッションをリセット

### 📡 Webhooks (グローバル)
- `POST /webhook/config` - Webhook URL の設定
- `POST /webhook/toggle` - 受信の有効化/無効化
- `DELETE /webhook/delete` - 設定の削除

### ⚙️ プロフィールとプライバシー
- `POST /settings/profile` - ボットの名前と写真を変更
- `POST /settings/privacy` - プライバシー設定の調整 (最終ログインなど)
- `POST /settings/block` - 連絡先のブロック/解除

---

## 🚂 Railway での 100% 無料ホスティング ☁️

この API は、**Railway** を通じて **完全に無料** でホストできるように最適化されています。Free プランの活用により、サーバー費用をかけずにボットを 24 時間 365 日オンラインに保つことができます。

👉 **[Railway セットアップガイドはこちら](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 公式ドキュメント

詳細な技術ドキュメント、コード例、インタラクティブなプレイグラウンドについては、公式ウェブサイトをご覧ください。

👉 **[公式ドキュメントにアクセス](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ クレジットと謝辞

このプロジェクトは、オープンソースコミュニティの素晴らしい活動のおかげで成り立っています。

- **[Itsukichann](https://github.com/itsukichann/baileys)**：ドキュメントに従って機能を簡単に作成できる、素晴らしい Baileys フォークに感謝します。
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**: WhatsApp との接続に革命を起こしたベースライブラリ。
- **[Railway](https://railway.app/)**: 高品質な無料インフラ（Free プランで 1 vCPU、0.5GB RAM、500MB ストレージ）の提供に感謝します。

---

## 📄 ライセンス

このプロジェクトは **MIT ライセンス** の下でライセンスされています。コードの使用、修正、配布は自由に行っていただけます。詳細については、[LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE) ファイルを参照してください。

---

[Kauã Ferreira](https://www.instagram.com/kauafpss_/) によって 💜 で制作。

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) での自動化をぜひお楽しみください！** 😎📱🚀

👉 **[メイン README に戻る](../README.md)**
