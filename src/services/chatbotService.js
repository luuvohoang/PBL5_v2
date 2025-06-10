import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { getProductsForAI, getCategoriesForAI } from './productQueryService';

class ChatbotService {
    constructor() {
        this.model = new ChatOpenAI({
            openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
            temperature: 0.7,
            modelName: 'gpt-3.5-turbo',
        });

        this.memory = new BufferMemory();

        this.chain = new ConversationChain({
            llm: this.model,
            memory: this.memory,
        });
        
        this.initializeContext();
    }

    async initializeContext() {
        try {
            const products = await getProductsForAI();
            const categories = await getCategoriesForAI();

            const systemPrompt = `
                Bạn là một chuyên gia về linh kiện máy tính tại cửa hàng của chúng tôi. Bạn có thể:
                1. Tư vấn về cấu hình PC
                2. Giải thích về thông số kỹ thuật
                3. So sánh các sản phẩm trong cửa hàng
                4. Đề xuất linh kiện phù hợp với ngân sách
                5. Hướng dẫn xử lý sự cố cơ bản

                Danh mục sản phẩm của cửa hàng:
                ${categories.map(c => `- ${c.name}: ${c.description || 'Danh mục linh kiện PC'}`).join('\n')}

                Sản phẩm hiện có:
                ${products.map(p => `- ${p.name}: ${p.description} - Giá: ${p.price}`).join('\n')}
            `;
            
            await this.chain.call({ input: systemPrompt });
        } catch (error) {
            console.error('Error initializing chatbot context:', error);
        }
    }

    async sendMessage(message) {
        try {
            const response = await this.chain.call({
                input: message
            });
            return response.response;
        } catch (error) {
            console.error('Chatbot error:', error);
            return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
        }
    }

    clearMemory() {
        this.memory.clear();
        this.initializeContext();
    }
}

export default new ChatbotService();
