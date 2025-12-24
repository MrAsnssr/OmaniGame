import { io, Socket } from 'socket.io-client';

// Server URL - update this with your production server URL
const SOCKET_URL = __DEV__ ? 'http://192.168.1.100:3001' : 'https://your-server.com';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function> = new Map();

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
    createRoom(playerName: string, settings: any, gameMode: string) {
        this.socket?.emit('create-room', { playerName, settings, gameMode });
    }

    joinRoom(roomCode: string, playerName: string) {
        this.socket?.emit('join-room', { roomCode, playerName });
    }

    leaveRoom() {
        this.socket?.emit('leave-room');
    }

    // Game actions
    startGame(questions: any[]) {
        this.socket?.emit('start-game', { questions });
    }

    submitAnswer(answer: any) {
        this.socket?.emit('submit-answer', { answer });
    }

    updateAnswer(answer: any) {
        this.socket?.emit('answer-update', { answer });
    }

    timeUp() {
        this.socket?.emit('time-up');
    }

    // Turn-based actions
    selectCategory(categoryId: string) {
        this.socket?.emit('select-category', { categoryId });
    }

    selectType(typeId: string) {
        this.socket?.emit('select-type', { typeId });
    }

    restartGame() {
        this.socket?.emit('restart-game');
    }

    // Event listeners
    on(event: string, callback: Function) {
        this.socket?.on(event, callback as any);
    }

    off(event: string, callback?: Function) {
        this.socket?.off(event, callback as any);
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
export default socketService;
