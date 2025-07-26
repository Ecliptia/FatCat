import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';
import { EmbedBuilder } from 'discord.js';
import config from '../../../../config.js';
import packageJson from '../../../../package.json' with { type: 'json' };
import sharderName from "../../../assets/sharderName.js";

export default class BotInfoMessage extends Command {
    constructor() {
        super({
            name: 'botinfo',
            category: 'info',
            tags: ['utility'],
            slash: false,
            cooldown: 5,
        });
    }

    async execute({ message, translate }) {
        logger.debug(`[Command:botinfo-message] Executando comando para ${message.author.tag}`);
        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const version = packageJson.version;
            const totalGuilds = message.client.guilds.cache.size;
            const totalUsers = message.client.users.cache.size;
            const totalCommands = message.client.commands.size + message.client.slashCommands.size;

            const contributors = packageJson.contributors || [];
            const author = packageJson.author;

            const filteredContributors = contributors.filter(contributor => {
                if (typeof author === 'string') {
                    return contributor.name !== author;
                } else if (typeof author === 'object' && author !== null) {
                    return contributor.name !== author.name;
                }
                return true;
            });

            let contributorsText = '';
            if (filteredContributors.length > 0) {
                contributorsText = translate('botinfo.contributors_list') + '\n';
                contributorsText += filteredContributors.map(c => '**' + c.name + '**').join(', ');
            } else {
                contributorsText = translate('botinfo.no_contributors');
            }

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(translate('botinfo.title'))
                .setDescription(
                    translate('botinfo.greeting') + '\n\n' +
                    translate('botinfo.about_me', { version: version }) + '\n\n' +
                    translate('botinfo.stats', { guilds: totalGuilds, users: totalUsers, commands: totalCommands, uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`, shardId: sharderName[message.client.shard?.ids?.[0]] ?? 0, totalShards: message.client.shard?.count ?? 1 }) + '\n\n' +
                    translate('botinfo.thanks', { authorTag: message.author.id }) + '\n\n' +
                    contributorsText
                )
                .setFooter({
                    text: translate('botinfo.footer', { authorTag: message.author.tag }),
                    iconURL: message.author.avatarURL()
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
            logger.debug(`[Command:botinfo-message] Respondeu para ${message.author.tag} com informações do bot.`);
        } catch (error) {
            logger.error(`[Command:botinfo-message] Falha ao executar comando para ${message.author.tag}`, error);
            await message.reply(
                translate(message.guild?.preferredLocale || 'pt-BR', 'error.generic_error', { emoji: '❌' })
            );
        }
    }
}