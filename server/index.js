import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"]
    }
});

// Store active rooms
const rooms = new Map();

// Generate 6-character room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create a new room
function createRoom(hostId, hostName, settings, gameMode = 'standard') {
    let code = generateRoomCode();
    while (rooms.has(code)) {
        code = generateRoomCode();
    }

    const room = {
        code,
        hostId,
        gameMode, // 'standard' or 'turn-based'
        players: [{
            id: hostId,
            name: hostName,
            score: 0,
            isHost: true,
            connected: true
        }],
        settings: {
            questionCount: settings.questionCount || 10,
            timePerQuestion: settings.timePerQuestion || 30,
            selectedTypes: settings.selectedTypes || ['multiple-choice', 'fill-blank', 'order', 'match'],
            categoryId: settings.categoryId || null
        },
        questions: [], // Active questions for the game
        allQuestions: [], // All questions (for turn-based filtering)
        currentQuestionIndex: -1,
        state: 'waiting', // waiting, playing, selecting-category, selecting-type, showing-leaderboard, finished
        answers: new Map(),
        questionStartTime: null,

        // Turn-based state
        turnIndex: 0,
        categorySelectorId: null,
        typeSelectorId: null,
        currentCategory: null,
        currentType: null
    };

    rooms.set(code, room);
    return room;
}

function getRoom(code) {
    return rooms.get(code?.toUpperCase());
}

function calculatePoints(isCorrect, timeTaken, maxTime) {
    if (!isCorrect) return 0;
    const speedBonus = Math.max(0, Math.floor(100 * (1 - timeTaken / maxTime)));
    return 100 + speedBonus;
}

