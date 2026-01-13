const logger = require("../utils/logger");

/**
 * Fila de tarefas para processamento serial de operações de mídia.
 * Garante que apenas uma operação de mídia (Download -> Envio -> Limpeza)
 * aconteça por vez.
 */
class TaskQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Adiciona uma tarefa à fila
     * @param {Function} taskFunction - Função assíncrona que executa a tarefa
     * @returns {Promise<any>} - Resultado da função da tarefa
     */
    async enqueue(taskFunction) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await taskFunction();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this.process();
        });
    }

    /**
     * Processa a próxima tarefa da fila
     */
    async process() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const task = this.queue.shift();

        try {
            await task();
        } catch (error) {
            logger.error("❌ Erro na fila de processamento:", error.message);
        } finally {
            this.isProcessing = false;
            // Processa a próxima imediatamente
            this.process();
        }
    }
}

// Exporta uma instância única (Singleton)
module.exports = new TaskQueue();
