import { SettingsWindow } from './ui/settings';
import { ConfigManager } from './config';
import { GPT24Provider } from './providers/gpt24';
import { OpenAIProvider } from './providers/openai';

(function() {
    "use strict";

    const LETTERS = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя".toUpperCase().split("");
    const configManager = new ConfigManager();
    const settingsWindow = new SettingsWindow();
    
    // Initialize provider based on config
    function getProvider() {
        const providerType = configManager.getValue('provider');
        switch (providerType) {
            case 'openai':
                return new OpenAIProvider(LETTERS);
            case 'gpt24':
            default:
                return new GPT24Provider(LETTERS);
        }
    }

    let provider = getProvider();
    let currentQuestion = '';
    let isProcessing = false;
    let currentHighlight = null;
    let highlightTimeout = null;

    function getQuestionData() {
        const questionElement = document.getElementsByClassName("test-content-text")[0]?.childNodes[1]?.childNodes[0];
        if (!questionElement) return null;

        const question = questionElement.innerText;
        const isMultipleChoice = document.querySelector('.question-option-inner-multiple') !== null;
        
        const selector = isMultipleChoice ? '.question-option-inner-multiple' : '.question-option-inner.ng-scope';
        const answersElements = Array.from(document.querySelectorAll(selector));
        const answers = {};

        answersElements.forEach((element, index) => {
            if (index < LETTERS.length) {
                const contentDiv = element.querySelector('.question-option-inner-content');
                answers[LETTERS[index]] = contentDiv ? contentDiv.innerText : element.innerText;
            }
        });

        return { 
            question, 
            answers,
            isMultipleChoice 
        };
    }

    function clearCurrentHighlight() {
        if (currentHighlight) {
            currentHighlight.style.backgroundColor = '';
            currentHighlight = null;
        }
        if (highlightTimeout) {
            clearTimeout(highlightTimeout);
            highlightTimeout = null;
        }
    }

    async function clickSaveButton() {
        const saveButton = document.querySelector('.test-multiquiz-save-button');
        if (saveButton) {
            saveButton.click();
            console.log('Clicked save button');
        }
    }

    async function highlightAnswer(letterOrLetters) {
        const optionsGrid = document.querySelector('.test-options-grid');
        if (!optionsGrid) return;

        const isMultipleChoice = document.querySelector('.question-option-inner-multiple') !== null;
        const selector = isMultipleChoice ? '.question-option-inner-multiple' : '.question-option-inner.ng-scope';
        const options = optionsGrid.querySelectorAll(selector);
        
        const letters = Array.isArray(letterOrLetters) ? letterOrLetters : [letterOrLetters];

        // Clear all previous highlights
        if (configManager.getValue('highlight')) {
            options.forEach(option => {
                option.style.backgroundColor = '';
            });
        }

        // First highlight all answers
        const highlightedOptions = [];
        for (const letter of letters) {
            const letterIndex = LETTERS.indexOf(letter);
            if (letterIndex !== -1 && options[letterIndex]) {
                const option = options[letterIndex];
                
                if (configManager.getValue('highlight')) {
                    option.style.backgroundColor = configManager.getValue('highlightColor');
                    highlightedOptions.push(option);
                }
                
                console.log('Highlighted answer:', letter, 'at index:', letterIndex);
            }
        }

        // Set timeout to clear highlights
        if (configManager.getValue('highlight')) {
            setTimeout(() => {
                highlightedOptions.forEach(option => {
                    option.style.backgroundColor = '';
                });
            }, configManager.getValue('highlightDuration'));
        }

        // Then handle clicking if enabled
        if (configManager.getValue('autoClick')) {
            await new Promise(resolve => setTimeout(resolve, 300));

            for (const letter of letters) {
                const letterIndex = LETTERS.indexOf(letter);
                if (letterIndex !== -1 && options[letterIndex]) {
                    const option = options[letterIndex];
                    const delay = configManager.getValue('useRandomDelay')
                        ? Math.random() * (configManager.getValue('maxDelay') - configManager.getValue('minDelay')) 
                            + configManager.getValue('minDelay')
                        : configManager.getValue('delay');
                    
                    await new Promise(resolve => setTimeout(resolve, delay));
                    option.click();
                    console.log('Clicked answer:', letter, 'at index:', letterIndex);
                }
            }

            if (isMultipleChoice) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await clickSaveButton();
            }
        }
    }

    async function processQuestion(questionData) {
        if (!questionData) return;

        let prompt = `${questionData.question}\n\n`;
        for (const [letter, answer] of Object.entries(questionData.answers)) {
            const cleanAnswer = answer.replace(/^[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]\)\s*/, '');
            prompt += `${letter}) ${cleanAnswer}\n`;
        }

        settingsWindow.setLastPrompt(prompt);

        let gptPrompt = `${questionData.question}\n\n`;
        gptPrompt += `Тип запитання: ${questionData.isMultipleChoice ? 'множинний вибір (декілька правильних відповідей)' : 'одиночний вибір (одна правильна відповідь)'}\n\n`;
        gptPrompt += `Варіанти відповідей:\n`;
        for (const [letter, answer] of Object.entries(questionData.answers)) {
            const cleanAnswer = answer.replace(/^[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]\)\s*/, '');
            gptPrompt += `${letter}) ${cleanAnswer}\n`;
        }

        try {
            const response = await provider.getAnswer(gptPrompt);
            
            if (Array.isArray(response)) {
                settingsWindow.setLastAnswer(response);
                await highlightAnswer(response);
            } else {
                const answer = response.replace(/[^АБВГҐДЕЄЖЗИІЇЙ��ЛМНОПРСТУФХЦЧШЩЬЮЯ]/g, '').trim();
                if (LETTERS.includes(answer)) {
                    settingsWindow.setLastAnswer(answer);
                    await highlightAnswer(answer);
                }
            }
        } catch (error) {
            console.error('Error getting answer:', error);
        }
    }

    function startQuestionMonitoring() {
        setInterval(() => {
            if (isProcessing) return;

            const questionData = getQuestionData();
            if (!questionData) return;

            if (questionData.question !== currentQuestion) {
                clearCurrentHighlight();
                isProcessing = true;
                currentQuestion = questionData.question;
                processQuestion(questionData).finally(() => {
                    isProcessing = false;
                });
            }
        }, 1000);
    }

    // Update provider when config changes
    document.addEventListener('providerChanged', () => {
        provider = getProvider();
    });

    // Make highlightAnswer available globally for the reveal button
    window.highlightAnswer = highlightAnswer;

    // Start monitoring after a short delay
    setTimeout(startQuestionMonitoring, 1000);
})();