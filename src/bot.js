import { Client, Collection, REST, Routes } from "discord.js";
import logger from "../logger.js";

import loadEvents from "./handlers/events.js";
import loadMessageCommands from "./handlers/messageCommands.js";
import loadSlashCommands from "./handlers/slashCommands.js";

const client = new Client({
  intents: [131071],
});

client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
  await loadMessageCommands(client);
  await loadSlashCommands(client);
  await loadEvents(client);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    logger.info("Started refreshing application (/) commands.");

    const commandsToRegister = client.slashCommands.map((command) => ({
      name: command.name,
      description: command.getDescription("pt-BR"),
      options: command.options || [],
    }));

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandsToRegister,
    });

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error("Failed to reload application (/) commands:", error);
  }

  logger.info("Comandos e eventos carregados. Iniciando login...");
  client.login(process.env.TOKEN);
})();
