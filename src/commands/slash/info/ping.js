import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';
import { EmbedBuilder } from 'discord.js';
import config from '../../../../config.js';

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
            const sent = await interaction.reply({ content: translate('ping.pinging'), fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            let pingStatus;
            if (apiLatency < 0) {
                pingStatus = translate('ping.status_high_tech');
            } else if (apiLatency > 500) {
                pingStatus = translate('ping.status_interference');
            } else {
                pingStatus = translate('ping.status_normal');
            }

            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('🏓 Pong!')
                .setDescription(
                    `${translate('ping.api_latency', { apiLatency })}\n` +
                    `${translate('ping.bot_latency', { latency })}\n` +
                    `${translate('ping.database_latency')}\n` +
                    `${translate('ping.field_uptime')}: \`${days}d ${hours}h ${minutes}m ${seconds}s\``
                )
                .setThumbnail("https://cdn3.emoji.gg/emojis/51721-gleep-glorp-cat.png")
                .setTimestamp()
                .setFooter({
                    text: translate('ping.requested_by', { authorTag: interaction.user.tag }),
                    iconURL: interaction.user.avatarURL()
                });

            await interaction.editReply({ content: pingStatus, embeds: [embed] });
            logger.debug(`[Command:ping] Respondeu para ${interaction.user.tag} com latência: ${latency}ms, Latência API: ${apiLatency}ms`);
        } catch (error) {
            logger.error(`[Command:ping] Falha ao executar comando para ${interaction.user.tag}`, error);
            await interaction.reply({ content: translate('error.generic_error', { emoji: '❌' }) });
        }
    }
}
