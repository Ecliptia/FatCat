import { Events, ActivityType } from "discord.js";
import logger from "../../../logger.js";
import sharderName from "../../assets/sharderName.js";
import config from "../../../config.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const id = client.shard?.ids?.[0] ?? 0;
    const nome = sharderName[id] ?? `Shard ${id}`;
    client.shardName = nome;

    logger.info(`Bot iniciado com sucesso no shard: "${nome}"`);

    const updatePresence = () => {
      const activities = config.presence.activities;
      const activity = activities[Math.floor(Math.random() * activities.length)];

      const totalGuilds = client.guilds.cache.size;
      const totalUsers = client.users.cache.size;
      const totalCommands = client.commands.size + client.slashCommands.size;
      const totalConnections = client.voice.adapters.size;

      let name = activity.name
        .replace(/{{commands}}/g, totalCommands)
        .replace(/{{users}}/g, totalUsers)
        .replace(/{{guilds}}/g, totalGuilds)
        .replace(/{{connections}}/g, totalConnections);

      client.user.setActivity(name, { type: activity.type });
      logger.debug(`[Presence] Atividade definida para: ${name} (Tipo: ${activity.type})`);
    };

    updatePresence();
    setInterval(updatePresence, config.presence.updateInterval);
  },
};
