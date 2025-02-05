export class ConfigManager {
    constructor() {
        this.storageKey = 'naurok_solver_config';
        this.defaultConfig = {
            delay: 1000,
            useRandomDelay: true,
            minDelay: 2000,
            maxDelay: 6000,
            autoClick: true,
            highlight: true,
            highlightColor: '#90EE90',
            highlightDuration: 2000,
            locale: 'en_US',
            provider: 'gpt24',
            openaiApiKey: ''
        };

        this.initConfig();
    }

    initConfig() {
        const savedConfig = localStorage.getItem(this.storageKey);
        
        if (!savedConfig) {
            // If no config exists, save default
            localStorage.setItem(this.storageKey, JSON.stringify(this.defaultConfig));
            window.solveConfig = { ...this.defaultConfig };
        } else {
            try {
                // Load saved config and merge with defaults for any missing properties
                const parsed = JSON.parse(savedConfig);
                window.solveConfig = {
                    ...this.defaultConfig,
                    ...parsed
                };
                // Save back merged config
                this.saveConfig();
            } catch (e) {
                console.error('Error parsing saved config:', e);
                window.solveConfig = { ...this.defaultConfig };
                this.saveConfig();
            }
        }
    }

    getValue(key) {
        return window.solveConfig[key];
    }

    setValue(key, value) {
        if (key in this.defaultConfig) {
            window.solveConfig[key] = value;
            this.saveConfig();
            return true;
        }
        return false;
    }

    saveConfig() {
        localStorage.setItem(this.storageKey, JSON.stringify(window.solveConfig));
    }

    resetToDefault() {
        window.solveConfig = { ...this.defaultConfig };
        this.saveConfig();
    }
} 