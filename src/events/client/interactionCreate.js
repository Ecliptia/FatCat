import { Events } from "discord.js";
import { translate } from "../../i18n/index.js";
import logger from "../../../logger.js";
import guildSettings from "../../database/guildSettings.js";

export default {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    if (!interaction.isCommand()) return;

    const guildId = interaction.guild?.id;
    const configuredLocale = guildId
      ? await guildSettings.getGuildLocale(guildId)
      : undefined;
    const currentLocale = configuredLocale || "pt-BR";
    logger.debug(
      `[InteractionCreate] Localidade determinada: ${currentLocale} (Configurada: ${configuredLocale || "nenhuma"}, Informada pelo Discord: ${interaction.locale || "nenhuma"})`,
    );

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) {
      logger.warn(
        `[InteractionCreate] Comando slash não encontrado: ${interaction.commandName}`,
      );
      await interaction.reply({
        content: translate(currentLocale, "error.command_not_found", {
          emoji: "🤔",
        }),
        ephemeral: true,
      });
      return;
    }

    try {
      logger.debug(
        `[InteractionCreate] Executando comando slash: ${command.name} por ${interaction.user.tag}`,
      );
      await command.execute({
        interaction,
        translate: (key, args) => translate(currentLocale, key, args),
      });
    } catch (error) {
      logger.error(
        `[InteractionCreate] Erro ao executar comando slash ${command.name} para ${interaction.user.tag}`,
        error,
      );
      await interaction.reply({
        content: translate(currentLocale, "error.generic_error", {
          emoji: "❌",
        }),
        ephemeral: true,
      });
    }
  },
};
