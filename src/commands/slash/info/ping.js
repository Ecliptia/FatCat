import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';

export default class Ping extends Command {
    constructor() {
        super({
            name: 'ping',
            category: 'info',
            tags: ['utility'],
            slash: true,
            cooldown: 5,
        });
    }

    async execute({ interaction, translate }) {
        logger.debug(`[Command:ping] Executando comando para ${interaction.user.tag}`);
        try {
            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            const reply = translate('ping.reply', { latency, apiLatency });

            await interaction.editReply({ content: reply });
            logger.debug(`[Command:ping] Respondeu para ${interaction.user.tag} com latência: ${latency}ms, Latência API: ${apiLatency}ms`);
        } catch (error) {
            logger.error(`[Command:ping] Falha ao executar comando para ${interaction.user.tag}`, error);
            await interaction.reply({ content: translate('error.generic_error', { emoji: '❌' }) });
        }
    }
}
