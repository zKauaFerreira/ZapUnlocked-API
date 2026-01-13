# 🚂 Configuração para Railway

## ⚠️ IMPORTANTE: Persistência de Sessão

A pasta `auth_info` contém as credenciais da sessão do WhatsApp que **mudam constantemente**. 
**NUNCA** faça commit desta pasta no Git!

## 📋 Passos para Configurar na Railway

### 1. Adicionar Volume Persistente

1. No painel da Railway, vá em **Volumes**
2. Clique em **+ New Volume**
3. Configure:
   - **Mount Path**: `/data/auth_info`
   - **Name**: `whatsapp-auth`

### 2. Configurar Variáveis de Ambiente

1. Vá em **Variables**
2. Adicione as seguintes variáveis:

   | Variável | Valor Sugerido / Descrição |
   | :--- | :--- |
   | `AUTH_DIR` | `/data/auth_info` (Caminho do volume montado) |
   | `API_KEY` | Sua senha de acesso à API (ex: `7fA9QmL...`) |
   | `PORT` | `3000` (Opcional, a Railway define automaticamente) |

### 3. Deploy

Agora a pasta `auth_info` será persistida no volume e não será perdida em novos deploys!

## 🔄 Alternativa: Usar Diretório Temporário (NÃO RECOMENDADO)

Se não usar volumes, a sessão será perdida a cada deploy. 
Neste caso, você precisará escanear o QR code novamente após cada deploy.

## 📲 Como Fazer Login (Escanear QR Code)

### Opção 1: Via Navegador (Recomendado)

1. Após fazer o deploy, acesse a URL do seu projeto na Railway
2. Adicione `/qr` no final da URL:
   ```
   https://seu-projeto.railway.app/qr
   ```
3. Uma página HTML será exibida com o QR Code
4. Abra o WhatsApp no celular:
   - Vá em **Configurações** → **Aparelhos conectados**
   - Toque em **Conectar um aparelho**
   - Escaneie o QR Code exibido na página

### Opção 2: Via Imagem Direta

Acesse diretamente a imagem do QR Code:
```
https://seu-projeto.railway.app/qr/image
```

### Status da Conexão

- **Aguardando QR Code**: A página mostra um loader e atualiza automaticamente
- **QR Code Disponível**: A página mostra o QR Code para escanear
- **Conectado**: A página mostra uma mensagem de sucesso

## ✅ Verificação

Após escanear o QR Code, verifique nos logs:
```
✅ WhatsApp conectado e pronto
```

Ou acesse a rota raiz:
```
https://seu-projeto.railway.app/
```

Deve retornar:
```json
{
  "online": true,
  "whatsapp": true
}
```

Se aparecer QR code novamente após conectar, significa que a sessão não está sendo persistida corretamente. Verifique se o volume está configurado corretamente.
