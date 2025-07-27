import Command from "../../../../structures/Command.js";
import logger from "../../../../../logger.js";
import {
  EmbedBuilder,
  GuildVerificationLevel,
  GuildExplicitContentFilter,
  time,
  TimestampStyles,
} from "discord.js";
import config from "../../../../../config.js";

export default class Info extends Command {
  constructor() {
    super({
      name: "info",
      category: "info",
      description: "Exibe informações sobre o servidor",
      tags: ["utility"],
      slash: true,
      cooldown: 5,
    });
  }

  async execute({ interaction, translate }) {
    logger.debug(
      `[Command:server-info-slash] Executando comando para ${interaction.user.tag}`,
    );
    try {
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({
          content: translate("serverinfo.not_in_guild", { emoji: "❌" }),
          ephemeral: true,
        });
        return;
      }

      const owner = await guild.fetchOwner();
      const createdAt = time(guild.createdAt, TimestampStyles.LongDateTime);

      const verificationLevel = translate(
        `serverinfo.verification_level_${guild.verificationLevel}`,
      );
      const explicitContentFilter = translate(
        `serverinfo.explicit_content_filter_${guild.explicitContentFilter}`,
      );

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(translate("serverinfo.title", { guildName: guild.name }))
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          {
            name: translate("serverinfo.field_name"),
            value: `\`${guild.name}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_id"),
            value: `\`${guild.id}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_owner"),
            value: `<@${owner.id}> (\`${owner.user.tag}\`)`,
            inline: true,
          },
          {
            name: translate("serverinfo.field_members"),
            value: `\`${guild.memberCount}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_channels"),
            value: `\`${guild.channels.cache.size}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_roles"),
            value: `\`${guild.roles.cache.size}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_emojis"),
            value: `\`${guild.emojis.cache.size}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_boost_level"),
            value: `\`${guild.premiumTier}\` (${guild.premiumSubscriptionCount || 0} boosts)`,
            inline: true,
          },
          {
            name: translate("serverinfo.field_created_at"),
            value: createdAt,
            inline: true,
          },
          {
            name: translate("serverinfo.field_verification_level"),
            value: `\`${verificationLevel}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_explicit_content_filter"),
            value: `\`${explicitContentFilter}\``,
            inline: true,
          },
          {
            name: translate("serverinfo.field_preferred_locale"),
            value: `${translate("locales." + guild.preferredLocale)}`,
            inline: true,
          },
          {
            name: translate("serverinfo.field_features"),
            value:
              guild.features.length > 0
                ? `\`${guild.features.map((feature) => translate("features." + feature)).join("\`, \`")}\``
                : translate("serverinfo.no_features"),
            inline: false,
          },
        )
        .setFooter({
          text: translate("serverinfo.requested_by", {
            authorTag: interaction.user.tag,
          }),
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      logger.debug(
        `[Command:server-info-slash] Respondeu para ${interaction.user.tag} com informações do servidor.`,
      );
    } catch (error) {
      logger.error(
        `[Command:server-info-slash] Falha ao executar comando para ${interaction.user.tag}`,
        error,
      );
      await interaction.reply({
        content: translate("error.generic_error", {
          emoji: "❌",
        }),
        ephemeral: true,
      });
    }
  }
}
