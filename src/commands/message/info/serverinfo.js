import Command from "../../../structures/Command.js";
import logger from "../../../../logger.js";
import {
  EmbedBuilder,
  GuildVerificationLevel,
  GuildExplicitContentFilter,
  time,
  TimestampStyles,
} from "discord.js";
import config from "../../../../config.js";

export default class ServerInfoMessage extends Command {
  constructor() {
    super({
      name: "serverinfo",
      category: "info",
      tags: ["utility"],
      slash: false,
      cooldown: 5,
    });
  }

  async execute({ message, translate }) {
    logger.debug(
      `[Command:serverinfo-message] Executando comando para ${message.author.tag}`,
    );

    try {
      const guild = message.guild;
      if (!guild) {
        await message.reply(
          translate("serverinfo.not_in_guild", { emoji: "❌" }),
        );
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
                ? `\`${guild.features.map((feature) => translate("features." + feature)).join(", ")}\``
                : translate("serverinfo.no_features"),
            inline: false,
          },
        )
        .setFooter({
          text: translate("serverinfo.requested_by", {
            authorTag: message.author.tag,
          }),
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      logger.debug(
        `[Command:serverinfo-message] Respondeu para ${message.author.tag} com informações do servidor.`,
      );
    } catch (error) {
      logger.error(
        `[Command:serverinfo-message] Falha ao executar comando para ${message.author.tag}`,
        error,
      );
      await message.reply(
        translate(
          message.guild?.preferredLocale || "pt-BR",
          "error.generic_error",
          { emoji: "❌" },
        ),
      );
    }
  }
}
