import { BaseProvider } from './base';

export class OpenAIProvider extends BaseProvider {
    constructor(letters) {
        super(letters);
        this.systemMessage = `You are an AI assistant helping with test questions.

Instructions:
1. You will receive test questions with multiple choice answers
2. The question type will be specified (single choice or multiple choice)
3. For single answer questions, respond in this format:
   **[Letter]) Answer text**
   
   For multiple answer questions, list each correct answer on a new line:
   **[Letter1]) Answer text**
   **[Letter2]) Answer text**
   
4. Use only one letter per answer
5. Be concise and confident in your response
6. Make sure to provide the correct number of answers based on the question type`;
    }

    async getAnswer(prompt) {
        const formattedPrompt = `${prompt}

Remember:
- For single choice questions, provide exactly one answer like: **A) Answer text**
- For multiple choice questions, list each answer like:
  **A) First answer**
  **B) Second answer**
- Always use ** around the letter and )
- Don't add any explanations before the answer, start with **`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.solveConfig.openaiApiKey || ''}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: this.systemMessage
                    },
                    {
                        role: "user",
                        content: formattedPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 150,
                stream: true
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid OpenAI API key');
            }
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        let fullText = '';
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value);
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const json = JSON.parse(data);
                        if (json.choices[0].delta.content) {
                            fullText += json.choices[0].delta.content;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }

        console.log('OpenAI response:', fullText);

        // Letter mapping from Latin to Cyrillic
        const letterMap = {
            'A': 'А',
            'B': 'Б',
            'C': 'С',
            'D': 'Д',
            'E': 'Е',
            'F': 'Ф',
            'G': 'Г',
            'H': 'Г',
            'I': 'І',
            'J': 'Й',
            'K': 'К',
            'L': 'Л',
            'M': 'М',
            'N': 'Н',
            'O': 'О',
            'P': 'П',
            'Q': 'К',
            'R': 'Р',
            'S': 'С',
            'T': 'Т',
            'U': 'У',
            'V': 'В',
            'W': 'В',
            'X': 'Х',
            'Y': 'У',
            'Z': 'З'
        };

        // Updated regex patterns to handle both Cyrillic and Latin letters
        const patterns = [
            /\*\*([АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ])\)/g,
            /відповідь:\s*([АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ])/gi,
            /^([АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ])\)/gm,
            /([АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ])\)\s+[\wІіЇїЄєҐґ]/g
        ];

        // Try each pattern and collect all matches
        for (const pattern of patterns) {
            const matches = Array.from(fullText.matchAll(pattern))
                .map(match => {
                    const letter = match[1];
                    return letterMap[letter] || letter;
                })
                .filter(letter => this.letters.includes(letter));

            if (matches.length > 0) {
                console.log('Extracted answer letter(s):', matches);
                return matches.length === 1 ? matches[0] : matches;
            }
        }

        console.log('No letters found using any pattern');
        return fullText;
    }
} 