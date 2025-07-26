import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';
import { EmbedBuilder } from 'discord.js';
import config from '../../../../config.js';
import packageJson from '../../../../package.json' with { type: 'json' };
import sharderName from "../../../assets/sharderName.js";

export default class BotInfoSlash extends Command {
    constructor() {
        super({
            name: 'botinfo',
            category: 'info',
            tags: ['utility'],
            slash: true,
            cooldown: 5,
        });
    }

    async execute({ interaction, translate }) {
        logger.debug(`[Command:botinfo-slash] Executando comando para ${interaction.user.tag}`);
        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const version = packageJson.version;
            const totalGuilds = interaction.client.guilds.cache.size;
            const totalUsers = interaction.client.users.cache.size;
            const totalCommands = interaction.client.commands.size + interaction.client.slashCommands.size;

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
                    translate('botinfo.stats', { guilds: totalGuilds, users: totalUsers, commands: totalCommands, uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`, shardId: sharderName[interaction.client.shard?.ids?.[0]] ?? 0, totalShards: interaction.client.shard?.count ?? 1 }) + '\n\n' +
                    translate('botinfo.thanks', { authorTag: interaction.user.id }) + '\n\n' +
                    contributorsText
                )
                .setThumbnail("https://media.discordapp.net/attachments/1151684866971275325/1398692603691798732/36_Sem_Titulo_20250726124442.png?ex=6886497f&is=6884f7ff&hm=7f6ba32c7e34418d32b47483525ce7275f067f013f1992db0cb82c0ad50fce16&=&format=webp&quality=lossless&width=749&height=810")
                .setImage("https://media.discordapp.net/attachments/1151684866971275325/1398713965273550980/29_Sem_Titulo_20250726140947.png?ex=68865d64&is=68850be4&hm=3e1f96d0acd617a7af48adb3ee8a17cfa03411ace6a1d1b94bc63d01c2e33ef5&=&format=webp&quality=lossless&width=1540&height=589")
                .setFooter({
                    text: translate('botinfo.footer', { authorTag: interaction.user.tag }),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            logger.debug(`[Command:botinfo-slash] Respondeu para ${interaction.user.tag} com informações do bot.`);
        } catch (error) {
            logger.error(`[Command:botinfo-slash] Falha ao executar comando para ${interaction.user.tag}`, error);
            await interaction.reply({ content: translate(interaction.locale, 'error.generic_error', { emoji: '❌' }) });
        }
    }
}