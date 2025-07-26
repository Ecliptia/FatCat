import walk from "../utils/walk.js";
import { dirname, basename } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../../logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadEvents(client) {
    const files = await walk(`${__dirname}/../events`);
    logger.debug('[EventManager] Loading events...');

    for (const file of files) {
        try {
            const event = (await import(pathToFileURL(file).href)).default;
            const name = basename(file, ".js");

            if (event.once) {
                client.once(name, (...args) => event.execute(client, ...args));
            } else {
                client.on(name, (...args) => event.execute(client, ...args));
            }
            logger.debug(`[EventManager] Loaded event: ${name}`);
        } catch (error) {
            logger.error(`[EventManager] Failed to load event from file ${file}`, error);
        }
    }
}
