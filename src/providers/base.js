export class BaseProvider {
    constructor() { }

    async getAnswer(prompt) {
        throw new Error('getAnswer must be implemented by provider');
    }
} 