const QRCode = require("qrcode");
const whatsappService = require("../../../services/whatsapp");

/**
 * Retorna página HTML com QR Code
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
async function getQRPage(req, res) {
  const qr = whatsappService.getQRCode();
  const isConnected = whatsappService.getStatus();
  const apiKey = req.query.API_KEY || "";

  try {
    const qrDataURL = qr ? await QRCode.toDataURL(qr, {
      width: 400,
      margin: 2
    }) : null;

    res.send(getQRPageHTML(qrDataURL, isConnected, apiKey));
  } catch (error) {
    res.status(500).send(`<h1>Erro ao gerar QR Code</h1><p>${error.message}</p>`);
  }
}

// Templates HTML
// O HTML base agora é único e o JS cuida dos estados
function getQRPageHTML(qrDataURL, isConnected, apiKey) {
  const authQuery = apiKey ? `?API_KEY=${apiKey}` : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp Bot - Sessão</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .qr-placeholder {
          background: white;
          padding: 20px;
          border-radius: 10px;
          display: inline-block;
          margin: 20px 0;
          min-width: 200px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-placeholder img {
          display: block;
          max-width: 300px;
          height: auto;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9em;
          margin-bottom: 15px;
          background: rgba(255,255,255,0.2);
        }
        .hidden { display: none; }
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="container">
        <div id="status-area">
          <div class="status-badge" id="bot-status">${isConnected ? "Conectado" : (qrDataURL ? "Aguardando Scan" : "Inicializando")}</div>
          <h1 id="main-title">${isConnected ? "✅ Conectado!" : (qrDataURL ? "📲 Escaneie o QR" : "⏳ Inicializando...")}</h1>
          <p id="main-desc">${isConnected ? "O bot está online e pronto." : "Abra o WhatsApp e escaneie o código abaixo."}</p>
        </div>

        <div id="qr-area" class="${isConnected ? "hidden" : ""}">
          <div class="qr-placeholder">
            ${qrDataURL ? `<img src="${qrDataURL}" id="qr-img">` : `<div class="loader"></div>`}
          </div>
        </div>

        <div class="instructions ${isConnected || !qrDataURL ? "hidden" : ""}" id="instr-area">
          <p><strong>Como conectar:</strong></p>
          <ol style="text-align: left; display: inline-block; font-size: 0.9em;">
            <li>No celular, abra o <b>WhatsApp</b></li>
            <li>Vá em <b>Configurações</b> > <b>Aparelhos conectados</b></li>
            <li>Toque em <b>Conectar um aparelho</b></li>
          </ol>
        </div>
      </div>

      <script>
        const apiKey = "${apiKey}";
        const authQuery = apiKey ? "?API_KEY=" + apiKey : "";
        let lastQR = "${qrDataURL || ""}";
        let checkCount = 0;

        async function checkStatus() {
            try {
                // Polling do status da API
                const resp = await fetch("/" + authQuery);
                const data = await resp.json();
                
                // Se conectou, recarrega para mostrar a tela de sucesso total
                if (data.whatsapp === "connected") {
                    location.reload();
                    return;
                }

                // Se não está conectado, tenta pegar a imagem do QR
                const qrResp = await fetch("/qr/image" + authQuery);
                if (qrResp.ok) {
                    const blob = await qrResp.blob();
                    const url = URL.createObjectURL(blob);
                    
                    document.getElementById("qr-area").classList.remove("hidden");
                    const qrImg = document.getElementById("qr-img");
                    
                    if (qrImg) {
                        qrImg.src = url;
                    } else {
                        // Se antes estava o loader, troca pelo img
                        document.querySelector(".qr-placeholder").innerHTML = '<img src="' + url + '" id="qr-img">';
                        document.getElementById("main-title").innerText = "📲 Escaneie o QR";
                        document.getElementById("main-desc").innerText = "Abra o WhatsApp e escaneie o código abaixo.";
                        document.getElementById("bot-status").innerText = "Aguardando Scan";
                        document.getElementById("instr-area").classList.remove("hidden");
                    }
                } else if (qrResp.status === 404) {
                    // Sem QR disponível ainda
                    if (!document.getElementById("qr-img")) {
                        document.getElementById("bot-status").innerText = "Inicializando...";
                    }
                }
            } catch (err) {
                console.error("Erro no polling:", err);
            }
            
            checkCount++;
            setTimeout(checkStatus, 5000);
        }

        // Inicia polling se não estiver conectado
        if ("${isConnected}" !== "true") {
            setTimeout(checkStatus, 5000);
        }
      </script>
    </body>
    </html>
  `;
}


module.exports = getQRPage;
