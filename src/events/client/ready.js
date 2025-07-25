import sharderName from "../../assets/sharderName.js";
import logger from "../../../logger.js";

export default (client) => {
    const id = client.shard?.ids?.[0] ?? 0;
    const nome = sharderName[id] ?? `Shard ${id}`;
    client.shardName = nome;

    logger.info(`Bot iniciado com sucesso no shard: "${nome}"`);
};
