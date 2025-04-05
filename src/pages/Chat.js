import React, { useState, useEffect, useCallback } from 'react';
import { getCustomers, sendMessage, getConversation } from '../services/api';
import { chatService } from '../services/chatService';
import '../styles/Chat.css';

const Chat = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const loadMessages = useCallback(async () => {
        try {
            console.log('Loading messages for customer:', selectedCustomer);
            const data = await getConversation(selectedCustomer.id);
            console.log('Received messages:', data);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
            if (error.response?.data) {
                console.error('Server error details:', error.response.data);
            }
        }
    }, [selectedCustomer]);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            loadMessages();
        }
    }, [selectedCustomer, loadMessages]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const initializeChat = async () => {
                try {
                    await chatService.joinChat(user.id);
                    chatService.onReceiveMessage((message) => {
                        setMessages(prev => [...prev, message]);
                    });
                } catch (error) {
                    console.error('Error initializing chat:', error);
                }
            };

            initializeChat();
        }

        return () => {
            chatService.removeReceiveMessageListener();
        };
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            if (!newMessage.trim()) return;

            await sendMessage({
                receiverId: selectedCustomer.id,
                content: newMessage
            });

            setNewMessage('');
            loadMessages(); // Reload messages
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="customers-list">
                <h2>Customers</h2>
                {customers.map(customer => (
                    <div
                        key={customer.id}
                        className={`customer-item ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCustomer(customer)}
                    >
                        {customer.username}
                    </div>
                ))}
            </div>
            <div className="chat-main">
                {selectedCustomer ? (
                    <>
                        <div className="chat-header">
                            <h3>Chat with {selectedCustomer.username}</h3>
                        </div>
                        <div className="messages-container">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.senderId === currentUser.id ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">{message.content}</div>
                                    <div className="message-time">
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        Select a customer to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
