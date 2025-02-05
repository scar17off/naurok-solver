export class BaseProvider {
    constructor(letters) {
        this.letters = letters;
    }

    async getAnswer(prompt) {
        throw new Error('getAnswer must be implemented by provider');
    }
} 