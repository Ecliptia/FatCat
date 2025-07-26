import { ShardingManager } from 'discord.js';
import logger from "../logger.js";
import 'dotenv/config'
(async () => {

    const manager = new ShardingManager('./src/bot.js', {
        token: process.env.TOKEN,
        totalShards: 'auto',
        shardList: 'auto',
        mode: 'process',
        respawn: 'true',
        timeout: 999999
    });

    manager.spawn().then();

    manager.on("shardCreate", (shard) => logger.info("Shard " + shard.id + " (Spawnado)"));
})();