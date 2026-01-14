# 📖 Documentação da ZapUnlocked-API

Esta API permite o envio de mensagens e botões via WhatsApp, além do gerenciamento da sessão via QR Code!

## 🔐 Autenticação

Todas as rotas requerem a passagem da chave de API no header da requisição ou parâmetro de URL (`API_KEY`).

- **Header:** `x-api-key`
- **Valor:** Deve ser o mesmo definido na variável de ambiente `API_KEY`.

---

## 🚀 Endpoints de Mensagens

### 1️⃣ Enviar Mensagem de Texto
Envia uma mensagem simples. Suporta resposta (reply) por ID ou por busca de texto.

- **URL:** `/send`
- **Método:** `POST`
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Sua mensagem aqui 💌",
  "reply": "texto da msg anterior OU id_da_msg", // (Opcional) Responde a uma mensagem
  "type": "text" // (Opcional) "text" para buscar por texto exato, ou "id" (padrão)
}
```
*Dica: Se `type` for `text`, a API buscará a mensagem mais recente enviada/recebida com aquele texto exato para responder.*

### 2️⃣ Enviar Mensagem com Botão
Envia mensagem com botão interativo e suporte a webhook.

- **URL:** `/send_wbuttons`
- **Método:** `POST`
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Escolha uma opção:",
  "button_text": "Confirmar",
  "reply": "texto ou ID", // (Opcional)
  "type": "text", // (Opcional) "text" ou "id"
  "reaction": "💖", // (Opcional) Reage ao clique
  "webhook": { ... } // (Opcional) Configuração de webhook
}
```

### 3️⃣ Reagir a uma Mensagem
Envia (ou remove) uma reação.

- **URL:** `/send_reaction`
- **Método:** `POST`
- **Body:**
```json
{
  "phone": "5511999999999",
  "reaction": "Texto Exato da Mensagem", // OU use "messageId": "ID..."
  "type": "text", // "text" ou "id"
  "emoji": "🔥" // Para remover a reação, envie string vazia ""
}
```

---

## 📲 Endpoints de Mídia

### 1️⃣ Enviar Imagem / Áudio / Vídeo / Documento / Sticker
Rotas para envio de mídia via URL pública.

- **POST** `/send_image`
- **POST** `/send_audio` (flags: `ptt`, `asDocument`)
- **POST** `/send_video` (flags: `ptv`, `gifPlayback`, `asDocument`)
- **POST** `/send_document`
- **POST** `/send_sticker`

*(Consulte os exemplos detalhados no README principal para payloads específicos)*

---

## ⚙️ Gerenciamento e Sessão

### 1️⃣ Status da API (Protegido)
Verifica status da conexão e retorna informações do QR Code.

- **URL:** `/status`
- **Método:** `GET`
- **Autenticação:** Sim

### 2️⃣ Logout
Desconecta o WhatsApp.

- **URL:** `/whatsapp/qr/logout`
- **Método:** `POST`
- **Body:**
```json
{
  "keepData": true // Se true, mantem histórico e apenas desconecta. Se false, apaga tudo.
}
```

### 3️⃣ QR Code
- **Página HTML:** `GET /qr`
- **Imagem PNG:** `GET /qr/image`

---

## 📂 Gerenciamento de Dados (Management)

### 1️⃣ Buscar Histórico de Mensagens
Busca mensagens salvas no disco (JSON GZIP).

- **URL:** `/management/fetch_messages`
- **Método:** `POST`
- **Body:**
```json
{
  "phone": "5511999999999",
  "limit": 50,
  "type": "all", // "sent", "received", "all"
  "query": "texto para buscar", // (Opcional) Filtra por conteúdo
  "onlyReactions": false, // (Opcional) Retorna só reações
  "reactionEmoji": "👍", // (Opcional) Filtra por emoji de reação
  "onlyButtons": false // (Opcional) Retorna só msgs com botões
}
```

### 2️⃣ Estatísticas de Volume
Retorna o tamanho ocupado pelos chats no disco.

- **URL:** `/management/volume_stats`
- **Método:** `GET`

### 3️⃣ Limpeza de Armazenamento
Apaga TODOS os dados de histórico e índices de chat do servidor.

