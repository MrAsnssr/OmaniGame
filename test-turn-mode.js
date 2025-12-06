import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

const socket1 = io(SOCKET_URL);
const socket2 = io(SOCKET_URL);

let roomCode = '';
let turnData = null;

console.log('Connecting...');

socket1.on('connect', () => {
    console.log('Player 1 connected:', socket1.id);
    socket1.emit('create-room', {
        playerName: 'Player1',
        settings: { questionCount: 5, timePerQuestion: 30 },
        gameMode: 'turn-based'
    });
});

socket1.on('room-created', (data) => {
    console.log('Room created:', data.roomCode, 'Mode:', data.gameMode);
    roomCode = data.roomCode;
    socket2.emit('join-room', { roomCode, playerName: 'Player2' });
});

socket2.on('room-joined', (data) => {
    console.log('Player 2 joined');
    const mockQuestions = [
        { id: 1, type: 'multiple-choice', category: 'history', question: 'Q1', answer: 'A' },
        { id: 2, type: 'fill-blank', category: 'history', question: 'Q2', answer: 'B' }
    ];
    console.log('Starting game...');
    socket1.emit('start-game', { questions: mockQuestions });
});

const handleEvent = (name, socketName, data) => {
    console.log(`[${socketName}] ${name}:`, JSON.stringify(data, null, 2));

    if (name === 'turn-start') {
        turnData = data;
        checkTurn(socket1, 'P1');
        checkTurn(socket2, 'P2');
    }

    if (name === 'category-selected') {
        console.log('Category selected, checking type selection...');
        // We need to know who is type selector. It was in turn-start data.
        if (turnData) {
            if (turnData.typeSelectorId === socket1.id) {
                console.log('P1 selecting type...');
                socket1.emit('select-type', { typeId: 'multiple-choice' });
            } else if (turnData.typeSelectorId === socket2.id) {
                console.log('P2 selecting type...');
                socket2.emit('select-type', { typeId: 'multiple-choice' });
            }
        }
    }

    if (name === 'question-generated') {
        console.log('SUCCESS: Question generated!');
        process.exit(0);
    }
};

function checkTurn(socket, name) {
    if (!turnData) return;
    if (turnData.phase === 'category' && turnData.categorySelectorId === socket.id) {
        console.log(`${name} selecting category...`);
        socket.emit('select-category', { categoryId: 'history' });
    }
}

socket1.on('turn-start', (data) => handleEvent('turn-start', 'P1', data));
socket2.on('turn-start', (data) => handleEvent('turn-start', 'P2', data));

socket1.on('category-selected', (data) => handleEvent('category-selected', 'P1', data));
socket2.on('category-selected', (data) => handleEvent('category-selected', 'P2', data));

socket1.on('question-generated', (data) => handleEvent('question-generated', 'P1', data));

// Timeout
setTimeout(() => {
    console.log('Timeout - Test Failed');
    process.exit(1);
}, 10000);
