# 🚀 [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io) 📲✨

![ZapUnlocked-API Banner](https://github.com/zKauaFerreira/ZapUnlocked-API/raw/refs/heads/documentation/images/hero-dark.svg)

<p align="center">
  <img src="https://img.shields.io/github/stars/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Stars">
  <img src="https://img.shields.io/github/forks/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Forks">
  <img src="https://img.shields.io/github/repo-size/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="Repo Size">
  <img src="https://img.shields.io/github/license/zKauaFerreira/ZapUnlocked-API?style=for-the-badge&logo=github&color=30A3E6" alt="License">
</p>

### 🌐 Select Language / Selecione o Idioma:

| English | Español | Français | Deutsch | 中文 | 日本語 | Русский |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/us.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/en.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/es.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/es.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/fr.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/fr.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/de.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/de.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/cn.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/zh.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/jp.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/ja.md) | [<img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/ru.svg" width="40">](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/readmes/ru.md) |

---

## <img src="https://github.com/lipis/flag-icons/raw/refs/heads/main/flags/4x3/br.svg" width="30"> O que é o [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)?

O **[ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)** é uma solução profissional, **100% gratuita e de código aberto**, projetada para transformar o WhatsApp em uma poderosa ferramenta de automação. Construída sobre o motor do **Baileys**, esta API oferece uma interface REST simples para gerenciar sessões, enviar mídias complexas e criar interações inteligentes sem a necessidade de um banco de dados pesado.

> [!TIP]
> Perfeito para desenvolvedores que buscam agilidade na integração de bots, notificações e sistemas de atendimento automatizados.

---


## 🚀 Funcionalidades em Destaque

- **Botões Stateless**: Crie fluxos interativos sem precisar de banco de dados, com webhooks criptografados.
- **Pareamento sem QR Code**: Conecte via código numérico, ideal para servidores sem interface gráfica ou câmeras.
- **Conversão Automática de Áudio**: Envie áudios que aparecem como gravados na hora (PTT) nativamente no iOS e Android.
- **Fila de Mídias Inteligente**: Gerenciamento automático para evitar o consumo excessivo de memória.
- **Placeholders Dinâmicos**: Personalize mensagens e webhooks com variáveis como `{{name}}`, `{{day}}` e `{{phone}}`.

---

## 🛤️ Principais Rotas

### 📨 Envio de Mensagens
- `POST /send` - Enviar Mensagem de Texto
- `POST /send_reaction` - Enviar Reação com Emoji
- `POST /send_wbuttons` - Enviar Mensagem com Botão (Stateless)
- `POST /send_sticker` - Enviar Figurinha
- `POST /send_image` - Enviar Imagem
- `POST /send_video` - Enviar Vídeo
- `POST /send_audio` - Enviar Áudio (com conversão automática)
- `POST /send_document` - Enviar Documento

### 🔍 Consultas e Gestão
- `POST /contacts/info` - Informações Detalhadas do Contato
- `GET /fetch_messages` - Buscar Histórico de Mensagens
- `GET /recent_contacts` - Listar Contatos Recentes
- `GET /management/volume_stats` - Verificar Uso de Disco
- `DELETE /management/cleanup` - Limpar Histórico de Mensagens

### 🔗 Conexão e Sessão
- `GET /status` - Status da Conexão e Sessão
- `GET /qr` - Visualizar QR Code Interativo
- `GET /qr/image` - Obter Imagem do QR Code (Base64)
- `POST /qr/pair` - Gerar Código de Pareamento Numérico
- `POST /qr/logout` - Desconectar e Resetar Sessão

### 📡 Webhooks (Globais)
- `POST /webhook/config` - Configurar URL do Webhook
- `POST /webhook/toggle` - Ativar/Desativar Recebimento
- `DELETE /webhook/delete` - Remover Configuração

### ⚙️ Perfil e Privacidade
- `POST /settings/profile` - Alterar Nome e Foto do Bot
- `POST /settings/privacy` - Ajustar Privacidade (Visto por último, etc)
- `POST /settings/block` - Bloquear/Desbloquear Contato

---

## 🚂 Hospedagem 100% Grátis na Railway ☁️

Esta API foi otimizada para ser hospedada **totalmente de graça** através da **Railway**. Aproveite os recursos do plano Free para manter seu bot online 24/7 sem custos de servidor.

👉 **[Clique aqui para ver o guia de configuração na Railway](https://zapdocs.kauafpss.qzz.io/essentials/quickstart)**

---

## 📖 Documentação Oficial

Para documentação técnica detalhada, exemplos de código e playground interativo, acesse nosso site oficial.

👉 **[Acesse a Documentação Oficial](https://zapdocs.kauafpss.qzz.io)**


---

## ❤️ Créditos & Agradecimentos

Este projeto só é possível graças ao incrível trabalho da comunidade open-source:

- **[Itsukichan](https://github.com/itsukichann/baileys)**: Pelo fantástico fork do Baileys que ajuda pela facilidade de criar funções seguindo a documentação.
- **[Baileys (WhiskeySockets)](https://github.com/WhiskeySockets/Baileys)**: A biblioteca base que revolucionou a conexão com o WhatsApp.
- **[Railway](https://railway.app/)**: Por disponibilizar infraestrutura gratuita de alta qualidade (1 vCPU, 0.5GB RAM e 500MB de armazenamento no plano Free).

---

## 📄 Licença

Este projeto é licenciado sob a **Licença MIT**. Sinta-se à vontade para usar, modificar e distribuir o código. Para mais detalhes, consulte o arquivo [LICENSE](https://github.com/zKauaFerreira/ZapUnlocked-API/blob/main/LICENSE).

---

Feito com 💜 por [Kauã Ferreira](https://www.instagram.com/kauafpss_/).

**Divirta-se automatizando com a [ZapUnlocked-API](https://zapdocs.kauafpss.qzz.io)!** 😎📱🚀
