import { BaseProvider } from './base';

export class MulaiProvider extends BaseProvider {
    constructor() {
        super();
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

        const response = await fetch('https://proxy.cors.sh/https://mulai.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cors-api-key': window.solveConfig.corsApiKey
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: this.systemMessage
                    },
                    {
                        role: "user",
                        content: formattedPrompt
                    }
                ]
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
                if (line.startsWith('0:"')) {
                    const content = line.slice(3, -1);
                    if (content) {
                        fullText += content;
                    }
                }
            }
        }

        // Clean up the response text
        fullText = fullText
            .replace(/<end_of_turn>/g, '')
            .replace(/<\|endoftext\|>/g, '')  // Remove endoftext token first
            .replace(/\\n/g, '\n')            // Convert literal \n to actual newlines
            .replace(/\s*\n\s*/g, '\n')       // Clean up whitespace around newlines
            .replace(/\s+/g, ' ')             // Normalize remaining whitespace to single spaces
            .trim();                          // Remove leading/trailing whitespace
        
        console.log('Cleaned response:', JSON.stringify(fullText)); // Log the cleaned response

        // Split response into array if it contains newlines
        if (fullText.includes('\n')) {
            const answers = fullText.split('\n')
                .map(answer => answer
                    .replace(/\*\*/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                )
                .filter(answer => answer.length > 0);
            console.log('Multiple answers:', JSON.stringify(answers));
            return answers;
        }

        // Return single answer
        const answer = fullText
            .replace(/\*\*/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        console.log('Single answer:', JSON.stringify(answer));
        return answer;
    }
}