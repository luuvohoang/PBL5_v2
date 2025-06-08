import * as signalR from '@microsoft/signalr';

class ChatService {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/chatHub', {
                withCredentials: true,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        this.connectionPromise = null;
    }

    async ensureConnected() {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        if (this.connection.state === signalR.HubConnectionState.Connecting) {
            return new Promise((resolve) => {
                this.connection.onclose(() => resolve(this.ensureConnected()));
            });
        }

        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
            try {
                await this.connection.start();
                console.log('SignalR Connected');
            } catch (error) {
                console.error('SignalR Connection Error:', error);
                throw error;
            }
        }
    }

    async joinChat(userId) {
        if (!userId) {
            throw new Error('UserId is required');
        }

        try {
            await this.ensureConnected();
            await this.connection.invoke('JoinChat', userId.toString());
            console.log('Successfully joined chat with userId:', userId);
        } catch (error) {
            console.error('Error joining chat:', error);
            throw error;
        }
    }

    onReceiveMessage(callback) {
        if (!this.connection) return;
        this.connection.on('ReceiveMessage', callback);
    }

    removeReceiveMessageListener() {
        if (!this.connection) return;
        this.connection.off('ReceiveMessage');
    }

    async disconnect() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.stop();
                console.log('SignalR disconnected');
            } catch (error) {
                console.error('Error disconnecting SignalR:', error);
            }
        }
    }
}

// Tạo một instance duy nhất
const chatService = new ChatService();
export { chatService };
