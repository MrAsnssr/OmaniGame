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

const ALLOWED_TYPES = new Set(['multiple-choice', 'fill-blank', 'order', 'match']);
const TURN_SELECTION_SECONDS = 15;

function isNonEmptyString(x) {
    return typeof x === 'string' && x.trim().length > 0;
}

function validateQuestion(q) {
    if (!q || typeof q !== 'object') return false;
    if (!ALLOWED_TYPES.has(q.type)) return false;
    if (!isNonEmptyString(q.question)) return false;

    if (q.type === 'multiple-choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) return false;
        if (!isNonEmptyString(q.answer)) return false;
        return true;
    }
    if (q.type === 'fill-blank') {
        if (!isNonEmptyString(q.answer)) return false;
        return true;
    }
    if (q.type === 'order') {
        if (!Array.isArray(q.items) || q.items.length < 2) return false;
        if (!Array.isArray(q.correctOrder) || q.correctOrder.length !== q.items.length) return false;
        return true;
    }
    if (q.type === 'match') {
        if (!Array.isArray(q.pairs) || q.pairs.length < 2) return false;
        return true;
    }
    return false;
}

function sanitizeQuestionsForRoom(room, questions) {
    const list = Array.isArray(questions) ? questions : [];
    let filtered = list.filter(validateQuestion);

    // Filter by selected topics (if any specified)
    const selectedTopicIds = room.settings.selectedTopicIds || [];
    if (selectedTopicIds.length > 0) {
        filtered = filtered.filter(q => selectedTopicIds.includes(q.category));
    }

    // Enforce selected types for random mode (server-side)
    if (room.gameMode === 'random' && Array.isArray(room.settings.selectedTypes)) {
        const allowed = new Set(room.settings.selectedTypes.filter(t => ALLOWED_TYPES.has(t)));
        filtered = filtered.filter(q => allowed.has(q.type));
    }
    return filtered;
}

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
function createRoom(hostId, hostName, settings, gameMode = 'random') {
    let code = generateRoomCode();
    while (rooms.has(code)) {
        code = generateRoomCode();
    }

    const room = {
        code,
        hostId,
        gameMode, // 'random' or 'turn-based'
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
            categoryId: settings.categoryId || null,
            selectedTopicIds: Array.isArray(settings.selectedTopicIds) ? settings.selectedTopicIds : []
        },
        questions: [], // Active questions for the game
        allQuestions: [], // All questions (for turn-based filtering)
        currentQuestionIndex: -1,
        state: 'waiting', // waiting, playing, selecting-category, selecting-type, showing-leaderboard, finished
        answers: new Map(),
        draftAnswers: new Map(), // socketId -> { answer, updatedAt }
        questionStartTime: null,
        answerTimer: null,
        selectionTimer: null,

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

// Levenshtein distance for fuzzy matching (allows typos)
function levenshteinDistance(a, b) {
    const aa = String(a ?? '');
    const bb = String(b ?? '');
    const matrix = [];
    for (let i = 0; i <= bb.length; i++) matrix[i] = [i];
    for (let j = 0; j <= aa.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= bb.length; i++) {
        for (let j = 1; j <= aa.length; j++) {
            if (bb.charAt(i - 1) === aa.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[bb.length][aa.length];
}

function clearRoomTimer(room, key) {
    if (!room) return;
    if (room[key]) {
        clearTimeout(room[key]);
        room[key] = null;
    }
}

function clearAnswerTimer(room) {
    clearRoomTimer(room, 'answerTimer');
}

function clearSelectionTimer(room) {
    clearRoomTimer(room, 'selectionTimer');
}

function startTurnSelectionTimer(room, phase) {
    clearSelectionTimer(room);
    const ms = TURN_SELECTION_SECONDS * 1000;
    room.selectionTimer = setTimeout(() => {
        if (!room) return;
        if (phase === 'category') {
            if (room.state !== 'selecting-category') return;
            const choices = Array.isArray(room.turnCategoryIds) ? room.turnCategoryIds : [];
            const picked = choices.length > 0 ? choices[Math.floor(Math.random() * choices.length)] : null;
            if (!picked) return;
            room.currentCategory = picked;
            room.state = 'selecting-type';
            io.to(room.code).emit('category-selected', { categoryId: picked, nextPhase: 'type' });
            startTurnSelectionTimer(room, 'type');
        } else if (phase === 'type') {
            if (room.state !== 'selecting-type') return;
            const types = Array.from(ALLOWED_TYPES);
            const picked = types[Math.floor(Math.random() * types.length)];
            // Reuse existing selection logic by directly setting and generating question
            room.currentType = picked;

            let available = room.allQuestions.filter(q =>
                (!room.currentCategory || q.category === room.currentCategory) &&
                q.type === picked
            );

            if (available.length === 0) {
                room.state = 'selecting-category';
                room.currentCategory = null;
                room.currentType = null;

                io.to(room.code).emit('no-questions', {
                    message: 'No questions available for this category + type combo. Please try again!',
                    phase: 'category'
                });

                io.to(room.code).emit('turn-start', {
                    turnIndex: room.turnIndex,
                    totalTurns: room.settings.questionCount,
                    categorySelectorId: room.categorySelectorId,
                    typeSelectorId: room.typeSelectorId,
                    phase: 'category',
                    availableCategoryIds: room.turnCategoryIds
                });
                startTurnSelectionTimer(room, 'category');
                return;
            }

            const randomQuestion = available[Math.floor(Math.random() * available.length)];
            room.questions.push(randomQuestion);
            room.currentQuestionIndex = room.questions.length - 1;
            room.state = 'playing';
            room.questionStartTime = Date.now();
            room.answers.clear();
            room.draftAnswers.clear();
            startAnswerTimer(room);

            io.to(room.code).emit('question-generated', {
                question: randomQuestion,
                questionIndex: room.currentQuestionIndex,
                totalQuestions: room.settings.questionCount,
                timeLimit: room.settings.timePerQuestion
            });
        }
    }, ms);
}

function getConnectedPlayers(room) {
    return room.players.filter(p => p.connected);
}

function getAnsweredCount(room) {
    const connected = getConnectedPlayers(room);
    let count = 0;
    for (const p of connected) {
        if (room.answers.has(p.id)) count++;
    }
    return count;
}

function startAnswerTimer(room) {
    clearAnswerTimer(room);
    const ms = Math.max(1, Number(room.settings.timePerQuestion || 30) * 1000);
    room.answerTimer = setTimeout(() => {
        if (room.state !== 'playing') return;
        processRoundEnd(room, { reason: 'timeout' });
    }, ms);
}

function finalizeDraftAnswers(room) {
    if (!room || room.state !== 'playing') return;
    const maxTime = Number(room.settings.timePerQuestion || 30);
    const connected = getConnectedPlayers(room);

    for (const player of connected) {
        if (room.answers.has(player.id)) continue;
        const draft = room.draftAnswers.get(player.id);
        if (!draft) continue;

        const timeTaken = room.questionStartTime
            ? Math.min(maxTime, Math.max(0, (draft.updatedAt - room.questionStartTime) / 1000))
            : maxTime;

        room.answers.set(player.id, {
            answer: draft.answer,
            timeTaken,
            submittedAt: draft.updatedAt,
            source: 'draft'
        });
    }
}

// Assign roles for the current turn
function assignRoles(room) {
    const connectedPlayers = getConnectedPlayers(room);
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
            const sanitized = sanitizeQuestionsForRoom(room, questions);
            if (sanitized.length === 0) {
                socket.emit('start-error', { message: 'No valid questions available for this game.' });
                return;
            }
            room.allQuestions = sanitized;
            room.state = 'selecting-category';
            room.currentQuestionIndex = 0;
            room.questions = [];
            room.answers.clear();
            room.draftAnswers.clear();
            clearAnswerTimer(room);
            clearSelectionTimer(room);

            // Get unique category IDs from sanitized questions (respects selected topics)
            const uniqueCategories = [...new Set(sanitized.map(q => q.category))];
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
            startTurnSelectionTimer(room, 'category');
        } else {
            // Standard Mode
            const sanitized = sanitizeQuestionsForRoom(room, questions);
            if (sanitized.length === 0) {
                socket.emit('start-error', { message: 'No valid questions available for this game.' });
                return;
            }
            room.questions = sanitized;
            room.state = 'playing';
            room.currentQuestionIndex = 0;
            room.questionStartTime = Date.now();
            room.answers.clear();
            room.draftAnswers.clear();
            clearSelectionTimer(room);
            startAnswerTimer(room);

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
        clearSelectionTimer(room);
        startTurnSelectionTimer(room, 'type');

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
        clearSelectionTimer(room);

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
            startTurnSelectionTimer(room, 'category');
            return;
        }

        const randomQuestion = available[Math.floor(Math.random() * available.length)];

        room.questions.push(randomQuestion);
        room.currentQuestionIndex = room.questions.length - 1;
        room.state = 'playing';
        room.questionStartTime = Date.now();
        room.answers.clear();
        room.draftAnswers.clear();
        startAnswerTimer(room);

        io.to(room.code).emit('question-generated', {
            question: randomQuestion,
            questionIndex: room.currentQuestionIndex,
            totalQuestions: room.settings.questionCount,
            timeLimit: room.settings.timePerQuestion
        });
    });

    // Draft answer updates (no submit required)
    socket.on('answer-update', ({ answer }) => {
        const room = getRoom(socket.roomCode);
        if (!room || room.state !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || room.answers.has(socket.id)) return; // ignore updates after final answer exists

        room.draftAnswers.set(socket.id, { answer, updatedAt: Date.now() });

        io.to(room.code).emit('player-answered', {
            playerId: socket.id,
            answeredCount: getAnsweredCount(room),
            totalPlayers: getConnectedPlayers(room).length
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
        room.draftAnswers.delete(socket.id);

        io.to(room.code).emit('player-answered', {
            playerId: socket.id,
            answeredCount: getAnsweredCount(room),
            totalPlayers: getConnectedPlayers(room).length
        });

        const connectedPlayers = getConnectedPlayers(room);
        if (room.answers.size >= connectedPlayers.length) {
            processRoundEnd(room, { reason: 'all_answered' });
        }
    });

    socket.on('time-up', () => {
        const room = getRoom(socket.roomCode);
        if (!room || room.hostId !== socket.id || room.state !== 'playing') return;
        processRoundEnd(room, { reason: 'host_time_up' });
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
                    clearAnswerTimer(room);
                    clearSelectionTimer(room);
                    rooms.delete(room.code);
                }
            }
        }
    });

    socket.on('leave-room', () => {
        const room = getRoom(socket.roomCode);
        if (room) {
            room.players = room.players.filter(p => p.id !== socket.id);
            room.answers.delete(socket.id);
            room.draftAnswers.delete(socket.id);
            socket.leave(room.code);

            io.to(room.code).emit('player-left', {
                playerId: socket.id,
                players: room.players
            });

            if (room.players.length === 0) {
                clearAnswerTimer(room);
                clearSelectionTimer(room);
                rooms.delete(room.code);
            }
        }
        socket.roomCode = null;
    });

    // Restart game - reset room to waiting state (only host can trigger)
    socket.on('restart-game', () => {
        const room = getRoom(socket.roomCode);
        if (!room) return;
        if (room.hostId !== socket.id) return;

        // Clear timers
        clearAnswerTimer(room);
        clearSelectionTimer(room);

        // Reset room state
        room.state = 'waiting';
        room.questions = [];
        room.allQuestions = [];
        room.currentQuestionIndex = 0;
        room.answers.clear();
        room.draftAnswers.clear();
        room.turnIndex = 0;
        room.currentCategory = null;
        room.currentType = null;
        room.categorySelectorId = null;
        room.typeSelectorId = null;
        room.turnCategoryIds = [];
        room.questionStartTime = null;

        // Reset player scores
        room.players.forEach(p => {
            p.score = 0;
        });

        // Notify all players to go back to waiting room
        io.to(room.code).emit('game-restarted', {
            roomCode: room.code,
            players: room.players,
            settings: room.settings,
            gameMode: room.gameMode
        });

        console.log(`Game restarted in room ${room.code}`);
    });
});

function processRoundEnd(room, { reason } = {}) {
    if (!room || room.state !== 'playing') return;
    clearAnswerTimer(room);

    // If players interacted but didn't submit, count their latest state at timeout
    finalizeDraftAnswers(room);

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
                const user = String(answerData.answer ?? '').toLowerCase().trim();
                const correct = String(currentQuestion.answer ?? '').toLowerCase().trim();
                const isYear = /^\d{4}$/.test(correct);
                if (isYear) {
                    isCorrect = user === correct;
                } else {
                    isCorrect = levenshteinDistance(user, correct) <= 3;
                }
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
                    room.answers.clear();
                    room.draftAnswers.clear();

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
                    startTurnSelectionTimer(room, 'category');
                } else {
                    // Standard mode: next question
                    room.currentQuestionIndex++;
                    room.answers.clear();
                    room.draftAnswers.clear();
                    room.state = 'playing';
                    room.questionStartTime = Date.now();
                    startAnswerTimer(room);

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
