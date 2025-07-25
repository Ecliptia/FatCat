import { Client, Collection } from "discord.js";
import logger from "../logger.js";

import loadEvents from "./handlers/events.js";
import loadMessageCommands from "./handlers/messageCommands.js";
import loadSlashCommands from "./handlers/slashCommands.js";

const client = new Client({
    intents: [131071]
});

client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
    await loadMessageCommands(client);
    await loadSlashCommands(client);
    await loadEvents(client);

    logger.info("Comandos e eventos carregados. Iniciando login...");
    client.login(process.env.TOKEN);
})();
