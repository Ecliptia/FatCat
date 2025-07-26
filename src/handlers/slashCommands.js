import { Collection, ApplicationCommandOptionType } from 'discord.js';
import { readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../../logger.js';
import Command from '../structures/Command.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function loadSlashCommands(client) {
    client.slashCommands = new Collection();
    const slashCommandsPath = join(__dirname, '..', 'commands', 'slash');
    logger.debug('[SlashCommands] Iniciando o carregamento dos comandos slash...');

    const categoryDirs = await readdir(slashCommandsPath, { withFileTypes: true });

    for (const categoryDir of categoryDirs) {
        if (!categoryDir.isDirectory()) continue;

        const categoryPath = join(slashCommandsPath, categoryDir.name);
        const commandItems = await readdir(categoryPath, { withFileTypes: true });

        for (const commandItem of commandItems) {
            const commandPath = join(categoryPath, commandItem.name);

            if (commandItem.isDirectory()) {
                const commandName = commandItem.name;
                const subcommandFiles = (await readdir(commandPath, { withFileTypes: true }))
                    .filter(f => f.isFile() && f.name.endsWith('.js'));

                if (subcommandFiles.length === 0) {
                    logger.warn(`[SlashCommands] Diretório do comando ${commandName} está vazio, ignorando.`);
                    continue;
                }

                const subcommands = new Collection();
                for (const subcommandFile of subcommandFiles) {
                    const subcommandPath = join(commandPath, subcommandFile.name);
                    try {
                        const SubcommandClass = (await import(pathToFileURL(subcommandPath).href)).default;
                        const subcommandInstance = new SubcommandClass();
                        if (subcommandInstance.name) {
                            subcommands.set(subcommandInstance.name, subcommandInstance);
                        }
                    } catch (error) {
                        logger.error(`[SlashCommands] Falha ao carregar subcomando do arquivo ${subcommandPath}`, error);
                    }
                }

                if (subcommands.size > 0) {
                    const mainCommand = new Command({
                        name: commandName,
                        category: categoryDir.name,
                        slash: true,
                        options: []
                    });

                    mainCommand.subcommands = subcommands;

                    mainCommand.execute = async function({ interaction, translate }) {
                        const subcommandName = interaction.options.getSubcommand();
                        const subcommand = this.subcommands.get(subcommandName);
                        if (subcommand) {
                            logger.debug(`[SlashCommands] Executando subcomando: ${subcommandName} do comando ${this.name}`);
                            await subcommand.execute({ interaction, translate });
                        } else {
                            logger.warn(`[SlashCommands] Subcomando não encontrado: ${subcommandName} para o comando ${this.name}`);
                        }
                    };

                    for (const subcommand of subcommands.values()) {
                        mainCommand.options.push({
                            name: subcommand.name,
                            description: subcommand.getDescription('pt-BR'),
                            type: ApplicationCommandOptionType.Subcommand,
                            options: subcommand.options || []
                        });
                    }

                    client.slashCommands.set(mainCommand.name, mainCommand);
                    logger.debug(`[SlashCommands] Grupo de comandos carregado: ${mainCommand.name} com subcomandos: ${[...subcommands.keys()].join(', ')}`);
                }

            } else if (commandItem.isFile() && commandItem.name.endsWith('.js')) {
                try {
                    const CommandClass = (await import(pathToFileURL(commandPath).href)).default;
                    const command = new CommandClass();

                    if (command.slash) {
                        client.slashCommands.set(command.name, command);
                        logger.debug(`[SlashCommands] Comando slash carregado: ${command.name}`);
                    } else {
                        logger.warn(`[SlashCommands] Ignorando comando de mensagem encontrado na pasta de comandos slash: ${command.name}`);
                    }
                } catch (error) {
                    logger.error(`[SlashCommands] Falha ao carregar comando slash do arquivo ${commandPath}`, error);
                }
            }
        }
    }

    logger.debug('[SlashCommands] Carregamento dos comandos slash concluído.');
}
