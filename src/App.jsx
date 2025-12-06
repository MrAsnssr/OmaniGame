import React, { useState, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import Button from './components/Button';
import MainMenu from './components/MainMenu';
import CategorySelection from './components/CategorySelection';
import AdminDashboard from './components/admin/AdminDashboard';
import MultiplayerLobby from './components/multiplayer/MultiplayerLobby';
import WaitingRoom from './components/multiplayer/WaitingRoom';
import RoundLeaderboard from './components/multiplayer/RoundLeaderboard';
import TurnSelection from './components/multiplayer/TurnSelection';
import { useGameStore } from './store/gameStore';
import MultipleChoice from './components/questions/MultipleChoice';
import FillBlank from './components/questions/FillBlank';
import Order from './components/questions/Order';
import Match from './components/questions/Match';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Home, Users } from 'lucide-react';
import socketService from './services/socketService';

// Levenshtein distance for fuzzy matching (allows typos)
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
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
  return matrix[b.length][a.length];
}

export default function App() {
  const {
    gameState, score, currentQuestionIndex,
    startGame, nextQuestion, incrementScore, endGame, resetGame, showCategories, goToAdmin, getFilteredQuestions,
    // Multiplayer
    goToMultiplayer, setRoomData, updatePlayers, setMultiplayerGame, setRoundResults, setGameOver, resetMultiplayer,
    roomCode, players, isHost, multiplayerQuestion, multiplayerQuestionIndex, multiplayerTotalQuestions, roundResults, isGameOver, winner,
    questionCount, timePerQuestion, selectedTypes, selectedCategory,
    // Turn-Based
    setTurnData,
    // Firestore
    initializeFirestore, isLoading, dataInitialized
  } = useGameStore();

  const [feedback, setFeedback] = useState(null);
  const [multiplayerError, setMultiplayerError] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  const questions = getFilteredQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize Firestore on app load
  useEffect(() => {
    initializeFirestore();
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (gameState.startsWith('multiplayer')) {
      socketService.connect();
      const socket = socketService.getSocket();

      socket.on('room-created', ({ roomCode, players, isHost, gameMode }) => {
        setRoomData(roomCode, players, isHost, gameMode);
        setMultiplayerError('');
      });

      socket.on('room-joined', ({ roomCode, players, isHost, gameMode }) => {
        setRoomData(roomCode, players, isHost, gameMode);
        setMultiplayerError('');
      });

      socket.on('join-error', ({ message }) => {
        setMultiplayerError(message);
      });

      socket.on('player-joined', ({ players }) => {
        updatePlayers(players);
      });

      socket.on('player-left', ({ players }) => {
        updatePlayers(players);
      });

      socket.on('game-started', ({ question, questionIndex, totalQuestions }) => {
        setMultiplayerGame(question, questionIndex, totalQuestions);
        setHasAnswered(false);
        setAnsweredCount(0);
      });

      // Turn-Based Events
      socket.on('turn-start', (data) => {
        setTurnData(data);
      });

      socket.on('category-selected', ({ categoryId, nextPhase }) => {
        // Just update phase locally, store handles state
        setTurnData({ ...useGameStore.getState(), phase: nextPhase });
      });

      socket.on('question-generated', ({ question, questionIndex, totalQuestions }) => {
        setMultiplayerGame(question, questionIndex, totalQuestions);
        setHasAnswered(false);
        setAnsweredCount(0);
      });

      socket.on('player-answered', ({ answeredCount }) => {
        setAnsweredCount(answeredCount);
      });

      socket.on('round-results', ({ results, correctAnswer }) => {
        setRoundResults(results, correctAnswer);
      });

      socket.on('next-question', ({ question, questionIndex, totalQuestions }) => {
        setMultiplayerGame(question, questionIndex, totalQuestions);
        setHasAnswered(false);
        setAnsweredCount(0);
      });

      socket.on('game-over', ({ finalResults, winner }) => {
        setGameOver(finalResults, winner);
      });

      socket.on('no-questions', ({ message }) => {
        alert(message);
      });

      return () => {
        socket.off('room-created');
        socket.off('room-joined');
        socket.off('join-error');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('game-started');
        socket.off('turn-start');
        socket.off('category-selected');
        socket.off('question-generated');
        socket.off('player-answered');
        socket.off('round-results');
        socket.off('next-question');
        socket.off('game-over');
        socket.off('no-questions');
      };
    }
  }, [gameState]);

  const handleCreateRoom = (playerName, gameMode) => {
    socketService.createRoom(playerName, { questionCount, timePerQuestion, selectedTypes, categoryId: selectedCategory }, gameMode);
  };

  const handleJoinRoom = (roomCode, playerName) => {
    socketService.joinRoom(roomCode, playerName);
  };

  const handleStartMultiplayerGame = () => {
    const gameQuestions = getFilteredQuestions();
    socketService.startGame(gameQuestions);
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    socketService.disconnect();
    resetMultiplayer();
  };

  const handleMultiplayerAnswer = (answer) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    socketService.submitAnswer(answer);
  };

  const handleAnswer = (answer) => {
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = answer === currentQuestion.answer;
    } else if (currentQuestion.type === 'fill-blank') {
      const userAnswer = answer.toLowerCase().trim();
      const correctAnswer = currentQuestion.answer.toLowerCase().trim();
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      isCorrect = distance <= 3;
    } else if (currentQuestion.type === 'order') {
      isCorrect = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctOrder);
    } else if (currentQuestion.type === 'match') {
      isCorrect = Object.entries(answer).every(([leftId, rightId]) => {
        const leftIndex = leftId.split('-')[1];
        const rightIndex = rightId.split('-')[1];
        return leftIndex === rightIndex;
      }) && Object.keys(answer).length === currentQuestion.pairs.length;
    }

    if (isCorrect) incrementScore(10);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
      } else {
        endGame();
      }
    }, 1500);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {gameState === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-full"
          >
            <MainMenu onStart={showCategories} onAdmin={goToAdmin} onMultiplayer={goToMultiplayer} />
          </motion.div>
        )}

        {gameState === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <CategorySelection />
          </motion.div>
        )}

        {gameState === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <AdminDashboard />
          </motion.div>
        )}

        {/* Multiplayer States */}
        {gameState === 'multiplayer-lobby' && (
          <motion.div
            key="mp-lobby"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <MultiplayerLobby
              onBack={resetGame}
              onRoomCreated={handleCreateRoom}
              onRoomJoined={handleJoinRoom}
              error={multiplayerError}
            />
          </motion.div>
        )}

        {gameState === 'multiplayer-waiting' && (
          <motion.div
            key="mp-waiting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <WaitingRoom
              roomCode={roomCode}
              players={players}
              isHost={isHost}
              onStart={handleStartMultiplayerGame}
              onLeave={handleLeaveRoom}
              canStart={players.length >= 2}
            />
          </motion.div>
        )}

        {/* Turn Selection Screens */}
        {(gameState === 'multiplayer-selecting-category' || gameState === 'multiplayer-selecting-type') && (
          <motion.div
            key="turn-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <TurnSelection
              onSelectCategory={(id) => socketService.selectCategory(id)}
              onSelectType={(id) => socketService.selectType(id)}
            />
          </motion.div>
        )}

        {gameState === 'multiplayer-playing' && multiplayerQuestion && (
          <motion.div
            key="mp-playing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-4"
          >
            <div className="flex justify-between items-center mb-4 text-sm font-bold text-white/80 bg-black/20 p-2 rounded-lg backdrop-blur-sm">
              <span>Q {multiplayerQuestionIndex + 1}/{multiplayerTotalQuestions}</span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {answeredCount}/{players.filter(p => p.connected).length}
              </span>
            </div>

            <div className="flex-1 overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-4 border-white/50">
              {multiplayerQuestion.type === 'multiple-choice' && (
                <MultipleChoice question={multiplayerQuestion} onAnswer={handleMultiplayerAnswer} disabled={hasAnswered} />
              )}
              {multiplayerQuestion.type === 'fill-blank' && (
                <FillBlank question={multiplayerQuestion} onAnswer={handleMultiplayerAnswer} disabled={hasAnswered} />
              )}
              {multiplayerQuestion.type === 'order' && (
                <Order question={multiplayerQuestion} onAnswer={handleMultiplayerAnswer} disabled={hasAnswered} />
              )}
              {multiplayerQuestion.type === 'match' && (
                <Match question={multiplayerQuestion} onAnswer={handleMultiplayerAnswer} disabled={hasAnswered} />
              )}
            </div>

            {hasAnswered && (
              <div className="mt-4 text-center text-white/80">
                ⏳ Waiting for other players...
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'multiplayer-leaderboard' && roundResults && (
          <motion.div
            key="mp-leaderboard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <RoundLeaderboard
              results={roundResults.results}
              correctAnswer={roundResults.correctAnswer}
              questionIndex={multiplayerQuestionIndex}
              totalQuestions={multiplayerTotalQuestions}
              isGameOver={isGameOver}
              winner={winner}
              onPlayAgain={handleLeaveRoom}
              onLeave={handleLeaveRoom}
            />
          </motion.div>
        )}

        {/* Single Player States */}
        {gameState === 'playing' && !feedback && currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-4"
          >
            <div className="flex justify-between items-center mb-6 text-sm font-bold text-white/80 bg-black/20 p-2 rounded-lg backdrop-blur-sm">
              <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
              <span className="text-omani-gold">Score: {score}</span>
            </div>

            <div className="flex-1 overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-4 border-white/50">
              {currentQuestion.type === 'multiple-choice' && (
                <MultipleChoice question={currentQuestion} onAnswer={handleAnswer} />
              )}
              {currentQuestion.type === 'fill-blank' && (
                <FillBlank question={currentQuestion} onAnswer={handleAnswer} />
              )}
              {currentQuestion.type === 'order' && (
                <Order question={currentQuestion} onAnswer={handleAnswer} />
              )}
              {currentQuestion.type === 'match' && (
                <Match question={currentQuestion} onAnswer={handleAnswer} />
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && !currentQuestion && (
          <motion.div key="no-questions" className="h-full flex items-center justify-center p-6">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center">
              <p className="text-xl font-bold text-gray-800 mb-4">No questions in this category!</p>
              <Button onClick={resetGame}>Back to Menu</Button>
            </div>
          </motion.div>
        )}

        {feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <div className="text-center px-6">
              <div className={`text-5xl font-black drop-shadow-lg mb-4 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback === 'correct' ? 'Correct! 🎉' : 'Wrong 😢'}
              </div>
              {feedback === 'incorrect' && currentQuestion && (
                <div className="bg-white/90 rounded-2xl p-4 max-w-xs mx-auto">
                  <p className="text-gray-500 text-sm mb-1">The correct answer was:</p>
                  <p className="text-xl font-bold text-omani-red">{currentQuestion.answer}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 p-6"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-omani-gold w-full text-center">
              <Trophy size={80} className="text-omani-gold mx-auto mb-4 drop-shadow-md" />
              <h2 className="text-3xl font-black text-gray-800">Game Over!</h2>
              <p className="text-gray-500 mt-2 font-medium">You scored</p>
              <p className="text-6xl font-black text-omani-red mt-4 drop-shadow-sm">{score}</p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={() => showCategories()} variant="secondary">
                <RotateCcw size={20} /> Play Again
              </Button>
              <Button onClick={resetGame} variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Home size={20} /> Back to Menu
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