// Assign roles for the current turn
function assignRoles(room) {
    const connectedPlayers = room.players.filter(p => p.connected);
    const count = connectedPlayers.length;

    // Simple rotation
    const catIndex = room.turnIndex % count;
    const typeIndex = (room.turnIndex + 1) % count;

    room.categorySelectorId = connectedPlayers[catIndex].id;
    room.typeSelectorId = connectedPlayers[typeIndex].id;

    return {
        categorySelector: connectedPlayers[catIndex],
        typeSelector: connectedPlayers[typeIndex]
    };
}

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Create a new room
    socket.on('create-room', ({ playerName, settings, gameMode }) => {
        const room = createRoom(socket.id, playerName, settings, gameMode);
        socket.join(room.code);
        socket.roomCode = room.code;

        socket.emit('room-created', {
            roomCode: room.code,
            players: room.players,
            settings: room.settings,
            gameMode: room.gameMode,
            isHost: true
        });

        console.log(`Room ${room.code} created by ${playerName} (${gameMode})`);
    });

    // Join existing room
    socket.on('join-room', ({ roomCode, playerName }) => {
        const room = getRoom(roomCode);

        if (!room) {
            socket.emit('join-error', { message: 'Room not found' });
            return;
        }

        if (room.state !== 'waiting') {
            socket.emit('join-error', { message: 'Game already in progress' });
            return;
        }

        if (room.players.length >= 10) {
            socket.emit('join-error', { message: 'Room is full' });
            return;
        }

        room.players.push({
            id: socket.id,
            name: playerName,
            score: 0,
            isHost: false,
            connected: true
        });

        socket.join(roomCode.toUpperCase());
        socket.roomCode = roomCode.toUpperCase();

        socket.emit('room-joined', {
            roomCode: room.code,
            players: room.players,
            settings: room.settings,
            gameMode: room.gameMode,
            isHost: false
        });

        socket.to(room.code).emit('player-joined', {
            players: room.players
        });

        console.log(`${playerName} joined room ${room.code}`);
    });

    // Start game
    socket.on('start-game', ({ questions }) => {
        const room = getRoom(socket.roomCode);
        if (!room || room.hostId !== socket.id) return;

        if (room.players.length < 2) {
            socket.emit('start-error', { message: 'Need at least 2 players' });
            return;
        }

        if (room.gameMode === 'turn-based') {
            // Turn-Based Mode
            room.allQuestions = questions;
            room.state = 'selecting-category';
            room.currentQuestionIndex = 0;

            // Get unique category IDs from questions
            const uniqueCategories = [...new Set(questions.map(q => q.category))];
            room.uniqueCategoryIds = uniqueCategories;

            const roles = assignRoles(room);

            // Pick 3 random categories
            const shuffledCats = [...room.uniqueCategoryIds].sort(() => Math.random() - 0.5);
            const turnCategories = shuffledCats.slice(0, 3);
            room.turnCategoryIds = turnCategories;

            io.to(room.code).emit('turn-start', {
                turnIndex: 0,
                totalTurns: room.settings.questionCount,
                categorySelectorId: roles.categorySelector.id,
                typeSelectorId: roles.typeSelector.id,
                phase: 'category',
                availableCategoryIds: turnCategories
            });
        } else {
            // Standard Mode
            room.questions = questions;
            room.state = 'playing';
            room.currentQuestionIndex = 0;
            room.questionStartTime = Date.now();

            io.to(room.code).emit('game-started', {
                question: room.questions[0],
                questionIndex: 0,
                totalQuestions: room.questions.length,
                timeLimit: room.settings.timePerQuestion
            });
        }

        console.log(`Game started in room ${room.code} (${room.gameMode})`);
    });

    // Turn-Based: Select Category
    socket.on('select-category', ({ categoryId }) => {
        const room = getRoom(socket.roomCode);
        if (!room || room.state !== 'selecting-category') return;
        if (room.categorySelectorId !== socket.id) return;

        room.currentCategory = categoryId;
        room.state = 'selecting-type';

        io.to(room.code).emit('category-selected', {
            categoryId,
            nextPhase: 'type'
        });
    });

    // Turn-Based: Select Type
    socket.on('select-type', ({ typeId }) => {
        const room = getRoom(socket.roomCode);
        if (!room || room.state !== 'selecting-type') return;
        if (room.typeSelectorId !== socket.id) return;

        room.currentType = typeId;

        // Filter questions - strict matching only
        let available = room.allQuestions.filter(q =>
            (!room.currentCategory || q.category === room.currentCategory) &&
            q.type === typeId
        );

        // No fallback - if no match, notify and revert to category selection
        if (available.length === 0) {
            room.state = 'selecting-category';
            room.currentCategory = null;
            room.currentType = null;

            io.to(room.code).emit('no-questions', {
                message: 'No questions available for this category + type combo. Please try again!',
                phase: 'category'
            });

            // Re-emit turn-start to go back to category selection (reuse same categories)
            io.to(room.code).emit('turn-start', {
                turnIndex: room.turnIndex,
                totalTurns: room.settings.questionCount,
                categorySelectorId: room.categorySelectorId,
                typeSelectorId: room.typeSelectorId,
                phase: 'category',
                availableCategoryIds: room.turnCategoryIds
            });
            return;
        }

        const randomQuestion = available[Math.floor(Math.random() * available.length)];

        room.questions.push(randomQuestion);
        room.currentQuestionIndex = room.questions.length - 1;
        room.state = 'playing';
        room.questionStartTime = Date.now();
        room.answers.clear();

        io.to(room.code).emit('question-generated', {
            question: randomQuestion,
            questionIndex: room.currentQuestionIndex,
            totalQuestions: room.settings.questionCount,
            timeLimit: room.settings.timePerQuestion
        });
    });

    // Submit answer
    socket.on('submit-answer', ({ answer }) => {
        const room = getRoom(socket.roomCode);
        if (!room || room.state !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || room.answers.has(socket.id)) return;

        const timeTaken = (Date.now() - room.questionStartTime) / 1000;

        room.answers.set(socket.id, {
            answer,
            timeTaken,
            submittedAt: Date.now()
        });

        io.to(room.code).emit('player-answered', {
            playerId: socket.id,
            answeredCount: room.answers.size,
            totalPlayers: room.players.filter(p => p.connected).length
        });

        const connectedPlayers = room.players.filter(p => p.connected);
        if (room.answers.size >= connectedPlayers.length) {
            processRoundEnd(room);
        }
    });

    socket.on('time-up', () => {
        const room = getRoom(socket.roomCode);
        if (!room || room.hostId !== socket.id || room.state !== 'playing') return;
        processRoundEnd(room);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        const room = getRoom(socket.roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.connected = false;

            io.to(room.code).emit('player-left', {
                playerId: socket.id,
                playerName: player.name,
                players: room.players
            });

            if (room.hostId === socket.id) {
                const newHost = room.players.find(p => p.connected);
                if (newHost) {
                    room.hostId = newHost.id;
                    newHost.isHost = true;
                    io.to(room.code).emit('new-host', { hostId: newHost.id });
                } else {
                    rooms.delete(room.code);
                }
            }
        }
    });

    socket.on('leave-room', () => {
        const room = getRoom(socket.roomCode);
        if (room) {
            room.players = room.players.filter(p => p.id !== socket.id);
            socket.leave(room.code);

            io.to(room.code).emit('player-left', {
                playerId: socket.id,
                players: room.players
            });

            if (room.players.length === 0) {
                rooms.delete(room.code);
            }
        }
        socket.roomCode = null;
    });
});

