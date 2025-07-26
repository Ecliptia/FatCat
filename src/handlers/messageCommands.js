import { Collection } from 'discord.js';
import walk from "../utils/walk.js";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../../logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadMessageCommands(client) {
    client.commands = new Collection();
    logger.debug('[ComandosMensagem] Iniciando o carregamento dos comandos de mensagem...');

    const arquivos = await walk(`${__dirname}/../commands/message`);

    for (const arquivo of arquivos) {
        try {
            const ClasseComando = (await import(pathToFileURL(arquivo).href)).default;
            const comando = new ClasseComando();

            if (!comando.slash) {
                client.commands.set(comando.name, comando);
                logger.debug(`[ComandosMensagem] Comando de mensagem carregado: ${comando.name}`);
            } else {
                logger.warn(`[ComandosMensagem] Ignorando comando slash encontrado na pasta de comandos de mensagem: ${comando.name}`);
            }
        } catch (erro) {
            logger.error(`[ComandosMensagem] Falha ao carregar o comando de mensagem do arquivo ${arquivo}`, erro);
        }
    }

    logger.debug('[ComandosMensagem] Carregamento dos comandos de mensagem concluído.');
}
