import { BaseProvider } from './base';

export class GPT24Provider extends BaseProvider {
    constructor() {
        super();
        this.userId = `#/chat/${Date.now()}`;
        this.systemMessage = `You are an AI assistant helping with test questions.

Instructions:
1. You will receive test questions with multiple choice answers
2. The question type will be specified (single choice or multiple choice)
3. For single answer questions, select and copy-paste exactly one answer text from the given options
4. For multiple answer questions, copy-paste each correct answer text from the given options on a new line
5. Be concise and respond only with the exact answer text(s) from the options
6. Do not explain, rephrase, or add any other text`;
    }

    async getAnswer(prompt) {
        const formattedPrompt = `${prompt}

Remember:
- Select and copy-paste the exact answer text(s) from the given options
- For single choice questions, provide exactly one answer
- For multiple choice questions, put each answer on a new line
- Do not add any explanations or extra text`;

        const response = await fetch('https://gpt24-ecru.vercel.app/api/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
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
                stream: true,
                model: "gpt-4o-mini",
                temperature: 0.5,
                presence_penalty: 0,
                frequency_penalty: 0,
                top_p: 1,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
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

        // Clean up the response text
        fullText = fullText
            .replace(/\*\*/g, '')            // Remove any ** markers
            .replace(/<\|endoftext\|>/g, '') // Remove endoftext token
            .replace(/\\n/g, ' ')            // Replace literal \n with space
            .replace(/\n+/g, ' ')            // Replace actual newlines with space
            .replace(/\s+/g, ' ')            // Normalize all whitespace to single spaces
            .trim();                         // Remove leading/trailing whitespace
        
        console.log('GPT24 edited response:', fullText);

        // Split response into array if multiple answers and clean each answer
        const answers = fullText.split('\n')
            .map(answer => answer
                .replace(/\*\*/g, '')
                .replace(/<\|endoftext\|>/g, '')
                .replace(/\\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
            )
            .filter(answer => answer.length > 0);
        
        return answers.length === 1 ? answers[0] : answers;
    }
} 