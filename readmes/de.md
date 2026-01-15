# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/de.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## Was ist [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)?

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** ist eine professionelle, **100 % kostenlose und quelloffene** Lösung, die entwickelt wurde, um WhatsApp in ein leistungsstarkes Automatisierungswerkzeug zu verwandeln. Basierend auf der **Baileys**-Engine bietet diese API eine einfache REST-Schnittstelle zur Sitzungsverwaltung, zum Senden komplexer Medien und zur Erstellung intelligenter Interaktionen, ohne dass eine schwere Datenbank erforderlich ist.

> [!TIP]
> Perfekt für Entwickler, die Schnelligkeit bei der Integration von Bots, Benachrichtigungen und automatisierten Kundensuchsystemen suchen.

---


## 🚀 Besondere Funktionen

- **Stateless Buttons**: Erstellen Sie interaktive Flows ohne Datenbank, mit verschlüsselten Webhooks.
- **Pairing Code (Kein QR)**: Verbindung über numerischen Code, ideal für Server ohne GUI oder Kameras.
- **Automatische Audiokonvertierung**: Senden Sie Audios, die nativ unter iOS und Android als aufgenommene Sprachnachrichten (PTT) erscheinen.
- **Intelligente Medien-Warteschlange**: Automatische Verwaltung zur Vermeidung von übermäßigem Speicherverbrauch.
- **Dynamische Platzhalter**: Personalisieren Sie Nachrichten und Webhooks mit Variablen wie `{{name}}`, `{{day}}` und `{{phone}}`.

---

## 🛤️ Hauptrouten

### 📨 Nachrichten Senden
- `POST /send` - Textnachricht Senden
- `POST /send_reaction` - Reaktion mit Emoji Senden
- `POST /send_wbuttons` - Nachricht mit Schaltfläche Senden (Stateless)
- `POST /send_sticker` - Sticker Senden
- `POST /send_image` - Bild Senden
- `POST /send_video` - Video Senden
- `POST /send_audio` - Audio Senden (mit automatischer Konvertierung)
- `POST /send_document` - Dokument Senden

### 🔍 Abfragen und Verwaltung
- `POST /contacts/info` - Detaillierte Kontaktinformationen
- `GET /fetch_messages` - Nachrichtenverlauf Abrufen
- `GET /recent_contacts` - Letzte Kontakte Auflisten
- `GET /management/volume_stats` - Festplattennutzung Überprüfen
- `DELETE /management/cleanup` - Nachrichtenverlauf Löschen

### 🔗 Verbindung und Sitzung
- `GET /status` - Verbindungs- und Sitzungsstatus
- `GET /qr` - Interaktiven QR-Code Anzeigen
- `GET /qr/image` - QR-Code-Bild Erhalten (Base64)
- `POST /qr/pair` - Numerischen Pairing-Code Generieren
- `POST /qr/logout` - Abmelden und Sitzung Zurücksetzen

### 📡 Webhooks (Global)
- `POST /webhook/config` - Webhook-URL Konfigurieren
- `POST /webhook/toggle` - Empfang Aktivieren/Deaktivieren
- `DELETE /webhook/delete` - Konfiguration Entfernen

### ⚙️ Profil und Datenschutz
- `POST /settings/profile` - Bot-Name und Foto Ändern
- `POST /settings/privacy` - Datenschutz Anpassen (Zuletzt online usw.)
- `POST /settings/block` - Kontakt Blockieren/Freigeben

---

## 🚂 100% Kostenloses Hosting auf Railway ☁️

Diese API wurde optimiert, um **vollständig kostenlos** über **Railway** gehostet zu werden. Nutzen Sie die Ressourcen des Free-Plans, um Ihren Bot rund um die Uhr ohne Serverkosten online zu halten.

👉 **[Klicken Sie hier, um die Railway-Konfigurationsanleitung zu sehen](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 Offizielle Dokumentation

Detaillierte technische Dokumentation, Codebeispiele und einen interaktiven Playground finden Sie auf unserer offiziellen Website.

👉 **[Zugriff auf die offizielle Dokumentation](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ Credits & Dankeschön

Dieses Projekt ist nur dank der unglaublichen Arbeit der Open-Source-Community möglich:

- **[Itsukichan](https://github.com/itsukichann/baileys)**: Für den fantastischen Baileys-Fork, der durch die einfache Erstellung von Funktionen gemäß der Dokumentation hilft.
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**: Die Basisbibliothek, die die Verbindung mit WhatsApp revolutioniert hat.
- **[Railway](https://railway.app/)**: Für die Bereitstellung hochwertiger kostenloser Infrastruktur (1 vCPU, 0,5 GB RAM und 500 MB Speicher im Free-Plan).

---

## 📄 Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert. Sie können den Code frei verwenden, ändern und verbreiten. Weitere Einzelheiten finden Sie in der Datei [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE).

---

Hergestellt mit 💜 von [Kauã Ferreira](https://www.instagram.com/kauafpss_/).

**Viel Spaß beim Automatisieren mit [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)!** 😎📱🚀

👉 **[Zurück zum Haupt-README](../README.md)**
