import i18next from 'i18next';
import { readdirSync, readFileSync } from 'fs';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';
import logger from '../../logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const localesPath = join(__dirname, 'locales');

const resources = {};

try {
    logger.debug('[i18n] Carregando arquivos de idioma...');
    const localeFiles = readdirSync(localesPath).filter(file => file.endsWith('.json'));

    for (const file of localeFiles) {
        const locale = parse(file).name;
        const resource = JSON.parse(readFileSync(join(localesPath, file), 'utf-8'));
        resources[locale] = {
            translation: resource
        };
        logger.debug(`[i18n] Idioma carregado: ${locale}`);
    }
} catch (error) {
    logger.error('[i18n] Falha ao carregar arquivos de idioma', error);
}

i18next.init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'en-US',
    interpolation: {
        escapeValue: false
    }
});

function translate(locale, key, args) {
    return i18next.t(key, { lng: locale, ...args });
}

export { i18next, translate };
