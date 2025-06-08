import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToOpenAI } from '../services/openaiService';
import { clearContext } from '../services/langchainService';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            text: inputMessage,
            isUser: true,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await sendMessageToOpenAI(inputMessage);
            const botMessage = {
                text: response,
                isUser: false,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message to OpenAI:', error);
            const errorMessage = {
                text: "Sorry, I'm having trouble processing your request.",
                isUser: false,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setIsTyping(false);
    };

    const handleClearContext = () => {
        clearContext();
        setMessages([]);
    };

    return (
        <>
            <div className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'}`}></i>
            </div>

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="header-title">
                            <i className="fas fa-robot"></i>
                            <span>AI Assistant</span>
                        </div>
                        <div className="header-controls">
                            <i className="fas fa-trash" onClick={handleClearContext} title="Clear chat history"></i>
                            <i className="fas fa-times" onClick={() => setIsOpen(false)}></i>
                        </div>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
                            >
                                {message.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSend}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
