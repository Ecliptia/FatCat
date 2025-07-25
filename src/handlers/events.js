import walk from "../utils/walk.js";
import { dirname, basename } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadEvents(client) {
    const files = await walk(`${__dirname}/../events/client`);

    for (const file of files) {
        const event = (await import(pathToFileURL(file).href)).default;
        const name = basename(file, ".js");

        client.on(name, (...args) => event(client, ...args));
    }
}
