import { i18next, translate } from '../i18n/index.js';
import logger from '../../logger.js';

export default class Command {
    constructor({ name, category, tags = [], slash = false, options = [], cooldown = 2, devOnly = false }) {
        this.name = name;
        this.category = category;
        this.tags = tags;
        this.slash = slash;
        this.options = options;
        this.cooldown = cooldown;
        this.devOnly = devOnly;
    }

    getDescription(locale) {
        return translate(locale, `${this.name}.description`);
    }

    getCategory(locale) {
        return translate(locale, `categories.${this.category}`);
    }

    getTags(locale) {
        return this.tags.map(tag => translate(locale, `tags.${tag}`));
    }

    getUsage(locale) {
        return translate(locale, `${this.name}.usage`, { returnObjects: true });
    }

    getAliases(locale) {
        const aliases = translate(locale, `${this.name}.aliases`, { returnObjects: true });
        return Array.isArray(aliases) ? aliases : [];
    }

    async execute(context) {
        logger.warn(`[Command] O método execute não foi implementado para o comando ${this.name}.`);
        throw new Error(`O método execute não foi implementado para o comando ${this.name}.`);
    }
}