- **URL:** `/management/cleanup`
- **Método:** `DELETE`
- **Atenção:** Ação irreversível.

### 4️⃣ Listar Chats Recentes
Retorna lista de contatos com atividade recente.

- **URL:** `/management/recent_contacts`
- **Método:** `POST`
- **Body:**
```json
{
  "limit": 100
}
```

---

## 🛡️ Configurações & Privacidade

### 1️⃣ Atualizar Privacidade e Perfil
Altera configurações de privacidade e o recado (status) do perfil.
Suporta variáveis de data/hora dinâmicas no recado.

- **URL:** `/settings/privacy`
- **Método:** `POST`
- **Body (Todos opcionais, envie ao menos um):**
```json
{
  "lastSeen": "contacts",     // "all", "contacts", "contact_blacklist", "none"
  "online": "match_last_seen",// "all", "match_last_seen"
  "readReceipts": "none",     // "all", "none" (Confirmação de Leitura)
  "profilePicture": "contacts",// "all", "contacts", "contact_blacklist", "none"
  "status": "contacts",       // Privacidade dos Stories
  "groupsAdd": "contacts",    // Quem pode adicionar em grupos
  "defaultDisappearingMode": 86400, // Mensagens temporárias (segundos) ou 0 para off
  
  // Recado do Perfil (Suporta placeholders)
  "about": "Online desde: {{day/mon/yea - hou:min}}" 
}
```
**Placeholders de Data:**
*   `{{day}}`, `{{mon}}`, `{{yea}}`: Dia, Mês, Ano
*   `{{hou}}`, `{{min}}`, `{{sec}}`: Hora, Minuto, Segundo

### 3️⃣ Alterar Meu Perfil (Nome e Foto)
- **URL:** `/settings/profile`
- **Método:** `POST`
- **Body (Opcionais, envie ao menos um):**
```json
{
  "name": "Novo Nome do Bot",
  "newProfilePictureUrl": "https://exemplo.com/nova_foto.jpg"
}
```

### 4️⃣ Bloquear/Desbloquear Usuário
- **URL:** `/settings/block`
- **Método:** `POST`
- **Body:**
```json
{
  "phone": "5511999999999",
  "action": "block" // "block" ou "unblock"
}
```

---

## 👤 Informações de Contatos

### 1️⃣ Obter Informações do Número
Busca foto de perfil, recado (status) e dados comerciais.

- **URL:** `/contacts/info`
- **Método:** `POST`
- **Body:**
```json
{
  "phone": "5511999999999"
}
```
**Retorno Exemplo:**
```json
{
  "success": true,
  "data": {
    "phone": "5511999999999",
    "jid": "5511999999999@s.whatsapp.net",
    "profilePictureUrl": "https://...",
    "status": "Busy",
    "businessProfile": null,
    "exists": true
  }
}
```

Permite configurar um webhook único que receberá todas as mensagens recebidas pelo bot.

### 1️⃣ Configurar Webhook
Define a URL e parâmetros. Cria o arquivo de configuração e ativa o envio.

- **URL:** `/webhook/config`
- **Método:** `POST`
- **Body:**
```json
{
  "url": "https://meusistema.com/receber",
  "method": "POST",
  "headers": { "Authorization": "Bearer 123" },
  "body": {
    "event": "nova_mensagem",
    "sender": "{{from}}",
    "conteudo": "{{text}}",
    "timestamp": "{{timestamp}}"
  },
  "enabled": true
}
```

#### Variáveis disponíveis para o Webhook:
*   `{{from}}` / `{{phone}}`: Número do remetente (ex: `551199...`)
*   `{{text}}`: Conteúdo da mensagem
*   `{{id}}`: ID único da mensagem do WhatsApp
*   `{{timestamp}}`: Data/hora do evento (ISO)

### 2️⃣ Alternar Status (On/Off)
Ativa ou desativa o envio sem perder a configuração.

- **URL:** `/webhook/toggle`
- **Método:** `POST`
- **Body:**
```json
{
  "status": "off" // ou "on"
}
```

### 3️⃣ Remover Webhook
Desativa e **apaga** o arquivo de configuração do servidor.

- **URL:** `/webhook`
- **Método:** `DELETE`
