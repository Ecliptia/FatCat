import walk from "../utils/walk.js";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadMessageCommands(client) {
    const files = await walk(`${__dirname}/../commands/message`);

    for (const file of files) {
        const command = (await import(pathToFileURL(file).href)).default;
        if (!command?.name) continue;

        client.commands.set(command.name, command);
    }
}
