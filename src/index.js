import { SettingsWindow } from './ui/settings';
import { ConfigManager } from './config';
import { GPT24Provider } from './providers/gpt24';
import { OpenAIProvider } from './providers/openai';
import { MulaiProvider } from './providers/mulai';

(function() {
    "use strict";

    const configManager = new ConfigManager();
    const settingsWindow = new SettingsWindow();
    
    // Initialize provider based on config
    function getProvider() {
        const providerType = configManager.getValue('provider');
        switch (providerType) {
            case 'openai':
                return new OpenAIProvider();
            case 'mulai':
                return new MulaiProvider();
            case 'gpt24':
            default:
                return new GPT24Provider();
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
        const answers = answersElements.map(element => {
            const contentDiv = element.querySelector('.question-option-inner-content');
            return contentDiv ? contentDiv.innerText.trim() : element.innerText.trim();
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

    async function highlightAnswer(answerTexts) {
        const optionsGrid = document.querySelector('.test-options-grid');
        if (!optionsGrid) return;

        const isMultipleChoice = document.querySelector('.question-option-inner-multiple') !== null;
        const selector = isMultipleChoice ? '.question-option-inner-multiple' : '.question-option-inner.ng-scope';
        const options = Array.from(optionsGrid.querySelectorAll(selector));
        
        const answers = Array.isArray(answerTexts) ? answerTexts : [answerTexts];

        // Clear all previous highlights
        if (configManager.getValue('highlight')) {
            options.forEach(option => {
                option.style.backgroundColor = '';
            });
        }

        // Find and highlight matching answers
        const highlightedOptions = [];
        for (const answerText of answers) {
            const option = options.find(opt => {
                const contentDiv = opt.querySelector('.question-option-inner-content');
                const text = contentDiv ? contentDiv.innerText : opt.innerText;
                return text.trim() === answerText.trim();
            });

            if (option) {
                if (configManager.getValue('highlight')) {
                    option.style.backgroundColor = configManager.getValue('highlightColor');
                    highlightedOptions.push(option);
                }
                
                console.log('Highlighted answer:', answerText);
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

        // Handle clicking if enabled
        if (configManager.getValue('autoClick')) {
            await new Promise(resolve => setTimeout(resolve, 300));

            for (const option of highlightedOptions) {
                const delay = configManager.getValue('useRandomDelay')
                    ? Math.random() * (configManager.getValue('maxDelay') - configManager.getValue('minDelay')) 
                        + configManager.getValue('minDelay')
                    : configManager.getValue('delay');
                
                await new Promise(resolve => setTimeout(resolve, delay));
                option.click();
                console.log('Clicked answer:', option.innerText);
            }

            if (isMultipleChoice) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await clickSaveButton();
            }
        }
    }

    async function processQuestion(questionData) {
        if (!questionData) return;

        // Format prompt for display/copying
        let prompt = `${questionData.question}\n\n`;
        for (const answer of questionData.answers) {
            prompt += `${answer}\n`;
        }
        settingsWindow.setLastPrompt(prompt);

        // Format prompt for AI
        let gptPrompt = `${questionData.question}\n\n`;
        gptPrompt += `Тип запитання: ${questionData.isMultipleChoice ? 'множинний вибір (декілька правильних відповідей)' : 'одиночний вибір (одна правильна відповідь)'}\n\n`;
        gptPrompt += `Варіанти відповідей:\n`;
        for (const answer of questionData.answers) {
            gptPrompt += `${answer}\n`;
        }

        try {
            const response = await provider.getAnswer(gptPrompt);
            
            // Filter responses to only include exact matches with the answer options
            if (Array.isArray(response)) {
                const validAnswers = response.filter(r => {
                    const trimmed = r.replace(/\s+/g, ' ').trim();  // Normalize whitespace
                    const isValid = questionData.answers.includes(trimmed);
                    return isValid;
                });
                if (validAnswers.length > 0) {
                    settingsWindow.setLastAnswer(validAnswers);
                    await highlightAnswer(validAnswers);
                } else {
                    console.log('No valid answers found in array response');
                }
            } else {
                console.log('Processing single answer...');
                const trimmedResponse = response.replace(/\s+/g, ' ').trim();  // Normalize whitespace
                console.log('Trimmed response:', JSON.stringify(trimmedResponse));
                console.log('Available answers:', questionData.answers.map(a => JSON.stringify(a)));
                const isValid = questionData.answers.includes(trimmedResponse);
                console.log(`Checking answer "${trimmedResponse}": ${isValid ? 'valid' : 'invalid'}`);
                if (isValid) {
                    settingsWindow.setLastAnswer(trimmedResponse);
                    await highlightAnswer(trimmedResponse);
                } else {
                    console.log('No valid answer found in single response');
                    // Try fuzzy matching as fallback
                    const matchingAnswer = questionData.answers.find(a => 
                        a.toLowerCase().includes(trimmedResponse.toLowerCase()) ||
                        trimmedResponse.toLowerCase().includes(a.toLowerCase())
                    );
                    if (matchingAnswer) {
                        console.log('Found fuzzy match:', matchingAnswer);
                        settingsWindow.setLastAnswer(matchingAnswer);
                        await highlightAnswer(matchingAnswer);
                    }
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