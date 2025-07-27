import Command from "../../../structures/Command.js";
import logger from "../../../../logger.js";
import { EmbedBuilder } from "discord.js";
import config from "../../../../config.js";
import formatUptime from "../../../utils/formatUptime.js";
import { database, ref, get } from "../../../database/firebase.js";
import { child } from "firebase/database";

export default class PingMessage extends Command {
  constructor() {
    super({
      name: "ping",
      category: "info",
      tags: ["utility"],
      slash: false,
      cooldown: 5,
    });
  }

  async execute({ message, translate }) {
    logger.debug(
      `[Command:ping-message] Executando comando para ${message.author.tag}`,
    );
    try {
      const sent = await message.reply(translate("ping.pinging"));
      const latency = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(message.client.ws.ping);

      const uptime = process.uptime();
      const formattedUptime = formatUptime(uptime);

      let databaseLatency = "N/A";
      try {
        const dbStartTime = process.hrtime.bigint();
        await get(child(ref(database), "guildSettings/test"));
        const dbEndTime = process.hrtime.bigint();
        databaseLatency = Math.round(
          Number(dbEndTime - dbStartTime) / 1_000_000,
        );
      } catch (dbError) {
        logger.error(
          `[Command:ping-message] Falha ao obter latência do banco de dados:`,
          dbError,
        );
        databaseLatency = translate("ping.database_disconnected");
      }

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle("🏓 Pong!")
        .setDescription(
          `${translate("ping.api_latency", { apiLatency })}\n` +
            `${translate("ping.bot_latency", { latency })}\n` +
            `${translate("ping.database_latency", { databaseLatency })}\n` +
            `${translate("ping.field_uptime")}: \`${formattedUptime}\``,
        )
        .setThumbnail(config.images.pingThumbnail)
        .setFooter({
          text: translate("ping.requested_by", {
            authorTag: message.author.tag,
          }),
          iconURL: message.author.avatarURL(),
        })
        .setTimestamp();

      await sent.edit({
        content:
          apiLatency < 0
            ? translate("ping.status_high_tech")
            : apiLatency > 500
              ? translate("ping.status_interference")
              : translate("ping.status_normal"),
        embeds: [embed],
      });

      logger.debug(
        `[Command:ping-message] Respondeu para ${message.author.tag} com latência: ${latency}ms, Latência API: ${apiLatency}ms, Latência DB: ${databaseLatency}ms`,
      );
    } catch (error) {
      logger.error(
        `[Command:ping-message] Falha ao executar comando para ${message.author.tag}`,
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