function processRoundEnd(room) {
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const results = [];

    room.players.forEach(player => {
        if (!player.connected) return;

        const answerData = room.answers.get(player.id);
        let isCorrect = false;
        let points = 0;

        if (answerData) {
            if (currentQuestion.type === 'multiple-choice') {
                isCorrect = answerData.answer === currentQuestion.answer;
            } else if (currentQuestion.type === 'fill-blank') {
                isCorrect = answerData.answer?.toLowerCase().trim() === currentQuestion.answer?.toLowerCase().trim();
            } else if (currentQuestion.type === 'order') {
                isCorrect = JSON.stringify(answerData.answer) === JSON.stringify(currentQuestion.correctOrder);
            } else if (currentQuestion.type === 'match') {
                const userAnswer = answerData.answer || {};
                isCorrect = Object.entries(userAnswer).every(([leftId, rightId]) => {
                    const leftIndex = leftId.split('-')[1];
                    const rightIndex = rightId.split('-')[1];
                    return leftIndex === rightIndex;
                }) && Object.keys(userAnswer).length === currentQuestion.pairs?.length;
            }

            points = calculatePoints(isCorrect, answerData.timeTaken, room.settings.timePerQuestion);
            player.score += points;
        }

        results.push({
            playerId: player.id,
            playerName: player.name,
            isCorrect,
            points,
            totalScore: player.score,
            timeTaken: answerData?.timeTaken || room.settings.timePerQuestion
        });
    });

    results.sort((a, b) => b.totalScore - a.totalScore);
    results.forEach((r, i) => r.rank = i + 1);

    room.state = 'showing-leaderboard';

    io.to(room.code).emit('round-results', {
        results,
        correctAnswer: currentQuestion.answer || currentQuestion.correctOrder,
        questionIndex: room.currentQuestionIndex,
        totalQuestions: room.settings.questionCount
    });

    // Check if game is over
    const maxQuestions = room.settings.questionCount;
    const isFinished = room.gameMode === 'standard'
        ? room.currentQuestionIndex >= room.questions.length - 1
        : room.questions.length >= maxQuestions;

    if (isFinished) {
        room.state = 'finished';
        io.to(room.code).emit('game-over', {
            finalResults: results,
            winner: results[0]
        });
    } else {
        // Advance to next question or turn
        setTimeout(() => {
            if (room.state === 'showing-leaderboard') {
                if (room.gameMode === 'turn-based') {
                    // Start next turn
                    room.turnIndex++;
                    room.state = 'selecting-category';
                    room.currentCategory = null;
                    room.currentType = null;

                    const roles = assignRoles(room);

                    // Pick 3 random categories for the new turn
                    const shuffledCats = [...room.uniqueCategoryIds].sort(() => Math.random() - 0.5);
                    const turnCategories = shuffledCats.slice(0, 3);
                    room.turnCategoryIds = turnCategories;

                    io.to(room.code).emit('turn-start', {
                        turnIndex: room.turnIndex,
                        totalTurns: room.settings.questionCount,
                        categorySelectorId: roles.categorySelector.id,
                        typeSelectorId: roles.typeSelector.id,
                        phase: 'category',
                        availableCategoryIds: turnCategories
                    });
                } else {
                    // Standard mode: next question
                    room.currentQuestionIndex++;
                    room.answers.clear();
                    room.state = 'playing';
                    room.questionStartTime = Date.now();

                    io.to(room.code).emit('next-question', {
                        question: room.questions[room.currentQuestionIndex],
                        questionIndex: room.currentQuestionIndex,
                        totalQuestions: room.questions.length,
                        timeLimit: room.settings.timePerQuestion
                    });
                }
            }
        }, 4000);
    }
}

// Setup static file serving BEFORE socket.io routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');
const distIndexPath = path.join(distPath, 'index.html');

// Log paths for debugging
console.log('📁 Server directory:', __dirname);
console.log('📁 Dist path:', distPath);
console.log('📁 Index path:', distIndexPath);
console.log('📁 Dist exists?', fs.existsSync(distPath));
console.log('📁 Index exists?', fs.existsSync(distIndexPath));

// Serve static files from dist directory
if (fs.existsSync(distIndexPath)) {
    console.log('✅ Serving static files from:', distPath);
    app.use(express.static(distPath, {
        maxAge: '1d',
        etag: true
    }));
    
    // Handle client-side routing - must be LAST route
    app.get('*', (req, res) => {
        console.log('📄 Serving index.html for route:', req.path);
        res.sendFile(distIndexPath);
    });
} else {
    console.error('❌ ERROR: Client dist/ not found at:', distIndexPath);
    console.error('   Make sure to run "npm run build" before starting the server');
    
    // Fallback: serve a basic error page
    app.get('*', (req, res) => {
        res.status(500).send(`
            <html>
                <head><title>Build Error</title></head>
                <body>
                    <h1>Build Not Found</h1>
                    <p>The client build (dist/) was not found.</p>
                    <p>Expected path: ${distIndexPath}</p>
                    <p>Please run: npm run build</p>
                </body>
            </html>
        `);
    });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`🎮 Omani Quiz Server running on port ${PORT}`);
});
