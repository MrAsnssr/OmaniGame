import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Connected to game server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from game server');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room actions
    createRoom(playerName, settings, gameMode) {
        this.socket?.emit('create-room', { playerName, settings, gameMode });
    }

    joinRoom(roomCode, playerName) {
        this.socket?.emit('join-room', { roomCode, playerName });
    }

    leaveRoom() {
        this.socket?.emit('leave-room');
    }

    // Game actions
    startGame(questions) {
        this.socket?.emit('start-game', { questions });
    }

    submitAnswer(answer) {
        this.socket?.emit('submit-answer', { answer });
    }

    timeUp() {
        this.socket?.emit('time-up');
    }

    // Turn-based actions
    selectCategory(categoryId) {
        this.socket?.emit('select-category', { categoryId });
    }

    selectType(typeId) {
        this.socket?.emit('select-type', { typeId });
    }

    // Event listeners
    on(event, callback) {
        this.socket?.on(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
export default socketService;
