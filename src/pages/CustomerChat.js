import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, sendMessage, getConversation } from '../services/api';
import { chatService } from '../services/chatService';
import '../styles/Chat.css';

const CustomerChat = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadEmployees();
    }, []);

    // Wrap loadMessages trong useCallback
    const loadMessages = useCallback(async () => {
        try {
            console.log('Loading messages for employee:', selectedEmployee);
            const data = await getConversation(selectedEmployee.userId);
            console.log('Received messages:', data);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
            if (error.response?.data) {
                console.error('Server error details:', error.response.data);
            }
        }
    }, [selectedEmployee]);

    useEffect(() => {
        if (selectedEmployee) {
            loadMessages();
        }
    }, [selectedEmployee, loadMessages]); // Thêm loadMessages vào dependencies

    // Thêm useEffect để kết nối SignalR
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

    const loadEmployees = async () => {
        try {
            const data = await getEmployees();
            // Chỉ lấy nhân viên có role là Staff
            const staffEmployees = data.filter(emp => emp.role.name === 'Staff');
            setEmployees(staffEmployees);
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            if (!newMessage.trim()) return;

            await sendMessage({
                receiverId: selectedEmployee.userId,
                content: newMessage
            });

            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="customers-list">
                <h2>Support Staff</h2>
                {employees.map(employee => (
                    <div
                        key={employee.id}
                        className={`customer-item ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                        onClick={() => setSelectedEmployee(employee)}
                    >
                        {employee.firstName} {employee.lastName}
                    </div>
                ))}
            </div>
            <div className="chat-main">
                {selectedEmployee ? (
                    <>
                        <div className="chat-header">
                            <h3>Chat with {selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
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
                        Select a staff member to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerChat;
