import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import config from '../../../../config.js';
import packageJson from '../../../../package.json' with { type: 'json' };
import sharderName from "../../../assets/sharderName.js";
import formatUptime from '../../../utils/formatUptime.js';

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
            const formattedUptime = formatUptime(uptime);

            const version = packageJson.version;
            const totalGuilds = interaction.client.guilds.cache.size;
            const totalUsers = interaction.client.users.cache.size;
            const totalCommands = interaction.client.commands.size + interaction.client.slashCommands.size;
            const messageCommands = interaction.client.commands.size;
            const slashCommands = interaction.client.slashCommands.size;

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

            const initialEmbed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle(translate('botinfo.title'))
                .setDescription(
                    translate('botinfo.greeting') + '\n\n' +
                    translate('botinfo.about_me', { version: version }) + '\n\n' +
                    translate('botinfo.stats', { guilds: totalGuilds, users: totalUsers, commands: totalCommands, uptime: formattedUptime, shardId: sharderName[interaction.client.shard?.ids?.[0]] ?? 0, totalShards: interaction.client.shard?.count ?? 1 }) + '\n\n' +
                    translate('botinfo.thanks', { authorTag: interaction.user.id }) + '\n\n' +
                    contributorsText
                )
                .setThumbnail(config.images.botThumbnail)
                .setImage(config.images.botImage)
                .setFooter({
                    text: translate('botinfo.footer', { authorTag: interaction.user.tag }),
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('botinfo_select')
                .setPlaceholder(translate('botinfo.select_placeholder'))
                .addOptions([
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_tech'))
                        .setValue('tech'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_authors'))
                        .setValue('authors'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_processing'))
                        .setValue('processing'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_database'))
                        .setValue('database'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_djs'))
                        .setValue('djs'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_commands_executed'))
                        .setValue('commands_executed'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(translate('botinfo.option_about_me'))
                        .setValue('about_me'),
                ]);

            const buttonsRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(translate('botinfo.button_github'))
                        .setStyle(ButtonStyle.Link)
                        .setURL(packageJson.homepage),
                    new ButtonBuilder()
                        .setLabel(translate('botinfo.button_support'))
                        .setStyle(ButtonStyle.Link)
                        .setURL(config.supportServerLink),
                    new ButtonBuilder()
                        .setLabel(translate('botinfo.button_invite'))
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`),
                );

            const selectRow = new ActionRowBuilder().addComponents(selectMenu);

            const reply = await interaction.reply({
                embeds: [initialEmbed],
                components: [selectRow, buttonsRow],
                fetchReply: true,
            });

            const collector = reply.createMessageComponentCollector({
                filter: i => i.customId === 'botinfo_select' && i.user.id === interaction.user.id,
                time: 120000,
            });

            collector.on('collect', async i => {
                const selected = i.values[0];
                let newEmbed = new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTimestamp();

                const memoryUsage = process.memoryUsage();
                const rssMemory = (memoryUsage.rss / 1024 / 1024).toFixed(2);
                const heapTotalMemory = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
                const heapUsedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

                const djsVersion = packageJson.dependencies['discord.js'];
                const moonlinkVersion = packageJson.dependencies['moonlink.js'];
                const firebaseVersion = packageJson.dependencies['firebase'];
                const i18nextVersion = packageJson.dependencies['i18next'];
                const dotenvVersion = packageJson.dependencies['dotenv'];

                switch (selected) {
                    case 'tech':
                        newEmbed.setTitle(translate('botinfo.option_tech'))
                            .setDescription(translate('botinfo.tech_description', {
                                djsVersion,
                                moonlinkVersion,
                                firebaseVersion,
                                i18nextVersion,
                                dotenvVersion
                            }));
                        break;
                    case 'authors':
                        newEmbed.setTitle(translate('botinfo.option_authors'))
                            .setDescription(translate('botinfo.authors_description'));
                        break;
                    case 'processing':
                        newEmbed.setTitle(translate('botinfo.option_processing'))
                            .setDescription(translate('botinfo.processing_description', {
                                rssMemory,
                                heapTotalMemory,
                                heapUsedMemory
                            }));
                        break;
                    case 'database':
                        newEmbed.setTitle(translate('botinfo.option_database'))
                            .setDescription(translate('botinfo.database_description'));
                        break;
                    case 'djs':
                        newEmbed.setTitle(translate('botinfo.option_djs'))
                            .setDescription(translate('botinfo.djs_description', { djsVersion }));
                        break;
                    case 'commands_executed':
                        newEmbed.setTitle(translate('botinfo.option_commands_executed'))
                            .setDescription(translate('botinfo.commands_executed_description', {
                                totalCommands,
                                messageCommands,
                                slashCommands
                            }));
                        break;
                    case 'about_me':
                        const createdAt = i.client.user.createdAt.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
                        const botId = i.client.user.id;
                        const botTag = i.client.user.tag;
                        const botStatus = i.client.user.presence?.status || translate('botinfo.presence_unknown');
                        const botActivity = i.client.user.presence?.activities[0]?.name ? `(${i.client.user.presence.activities[0].type} ${i.client.user.presence.activities[0].name})` : '';
                        newEmbed.setTitle(translate('botinfo.option_about_me'))
                            .setDescription(translate('botinfo.about_me_detailed', {
                                createdAt,
                                botId,
                                botTag,
                                botStatus,
                                botActivity,
                                botName: i.client.user.username
                            }));
                        break;
                }
                await i.update({ embeds: [newEmbed], components: [selectRow, buttonsRow] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    reply.edit({ components: [] }).catch(logger.error);
                }
            });

            logger.debug(`[Command:botinfo-slash] Respondeu para ${interaction.user.tag} com informações do bot.`);
        } catch (error) {
            logger.error(`[Command:botinfo-slash] Falha ao executar comando para ${interaction.user.tag}`, error);
            await interaction.reply({ content: translate(interaction.locale, 'error.generic_error', { emoji: '❌' }) });
        }
    }
}