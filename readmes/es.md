# <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/es.svg" width="40"> [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

## ¿Qué es [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)?

**[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** es una solución profesional, **100% gratuita y de código abierto**, diseñada para transformar WhatsApp en una poderosa herramienta de automatización. Construida sobre el motor de **Baileys**, esta API ofrece una interfaz REST simple para gestionar sesiones, enviar medios complejos y crear interacciones inteligentes sin necesidad de una base de datos pesada.

> [!TIP]
> Perfecto para desarrolladores que buscan agilidad en la integración de bots, notificaciones y sistemas de atención automatizados.

---


## 🚀 Funcionalidades Destacadas

- **Botones Stateless**: Cree flujos interactivos sin necesidad de base de datos, con webhooks cifrados.
- **Emparejamiento sin QR**: Conéctese mediante código numérico, ideal para servidores sin GUI o cámaras.
- **Conversión Automática de Audio**: Envíe audios que aparecen como mensajes de voz grabados (PTT) de forma nativa en iOS y Android.
- **Cola de Medios Inteligente**: Gestión automática para evitar el consumo excesivo de memoria.
- **Placeholders Dinámicos**: Personalice mensajes y webhooks con variables como `{{name}}`, `{{day}}` y `{{phone}}`.

---

## 🛤️ Rutas Principales

### 📨 Envío de Mensajes
- `POST /send` - Enviar Mensaje de Texto
- `POST /send_reaction` - Enviar Reacción con Emoji
- `POST /send_wbuttons` - Enviar Mensaje con Botón (Stateless)
- `POST /send_sticker` - Enviar Sticker
- `POST /send_image` - Enviar Imagen
- `POST /send_video` - Enviar Video
- `POST /send_audio` - Enviar Audio (con conversión automática)
- `POST /send_document` - Enviar Documento

### 🔍 Consultas y Gestión
- `POST /contacts/info` - Información Detallada del Contacto
- `GET /fetch_messages` - Buscar Historial de Mensajes
- `GET /recent_contacts` - Listar Contactos Recientes
- `GET /management/volume_stats` - Verificar Uso de Disco
- `DELETE /management/cleanup` - Limpiar Historial de Mensajes

### 🔗 Conexión y Sesión
- `GET /status` - Estado de la Conexión y Sesión
- `GET /qr` - Ver Código QR Interactivo
- `GET /qr/image` - Obtener Imagen del QR (Base64)
- `POST /qr/pair` - Generar Código de Emparejamiento Numérico
- `POST /qr/logout` - Desconectar y Resetear Sesión

### 📡 Webhooks (Globales)
- `POST /webhook/config` - Configurar URL del Webhook
- `POST /webhook/toggle` - Activar/Desactivar Recepción
- `DELETE /webhook/delete` - Eliminar Configuración

### ⚙️ Perfil y Privacidad
- `POST /settings/profile` - Cambiar Nombre y Foto del Bot
- `POST /settings/privacy` - Ajustar Privacidad (Visto por última vez, etc.)
- `POST /settings/block` - Bloquear/Desbloquear Contacto

---

## 🚂 Hosting 100% Gratis en Railway ☁️

Esta API ha sido optimizada para ser alojada **totalmente gratis** a través de **Railway**. Aprovecha los recursos del plan Free para mantener tu bot online 24/7 sin costes de servidor.

👉 **[Haz clic aquí para ver la guía de configuración en Railway](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 Documentación Oficial

Para documentación técnica detallada, ejemplos de código y playground interactivo, acceda a nuestro sitio oficial.

👉 **[Acceda a la Documentación Oficial](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ Créditos y Agradecimientos

Este proyecto solo es posible gracias al increíble trabajo de la comunidad de código abierto:

- **[Itsukichan](https://github.com/itsukichann/baileys)**: Por el fantástico fork de Baileys que ayuda por la facilidad de crear funciones siguiendo la documentación.
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**: La biblioteca base que revolucionó la conexión con WhatsApp.
- **[Railway](https://railway.app/)**: Por proporcionar infraestructura gratuita de alta calidad (1 vCPU, 0.5GB RAM y 500MB de almacenamiento en el plan Free).

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Siéntase libre de usar, modificar y distribuir el código. Para más detalles, consulte el archivo [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE).

---

Hecho con 💜 por [Kauã Ferreira](https://www.instagram.com/kauafpss_/).

**¡Diviértete automatizando con [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)!** 😎📱🚀

👉 **[Volver al README principal](../README.md)**
