import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import logger from '../../logger.js';

const settingsFilePath = join(process.cwd(), './src/assets/local/guildSettings.json');
let guildSettings = {};

function loadSettings() {
    if (existsSync(settingsFilePath)) {
        try {
            const data = readFileSync(settingsFilePath, 'utf-8');
            guildSettings = JSON.parse(data);
            logger.debug('[GuildSettings] Configurações carregadas com sucesso.');
        } catch (error) {
            logger.error('[GuildSettings] Falha ao carregar o arquivo de configurações.', error);
            guildSettings = {};
        }
    } else {
        logger.warn('[GuildSettings] Arquivo de configurações não encontrado. Criando um novo.');
        saveSettings();
    }
}

function saveSettings() {
    try {
        const dir = dirname(settingsFilePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        writeFileSync(settingsFilePath, JSON.stringify(guildSettings, null, 2), 'utf-8');
        logger.debug('[GuildSettings] Configurações salvas com sucesso.');
    } catch (error) {
        logger.error('[GuildSettings] Falha ao salvar o arquivo de configurações.', error);
    }
}

function getGuildLocale(guildId) {
    return guildSettings[guildId]?.locale;
}

function setGuildLocale(guildId, locale) {
    if (!guildSettings[guildId]) {
        guildSettings[guildId] = {};
    }
    guildSettings[guildId].locale = locale;
    saveSettings();
}

loadSettings();

export default { getGuildLocale, setGuildLocale };
