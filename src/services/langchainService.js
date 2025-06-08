import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";

let chain = null;

export const initializeLangChain = () => {
    const chat = new ChatOpenAI({
        openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo',
    });

    const memory = new BufferMemory();

    chain = new ConversationChain({
        llm: chat,
        memory: memory,
    });

    return chain;
};

export const clearContext = () => {
    if (chain && chain.memory) {
        chain.memory.clear();
    }
    chain = initializeLangChain();
};

export const getChatChain = () => {
    if (!chain) {
        chain = initializeLangChain();
    }
    return chain;
};
