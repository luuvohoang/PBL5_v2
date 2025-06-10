import { getChatChain } from './langchainService';

export const sendMessageToOpenAI = async (message) => {
    try {
        const chain = getChatChain();
        const response = await chain.call({
            input: message,
        });

        return response.response;
    } catch (error) {
        console.error('LangChain Error:', error);
        throw error;
    }
};
