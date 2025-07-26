import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';

export default class PingMessage extends Command {
    constructor() {
        super({
            name: 'ping',
            category: 'info',
            tags: ['utility'],
            slash: false,
            cooldown: 5,
        });
    }

    async execute({ message, translate }) {
        logger.debug(`[Command:ping-message] Executando comando para ${message.author.tag}`);
        try {
            const sent = await message.reply(translate('ping.pinging'));
            const latency = sent.createdTimestamp - message.createdTimestamp;
            const apiLatency = Math.round(message.client.ws.ping);

            const reply = translate('ping.reply', { latency, apiLatency });

            await sent.edit(reply);
            logger.debug(`[Command:ping-message] Respondeu para ${message.author.tag} com latência: ${latency}ms, Latência API: ${apiLatency}ms`);
        } catch (error) {
            logger.error(`[Command:ping-message] Falha ao executar comando para ${message.author.tag}`, error);
            await message.reply(translate(message.guild?.preferredLocale || 'pt-BR', 'error.generic_error', { emoji: '❌' }));
        }
    }
}
