import { Events } from 'discord.js';
import { translate } from '../../i18n/index.js';
import logger from '../../../logger.js';
import guildSettings from '../../database/guildSettings.js';

export default {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot) return;

        const prefix = process.env.PREFIX;
        if (!message.content.startsWith(prefix)) return;

        const guildId = message.guild?.id;
        const configuredLocale = guildId ? await guildSettings.getGuildLocale(guildId) : undefined;
        const currentLocale = configuredLocale || 'pt-BR';
        logger.debug(`[MessageCreate] Localidade determinada: ${currentLocale} (Configurada: ${configuredLocale || 'nenhuma'}, Informada pelo Discord: ${message.guild?.preferredLocale || 'nenhuma'})`);

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            logger.warn(`[MessageCreate] Comando não encontrado: ${commandName}`);
            let msg = await message.reply(translate(currentLocale, 'error.command_not_found', { emoji: '🤔' }));
            setTimeout(() => {
                msg.delete();
                message.delete().catch(() => {});
            }, 10000);
            return;
        }

        try {
            logger.debug(`[MessageCreate] Executando comando: ${command.name} por ${message.author.tag}`);
            await command.execute({ message, args, translate: (key, args) => translate(currentLocale, key, args) });
        } catch (error) {
            logger.error(`[MessageCreate] Erro ao executar o comando ${command.name} para ${message.author.tag}`, error);
            await message.reply(translate(currentLocale, 'error.generic_error', { emoji: '❌' }));
        }
    },
};
