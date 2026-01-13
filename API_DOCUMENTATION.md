# 📖 Documentação da ZapUnlocked-API

Esta API permite o envio de mensagens e botões via WhatsApp, além do gerenciamento da sessão via QR Code.

## 🔐 Autenticação

Todas as rotas (exceto o status principal `/`) requerem a passagem da chave de API no header da requisição.

- **Header:** `x-api-key`
- **Valor:** Deve ser o mesmo definido na variável de ambiente `API_KEY`.

---

### Enviar Imagem (via URL)
`POST /send_image`

Envia uma imagem a partir de uma URL pública. A imagem é baixada temporariamente e removida logo após o envio.

```json
{
  "phone": "555185867410",
  "image_url": "https://exemplo.com/imagem.jpg",
  "caption": "Legenda opcional"
}
```

### Enviar Áudio (via URL)
`POST /send_audio`

Envia um áudio. Se for menor que 15MB, envia como áudio padrão (ou PTT). Se for maior, envia como documento.

**Body:**
```json
{
  "phone": "555185867410",
  "audio_url": "https://exemplo.com/audio.mp3",
  "ptt": true,
  "asDocument": false
}
```
- `ptt`: Se `true`, aparece como mensagem de voz (apenas para arquivos pequenos).
- `asDocument`: Força o envio como arquivo.

### Enviar Vídeo (via URL)
`POST /send_video`

Envia um vídeo. Se for menor que 15MB, envia como vídeo normal (com compressão). Se for maior, envia como documento (alta qualidade).

**Body:**
```json
{
  "phone": "555185867410",
  "video_url": "https://exemplo.com/video.mp4",
  "caption": "Legenda do vídeo",
  "gifPlayback": false,
  "ptv": false,
  "asDocument": false
}
```
- `gifPlayback`: Envia como um GIF (sem som).
- `ptv`: Envia como vídeo redondo (curto).
- `asDocument`: Força o envio como documento (2GB limit).

### Enviar Documento (via URL)
`POST /send_document`

Envia qualquer tipo de arquivo (PDF, DOCX, ZIP, etc). Limite de 400MB configurado na API (suporta até 2GB no protocolo).

**Body:**
```json
{
  "phone": "555185867410",
  "document_url": "https://exemplo.com/doc.pdf",
  "fileName": "nome_personalizado.pdf"
}
```

---

## 🚀 Endpoints de Mensagens

### 1️⃣ Enviar Mensagem de Texto
Envia uma mensagem simples para um número de WhatsApp.

- **URL:** `/send`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Sua mensagem aqui 💌"
}
```

### 2️⃣ Enviar Mensagem com Botão Customizado
Envia uma mensagem contendo um botão interativo.

- **URL:** `/send_wbuttons`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Escolha uma opção:",
  "button_text": "Texto do Botão",
  "webhook": {
    "url": "https://meuservico.com/webhook",
    "method": "POST",
    "headers": {
      "x-api-key": "SUA_CHAVE",
      "Content-Type": "application/json"
    },
    "body": {
      "event": "button_click",
      "user": "{{from}}",
      "button": "{{text}}",
      "data": "valor_fixo"
    }
  }
}
```

#### Placeholders Disponíveis no Body/Headers:
- `{{from}}`: Número de quem clicou (ex: `5511999999999`).
- `{{text}}`: Texto do botão (ex: `Texto do Botão`).
- `{{timestamp}}`: Data/hora atual (ISO format).

---

## 📲 Endpoints de QR Code & Sessão

### 1️⃣ Página do QR Code (HTML)
Acessa a interface visual para escanear o QR Code no navegador.

- **URL:** `/qr`
- **Método:** `GET`
- **Autenticação:** Sim (Header `x-api-key`)

### 2️⃣ Imagem do QR Code (PNG)
Obtém apenas a imagem do QR Code em formato PNG.

- **URL:** `/qr/image`
- **Método:** `GET`
- **Autenticação:** Sim (Header `x-api-key`)

### 3️⃣ Logout (Apagar Sessão)
Desconecta o WhatsApp e remove os arquivos de sessão do servidor.

- **URL:** `/qr/logout`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)

---

## 📊 Endpoints Gerais

### 1️⃣ Status da API
Verifica se o servidor e o WhatsApp estão online.

- **URL:** `/`
- **Método:** `GET`
- **Autenticação:** Não
- **Resposta:**
```json
{
  "status": "online",
  "whatsapp": "connected",
  "timestamp": "2026-01-13T01:47:07.000Z"
}
```
