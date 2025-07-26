import { database, ref, get, set } from './firebase.js';
import { child } from 'firebase/database';
import logger from '../../logger.js';

const guildSettingsCache = new Map();

async function getGuildLocale(guildId) {
    if (guildSettingsCache.has(guildId)) {
        return guildSettingsCache.get(guildId);
    }

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `guildSettings/${guildId}/locale`));
        if (snapshot.exists()) {
            const locale = snapshot.val();
            guildSettingsCache.set(guildId, locale);
            return locale;
        } else {
            const defaultLocale = 'pt-BR';
            guildSettingsCache.set(guildId, defaultLocale);
            return defaultLocale;
        }
    } catch (error) {
        logger.error(`[GuildSettings] Falha ao buscar configurações para a guilda ${guildId} no Firebase:`, error);
        return 'pt-BR';
    }
}

async function setGuildLocale(guildId, locale) {
    guildSettingsCache.set(guildId, locale);
    try {
        await set(ref(database, `guildSettings/${guildId}/locale`), locale);
        logger.debug(`[GuildSettings] Idioma da guilda ${guildId} definido para ${locale} no Firebase.`);
    } catch (error) {
        logger.error(`[GuildSettings] Falha ao salvar configurações para a guilda ${guildId} no Firebase:`, error);
    }
}

export default { getGuildLocale, setGuildLocale };