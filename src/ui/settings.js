import { UIWindow } from './base';
import { I18n } from '../locales/i18n';
import { ConfigManager } from '../config';

export class SettingsWindow {
    constructor() {
        this.configManager = new ConfigManager();
        this.i18n = new I18n();
        this.i18n.setLocale(this.configManager.getValue('locale'));
        this.lastAnswer = null;
        this.lastPrompt = null;
        
        this.window = new UIWindow(this.i18n.t('settings.title'), this.configManager);
        this.init();
        
        this.setupKeyboardShortcut();
    }

    setupKeyboardShortcut() {
        document.removeEventListener('keydown', this.handleKeyPress);
        
        this.handleKeyPress = (e) => {
            if (e.key.toLowerCase() === 'x') {
                this.window.toggle();
            }
        };
        
        document.addEventListener('keydown', this.handleKeyPress);
    }

    init() {
        // Provider selection
        this.window.addSelect('provider', 
            this.i18n.t('settings.provider'),
            {
                gpt24: "GPT-24",
                openai: "OpenAI",
                mulai: 'Mulai'
            },
            'gpt24',
            () => {
                this.updateApiKeyVisibility();
                document.dispatchEvent(new Event('providerChanged'));
            }
        );

        // OpenAI API Key
        const apiKeyRow = this.window.addPasswordInput('openaiApiKey',
            this.i18n.t('settings.openaiApiKey'),
            '',
            'sk-...'
        );
        
        // Set initial visibility of API key field
        apiKeyRow.classList.toggle('hidden', 
            this.configManager.getValue('provider') !== 'openai');

        // CORS API Key
        const corsKeyRow = this.window.addPasswordInput('corsApiKey',
            'CORS.SH API Key',
            '',
            'temp_...'
        );
        
        // Set initial visibility of CORS key field
        corsKeyRow.classList.toggle('hidden', 
            this.configManager.getValue('provider') !== 'mulai');

        // Update visibility of both API key fields when provider changes
        this.updateApiKeyVisibility = () => {
            const provider = this.configManager.getValue('provider');
            apiKeyRow.classList.toggle('hidden', provider !== 'openai');
            corsKeyRow.classList.toggle('hidden', provider !== 'mulai');
        };

        // Language selection
        this.window.addSelect('locale',
            this.i18n.t('settings.language'),
            {
                en_US: 'English',
                uk_UA: 'Українська'
            },
            'en_US',
            () => this.updateUI()
        );

        // Auto click toggle
        this.window.addToggle('autoClick',
            this.i18n.t('settings.autoClick'),
            true
        );

        // Random delay group
        const delayGroup = this.window.addGroup('delay-settings');
        
        delayGroup.addToggle('useRandomDelay',
            this.i18n.t('settings.randomDelay'),
            false,
            (value) => this.updateDelayInputs(value)
        );

        delayGroup.addNumberInput('delay',
            this.i18n.t('settings.fixedDelay'),
            1000, 0, null, 100
        );

        delayGroup.addNumberInput('minDelay',
            this.i18n.t('settings.minDelay'),
            500, 0, null, 100,
            () => this.validateDelayRange()
        );

        delayGroup.addNumberInput('maxDelay',
            this.i18n.t('settings.maxDelay'),
            2000, 0, null, 100,
            () => this.validateDelayRange()
        );

        // Highlight settings
        this.window.addToggle('highlight',
            this.i18n.t('settings.highlight'),
            true
        );

        this.window.addColorPicker('highlightColor',
            this.i18n.t('settings.highlightColor'),
            '#90EE90'
        );

        this.window.addNumberInput('highlightDuration',
            this.i18n.t('settings.highlightDuration'),
            2000, 0, null, 100
        );

        // Action buttons in first row
        this.window.addButtonRow([
            {
                id: 'copy-prompt',
                text: this.i18n.t('settings.copyPrompt'),
                onClick: async () => {
                    if (this.lastPrompt) {
                        try {
                            await navigator.clipboard.writeText(this.lastPrompt);
                            const button = this.window.getElement('copy-prompt');
                            const originalText = button.textContent;
                            button.textContent = this.i18n.t('settings.promptCopied');
                            setTimeout(() => {
                                button.textContent = originalText;
                            }, 2000);
                        } catch (err) {
                            console.error('Failed to copy prompt:', err);
                        }
                    }
                }
            },
            {
                id: 'search-google',
                text: this.i18n.t('settings.searchGoogle'),
                onClick: () => {
                    if (this.lastPrompt) {
                        const question = this.lastPrompt.split('\n')[0];
                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(question)}`;
                        window.open(searchUrl, '_blank');
                    }
                },
                className: 'search-btn'
            }
        ]);

        // Reveal answer in its own row
        this.window.addButtonRow([
            {
                id: 'reveal-answer',
                text: this.i18n.t('settings.revealAnswer'),
                onClick: () => {
                    if (this.lastAnswer) {
                        window.highlightAnswer(this.lastAnswer);
                    }
                }
            }
        ]);

        // Footer
        this.window.addFooter(`
            <div class="keybind-info">${this.i18n.t('settings.keybindInfo')}</div>
            <span class="author">${this.i18n.t('settings.author')}</span>
        `);

        // Mount window and initialize state
        this.window.mount();
        this.updateDelayInputs(this.configManager.getValue('useRandomDelay'));
    }

    updateDelayInputs(useRandom) {
        const fixedDelay = this.window.getElement('delay');
        const minDelay = this.window.getElement('minDelay');
        const maxDelay = this.window.getElement('maxDelay');

        // Update disabled states
        fixedDelay.parentElement.classList.toggle('disabled', useRandom);
        minDelay.parentElement.classList.toggle('disabled', !useRandom);
        maxDelay.parentElement.classList.toggle('disabled', !useRandom);

        // Only disable min/max inputs, not the fixed delay
        minDelay.disabled = !useRandom;
        maxDelay.disabled = !useRandom;

        // Update all delay rows visual state
        const delayRows = this.window.container.querySelectorAll('.delay-row');
        delayRows.forEach(row => {
            if (row.contains(minDelay) || row.contains(maxDelay)) {
                row.classList.toggle('disabled', !useRandom);
            }
        });
    }

    validateDelayRange() {
        const minDelay = this.configManager.getValue('minDelay');
        const maxDelay = this.configManager.getValue('maxDelay');

        if (minDelay > maxDelay) {
            this.configManager.setValue('maxDelay', minDelay);
            this.window.getElement('maxDelay').value = minDelay;
        }
    }

    updateUI() {
        this.i18n.setLocale(this.configManager.getValue('locale'));
        const oldWindow = this.window;
        const wasVisible = oldWindow.isVisible;
        
        this.window = new UIWindow(this.i18n.t('settings.title'), this.configManager);
        this.init();
        
        if (wasVisible) {
            this.window.show();
        }
        
        oldWindow.container.remove();
    }

    setLastAnswer(answer) {
        this.lastAnswer = answer;
    }

    setLastPrompt(prompt) {
        this.lastPrompt = prompt;
    }

    updateApiKeyVisibility() {
        const apiKeyRow = this.window.getElement('openaiApiKey')?.parentElement;
        if (apiKeyRow) {
            apiKeyRow.classList.toggle('hidden', 
                this.configManager.getValue('provider') !== 'openai');
        }
    }
} 