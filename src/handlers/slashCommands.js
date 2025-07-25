import walk from "../utils/walk.js";
import { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadSlashCommands(client) {
    const files = await walk(`${__dirname}/../commands/slash`);

    for (const file of files) {
        const command = (await import(pathToFileURL(file).href)).default;
        if (!command?.data?.name) continue;

        client.slashCommands.set(command.data.name, command);
    }
}
