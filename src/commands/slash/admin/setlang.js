import Command from "../../../structures/Command.js";
import logger from "../../../../logger.js";
import guildSettings from "../../../database/guildSettings.js";
import { ApplicationCommandOptionType } from "discord.js";

export default class SetLang extends Command {
  constructor() {
    super({
      name: "setlang",
      category: "admin",
      tags: ["admin", "utility"],
      slash: true,
      devOnly: false,
      options: [
        {
          name: "locale",
          description: "O idioma a ser definido para o bot nesta guilda.",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Português (Brasil)", value: "pt-BR" },
            { name: "English (US)", value: "en-US" },
          ],
        },
      ],
    });
  }

  async execute({ interaction, translate }) {
    logger.debug(
      `[Command:setlang] Executando comando para ${interaction.user.tag}`,
    );
    if (!interaction.memberPermissions.has("ManageGuild")) {
      await interaction.reply({
        content: translate(interaction.locale, "setlang.no_permission"),
        ephemeral: true,
      });
      logger.warn(
        `[Command:setlang] ${interaction.user.tag} tentou usar setlang sem permissão.`,
      );
      return;
    }

    const locale = interaction.options.getString("locale");

    try {
      guildSettings.setGuildLocale(interaction.guild.id, locale);
      await interaction.reply({
        content: translate("setlang.success", { locale }),
        ephemeral: true,
      });
      logger.info(
        `[Command:setlang] Idioma da guilda ${interaction.guild.id} definido para ${locale} por ${interaction.user.tag}`,
      );
    } catch (error) {
      logger.error(
        `[Command:setlang] Falha ao definir idioma para a guilda ${interaction.guild.id}`,
        error,
      );
      await interaction.reply({
        content: translate("error.generic_error", { emoji: "❌" }),
        ephemeral: true,
      });
    }
  }
}
