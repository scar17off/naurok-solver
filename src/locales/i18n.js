import en_US from './en_US';
import uk_UA from './uk_UA';

export class I18n {
    constructor() {
        this.locales = {
            en_US,
            uk_UA
        };
        
        this.defaultLocale = 'en_US';
    }

    setLocale(locale) {
        if (this.locales[locale]) {
            this.currentLocale = locale;
        } else {
            this.currentLocale = this.defaultLocale;
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.locales[this.currentLocale];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to default locale if key not found
                value = this.locales[this.defaultLocale];
                for (const k of keys) {
                    value = value && value[k];
                }
                break;
            }
        }
        
        return value || key;
    }
} 