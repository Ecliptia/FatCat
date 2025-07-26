import Command from '../../../structures/Command.js';
import logger from '../../../../logger.js';
import guildSettings from '../../../database/guildSettings.js';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import config from '../../../../config.js';

export default class SetLangMessage extends Command {
    constructor() {
        super({
            name: 'setlang',
            category: 'admin',
            tags: ['admin', 'utility'],
            slash: false,
            cooldown: 5,
        });
    }

    async execute({ message, translate }) {
        logger.debug(`[Command:setlang-message] Executando comando para ${message.author.tag}`);
        if (!message.member.permissions.has('ManageGuild')) {
            await message.reply({ content: translate(message.guild?.preferredLocale || 'pt-BR', 'setlang.no_permission'), ephemeral: true });
            logger.warn(`[Command:setlang-message] ${message.author.tag} tentou usar setlang sem permissão.`);
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('selectLang')
            .setPlaceholder(translate('setlang.select_language_placeholder'));

        const locales = [
            { label: 'Português (Brasil)', value: 'pt-BR', emoji: config.flagEmojis['pt-BR'] },
            { label: 'English (US)', value: 'en-US', emoji: config.flagEmojis['en-US'] },
        ];

        locales.forEach(locale => {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(locale.label)
                    .setValue(locale.value)
                    .setEmoji(locale.emoji)
            );
        });

        const actionRow = new ActionRowBuilder().addComponents(selectMenu);

        const reply = await message.reply({
            content: translate('setlang.select_language_prompt'),
            components: [actionRow],
            fetchReply: true,
        });

        const collector = reply.createMessageComponentCollector({
            filter: i => i.customId === 'selectLang' && i.user.id === message.author.id,
            time: 60000,
        });

        collector.on('collect', async i => {
            const selectedLocale = i.values[0];
            try {
                await guildSettings.setGuildLocale(message.guild.id, selectedLocale);
                await i.update({ content: translate('setlang.success', { locale: selectedLocale }), components: [] });
                logger.info(`[Command:setlang-message] Idioma da guilda ${message.guild.id} definido para ${selectedLocale} por ${message.author.tag}`);
            } catch (error) {
                logger.error(`[Command:setlang-message] Falha ao definir idioma para a guilda ${message.guild.id}`, error);
                await i.update({ content: translate(message.guild?.preferredLocale || 'pt-BR', 'error.generic_error', { emoji: '❌' }), components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                reply.edit({ content: translate('setlang.selection_timeout'), components: [] }).catch(logger.error);
            }
        });
    }
}
