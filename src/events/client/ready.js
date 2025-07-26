import { Events } from 'discord.js';
import logger from '../../../logger.js';
import sharderName from '../../assets/sharderName.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        const id = client.shard?.ids?.[0] ?? 0;
        const nome = sharderName[id] ?? `Shard ${id}`;
        client.shardName = nome;

        logger.info(`Bot iniciado com sucesso no shard: "${nome}"`);
    },
};
