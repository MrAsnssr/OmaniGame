import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Button from './components/Button';
import MainMenu from './components/MainMenu';
import CategorySelection from './components/CategorySelection';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminReviewGame from './components/admin/AdminReviewGame';
import ReportsPage from './components/admin/ReportsPage';
import MultiplayerLobby from './components/multiplayer/MultiplayerLobby';
import WaitingRoom from './components/multiplayer/WaitingRoom';
import RoundLeaderboard from './components/multiplayer/RoundLeaderboard';
import TurnSelection from './components/multiplayer/TurnSelection';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import CoinShop from './components/CoinShop';
import Leaderboard from './components/Leaderboard';
import MarketPage from './components/MarketPage';
import { useGameStore } from './store/gameStore';
import MultipleChoice from './components/questions/MultipleChoice';
import FillBlank from './components/questions/FillBlank';
import Order from './components/questions/Order';
import Match from './components/questions/Match';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Home, Users } from 'lucide-react';
import socketService from './services/socketService';
import { onAuthChange, signOut } from './services/authService';
import { isFillBlankCorrect } from './utils/answerValidation';
import { trackUserSession, trackPageView, trackTimeSpent, trackError } from './services/analyticsService';

// Map gameState to route paths
const stateToRoute = {
  'welcome': '/',
  'categories': '/categories',
  'playing': '/play',
  'result': '/result',
  'admin': '/admin',
  'multiplayer-lobby': '/multiplayer',
  'multiplayer-waiting': '/multiplayer/waiting',
  'multiplayer-playing': '/multiplayer/play',
  'multiplayer-leaderboard': '/multiplayer/leaderboard',
  'multiplayer-selecting-category': '/multiplayer/turn-selection',
  'multiplayer-selecting-type': '/multiplayer/turn-selection',
};

// Question renderer component - defined outside App to prevent re-creation on every render
function QuestionRenderer({ question, onAnswer, onUpdate, disabled = false }) {
  if (!question) return null;
  switch (question.type) {
    case 'multiple-choice':
      return <MultipleChoice question={question} onAnswer={onAnswer} onUpdate={onUpdate} disabled={disabled} />;
    case 'fill-blank':
      return <FillBlank question={question} onAnswer={onAnswer} onUpdate={onUpdate} disabled={disabled} />;
    case 'order':
      return <Order question={question} onAnswer={onAnswer} onUpdate={onUpdate} disabled={disabled} />;
    case 'match':
      return <Match question={question} onAnswer={onAnswer} onUpdate={onUpdate} disabled={disabled} />;
    default:
      return null;
  }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    gameState, score, currentQuestionIndex,
    startGame, nextQuestion, incrementScore, endGame, resetGame, showCategories, goToAdmin, getFilteredQuestions,
    // Multiplayer
    goToMultiplayer, setRoomData, updatePlayers, setMultiplayerGame, setRoundResults, setGameOver, resetMultiplayer,
    roomCode, players, isHost, multiplayerQuestion, multiplayerQuestionIndex, multiplayerTotalQuestions, roundResults, isGameOver, winner,
    multiplayerPlayedQuestions, // Track played questions for reporting
    questionCount, timePerQuestion, selectedTypes, selectedCategory,
    // Turn-Based
    setTurnData,
    // Firestore
    initializeFirestore, isLoading, dataInitialized, reportQuestion,
    // Game Questions (filtered for current session)
    gameQuestions
  } = useGameStore();

  const [feedback, setFeedback] = useState(null);
  const [multiplayerError, setMultiplayerError] = useState('');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [user, setUser] = useState(null);
  const [soloTimeLeft, setSoloTimeLeft] = useState(null);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const soloTimerRef = useRef(null);

  // Use gameQuestions for singleplayer (set by startGame)
  const questions = gameQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize Firestore on app load
  useEffect(() => {
    initializeFirestore();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      // Load user's streak when authenticated
      if (authUser?.uid) {
        useGameStore.getState().setCurrentUser(authUser.uid, authUser.displayName);
        useGameStore.getState().loadUserStreak(authUser.uid);
        useGameStore.getState().loadUserPurchases(authUser.uid);
        useGameStore.getState().loadUserDirhams(authUser.uid);
        useGameStore.getState().loadUserAvatar(authUser.uid);
        useGameStore.getState().loadUserAvatarV2(authUser.uid);
        // Track user session for analytics
        trackUserSession(authUser.uid, authUser.displayName, authUser.email);
      } else {
        useGameStore.getState().setCurrentUser(null, null);
        useGameStore.setState({ avatar: null, avatarV2: null });
      }
    });
    return () => unsubscribe();
  }, []);

  // Track page views
  useEffect(() => {
    if (user?.uid && location.pathname) {
      trackPageView(user.uid, location.pathname);
    }
  }, [location.pathname, user?.uid]);

  // Track time spent (every 60 seconds while page is active)
  useEffect(() => {
    if (!user?.uid) return;

    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 60;
      trackTimeSpent(user.uid, 60);
    }, 60000);

    // Also track on page unload
    const handleUnload = () => {
      if (seconds > 0) {
        trackTimeSpent(user.uid, seconds % 60 || 1);
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user?.uid]);

  // Sync gameState changes to routes ONLY for multiplayer socket events
  // (These are states that change due to server-side events, not user clicks)
  useEffect(() => {
    // Only sync multiplayer-related states triggered by socket events
    if (gameState.startsWith('multiplayer-')) {
      const targetRoute = stateToRoute[gameState];
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [gameState, navigate, location.pathname]);

  // Set up socket listeners
  useEffect(() => {
    if (location.pathname.startsWith('/multiplayer')) {
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
        // Set the selected category for visual feedback
        useGameStore.getState().setSelectedTurnCategory(categoryId);
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

      socket.on('game-over', async ({ finalResults, winner }) => {
        setGameOver(finalResults, winner);
      });

      socket.on('no-questions', ({ message }) => {
        alert(message);
      });

      socket.on('game-restarted', ({ roomCode, players, settings, gameMode }) => {
        // Reset multiplayer state and go back to waiting room
        useGameStore.getState().setRoomData(roomCode, players, useGameStore.getState().isHost, gameMode);
        setHasAnswered(false);
        setAnsweredCount(0);
        // Navigate to waiting room
        navigate('/multiplayer/waiting');
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
        socket.off('game-restarted');
      };
    }
  }, [location.pathname]);

  // Record online game completion for daily streak
  const streakRecorded = useRef(false);
  useEffect(() => {
    if (isGameOver && user?.uid && !streakRecorded.current) {
      streakRecorded.current = true;
      useGameStore.getState().recordOnlineGame(user.uid, user.displayName);
    }
    // Reset when game ends
    if (!isGameOver) {
      streakRecorded.current = false;
    }
  }, [isGameOver, user]);

  // Navigation handlers
  const handleNavigateToCategories = () => navigate('/categories');
  const handleNavigateToAdmin = () => navigate('/admin');
  const handleNavigateToSettings = () => navigate('/settings');
  const handleNavigateToMultiplayer = () => navigate('/multiplayer');
  const handleNavigateHome = () => {
    resetGame();
    navigate('/');
  };

  const handleLogin = () => navigate('/login');
  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };
  const handleLoginSuccess = () => navigate('/');

  const handleCreateRoom = (playerName, gameMode, selectedTopicIds = []) => {
    socketService.createRoom(playerName, { questionCount, timePerQuestion, selectedTypes, categoryId: selectedCategory, selectedTopicIds }, gameMode);
  };

  const handleJoinRoom = (roomCode, playerName) => {
    socketService.joinRoom(roomCode, playerName);
  };

  const handleStartMultiplayerGame = () => {
    const state = useGameStore.getState();
    // Turn-based mode needs ALL questions for server-side filtering per turn
    // Standard mode uses pre-filtered questions (no category filter for multiplayer)
    const questionsForGame = state.gameMode === 'turn-based'
      ? state.questions  // All questions
      : getFilteredQuestions(null);  // Filtered by types only
    socketService.startGame(questionsForGame);
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    socketService.disconnect();
    resetMultiplayer();
    navigate('/');
  };

  // Play Again: reset room to waiting state (host only, others wait for event)
  const handlePlayAgain = () => {
    const state = useGameStore.getState();
    if (state.isHost) {
      socketService.restartGame();
    } else {
      // Non-hosts just wait for the game-restarted event from the host
      // Show a message or do nothing
    }
  };

  // Multiplayer: send draft updates (no submit required)
  const handleMultiplayerAnswerUpdate = (answer) => {
    setHasAnswered(!!(answer && (Array.isArray(answer) ? answer.length : typeof answer === 'object' ? Object.keys(answer).length : String(answer).trim())));
    socketService.updateAnswer(answer);
  };

  // Optional: explicit submit still supported (ends round early if everyone answered)
  const handleMultiplayerAnswerSubmit = (answer) => {
    socketService.submitAnswer(answer);
  };

  const handleAnswer = (answer) => {
    // Stop any running single-player timer when the user answers
    if (soloTimerRef.current) {
      clearInterval(soloTimerRef.current);
      soloTimerRef.current = null;
    }

    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = answer === currentQuestion.answer;
    } else if (currentQuestion.type === 'fill-blank') {
      isCorrect = isFillBlankCorrect(answer, currentQuestion.answer);
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
        navigate('/result');
      }
    }, 1500);
  };

  // Enforced single-player countdown timer (uses timePerQuestion)
  useEffect(() => {
    if (location.pathname !== '/play') return;
    if (!currentQuestion) return;
    if (feedback) return; // pause during feedback

    // Reset timer
    if (soloTimerRef.current) {
      clearInterval(soloTimerRef.current);
      soloTimerRef.current = null;
    }

    const limit = Math.max(1, Number(timePerQuestion || 30));
    setSoloTimeLeft(limit);

    const startedAt = Date.now();
    soloTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, limit - elapsed);
      setSoloTimeLeft(left);

      if (left <= 0) {
        clearInterval(soloTimerRef.current);
        soloTimerRef.current = null;

        // Timeout counts as wrong, then advance like normal
        setFeedback('incorrect');
        setTimeout(() => {
          setFeedback(null);
          if (currentQuestionIndex < questions.length - 1) {
            nextQuestion();
          } else {
            endGame();
            navigate('/result');
          }
        }, 1500);
      }
    }, 250);

    return () => {
      if (soloTimerRef.current) {
        clearInterval(soloTimerRef.current);
        soloTimerRef.current = null;
      }
    };
  }, [location.pathname, currentQuestionIndex, currentQuestion, feedback, timePerQuestion, questions.length, nextQuestion, endGame, navigate]);

  // Determine if we should use the dark (wood) layout or light layout
  const isDarkRoute = location.pathname === '/';

  return (
    <>
      {/* Main Menu has its own full-page dark design */}
      {isDarkRoute ? (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="h-full"
              >
                <MainMenu
                  onStart={handleNavigateToCategories}
                  onAdmin={handleNavigateToSettings}
                  onMultiplayer={handleNavigateToMultiplayer}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  user={user}
                />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      ) : (
        <Layout variant="dark">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Placeholder for "/" route in app layout (won't be reached) */}
              <Route path="/" element={null} />

              {/* Settings Page */}
              <Route path="/settings" element={
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <SettingsPage
                    onBack={() => navigate('/')}
                    onAdmin={handleNavigateToAdmin}
                    user={user}
                    onLogout={handleLogout}
                  />
                </motion.div>
              } />

              {/* Login Page */}
              <Route path="/login" element={
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <LoginPage onBack={() => navigate('/')} onSuccess={handleLoginSuccess} />
                </motion.div>
              } />

              {/* Profile Page */}
              <Route path="/profile" element={
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <ProfilePage
                    user={user}
                    onBack={() => navigate('/')}
                    onUpdate={(updatedUser) => setUser(updatedUser)}
                  />
                </motion.div>
              } />

              {/* Coin Shop */}
              <Route path="/shop" element={
                <motion.div
                  key="shop"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <CoinShop onBack={() => navigate('/')} />
                </motion.div>
              } />

              {/* Market */}
              <Route path="/market" element={
                <motion.div
                  key="market"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <MarketPage onBack={() => navigate('/')} user={user} />
                </motion.div>
              } />

              {/* Leaderboard */}
              <Route path="/leaderboard" element={
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <Leaderboard onBack={() => navigate('/')} currentUserId={user?.uid} />
                </motion.div>
              } />

              {/* Category Selection */}
              <Route path="/categories" element={
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <CategorySelection onBack={() => navigate('/')} />
                </motion.div>
              } />

              {/* Admin Dashboard */}
              <Route path="/admin" element={
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <AdminDashboard onBack={() => navigate('/')} />
                </motion.div>
              } />

              {/* Admin Review Game (play filtered questions, editable) */}
              <Route path="/admin/review" element={
                <motion.div
                  key="admin-review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <AdminReviewGame />
                </motion.div>
              } />

              {/* Reports Page */}
              <Route path="/admin/reports" element={
                <motion.div
                  key="admin-reports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ReportsPage onBack={() => navigate('/admin')} />
                </motion.div>
              } />

              {/* Singleplayer Game */}
              <Route path="/play" element={
                <>
                  {!feedback && currentQuestion && (
                    <motion.div
                      key={`question-${currentQuestionIndex}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col p-4"
                    >
                      <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-800 bg-white/60 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                        <span className="text-gray-600">السؤال {currentQuestionIndex + 1}/{questions.length}</span>
                        {typeof soloTimeLeft === 'number' && (
                          <span className="text-gray-600">⏱️ {soloTimeLeft}s</span>
                        )}
                        <span className="text-omani-red font-black text-xl">النقاط: {score}</span>
                      </div>

                      <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-6 relative">
                        {/* Decorative top-right corner */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-omani-gold/20 to-transparent rounded-tr-3xl pointer-events-none" />
                        <QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} />
                      </div>
                    </motion.div>
                  )}

                  {!currentQuestion && (
                    <motion.div key="no-questions" className="h-full flex items-center justify-center p-6">
                      <div className="glass-panel rounded-3xl p-10 text-center max-w-sm mx-auto">
                        <p className="text-2xl font-black text-omani-brown mb-6">ماشي أسئلة فهالمجال!</p>
                        <Button onClick={handleNavigateHome}>رجع للقائمة</Button>
                      </div>
                    </motion.div>
                  )}

                  {feedback && (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-6"
                    >
                      <div className="text-center w-full max-w-sm">
                        <div className={`text-6xl font-black drop-shadow-lg mb-8 animate-bounce ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                          {feedback === 'correct' ? 'صح! 🎉' : 'خطأ 😢'}
                        </div>
                        {feedback === 'incorrect' && currentQuestion && (
                          <div className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-omani-red transform rotate-1">
                            <p className="text-gray-700 text-sm mb-2 font-bold">الجواب الصح هو:</p>
                            <p className="text-2xl font-black text-omani-red">{currentQuestion.answer}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              } />

              {/* Result Screen */}
              <Route path="/result" element={
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-8 p-6"
                >
                  <div className="glass-panel rounded-3xl p-10 shadow-2xl border-4 border-omani-gold w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-omani-red via-omani-white to-omani-green" />
                    <Trophy size={80} className="text-omani-gold mx-auto mb-4 drop-shadow-md animate-pulse" />
                    <h2 className="text-3xl font-black text-omani-brown mb-2">انتهت اللعبة!</h2>
                    <p className="text-gray-700 font-bold">جبت</p>
                    <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-omani-red to-omani-brown mt-4 drop-shadow-sm">{score}</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <Button onClick={() => navigate('/categories')} variant="secondary">
                      <RotateCcw size={20} /> لعب مرة ثانية
                    </Button>
                    <Button onClick={handleNavigateHome} variant="ghost" className="text-omani-brown hover:bg-white/50 hover:text-omani-dark">
                      <Home size={20} /> رجع للقائمة
                    </Button>
                  </div>
                </motion.div>
              } />

              {/* Multiplayer Lobby */}
              <Route path="/multiplayer" element={
                <motion.div
                  key="mp-lobby"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <MultiplayerLobby
                    onBack={handleNavigateHome}
                    onRoomCreated={handleCreateRoom}
                    onRoomJoined={handleJoinRoom}
                    error={multiplayerError}
                    user={user}
                  />
                </motion.div>
              } />

              {/* Multiplayer Waiting Room */}
              <Route path="/multiplayer/waiting" element={
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
              } />

              {/* Turn Selection */}
              <Route path="/multiplayer/turn-selection" element={
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
              } />

              {/* Multiplayer Playing */}
              <Route path="/multiplayer/play" element={
                multiplayerQuestion && (
                  <motion.div
                    key="mp-playing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col p-4"
                  >
                    <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-800 bg-white/60 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                      <span className="text-gray-600">السؤال {multiplayerQuestionIndex + 1}/{multiplayerTotalQuestions}</span>
                      <span className="flex items-center gap-1 text-omani-green bg-green-100 px-2 py-1 rounded-lg">
                        <Users size={16} /> {answeredCount}/{players.filter(p => p.connected).length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto glass-panel rounded-3xl p-6 relative border-4 border-white/50">
                      <QuestionRenderer
                        key={`mp-question-${multiplayerQuestionIndex}-${multiplayerQuestion?.id || ''}`}
                        question={multiplayerQuestion}
                        onAnswer={handleMultiplayerAnswerSubmit}
                        onUpdate={handleMultiplayerAnswerUpdate}
                      />
                    </div>

                    {hasAnswered && (
                      <div className="mt-4 text-center glass-panel rounded-xl p-3 text-omani-brown font-bold animate-pulse">
                        ⏳ ننتظر البقية...
                      </div>
                    )}
                  </motion.div>
                )
              } />

              {/* Multiplayer Leaderboard */}
              <Route path="/multiplayer/leaderboard" element={
                roundResults ? (
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
                      onPlayAgain={handlePlayAgain}
                      onLeave={handleLeaveRoom}
                      playedQuestions={multiplayerPlayedQuestions}
                      onReportQuestion={reportQuestion}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mp-leaderboard-missing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center p-6"
                  >
                    <div className="glass-panel rounded-3xl p-8 text-center max-w-sm w-full">
                      <p className="text-xl font-black text-omani-brown mb-4">ما فيه نتائج للحين</p>
                      <p className="text-gray-600 font-bold mb-6">ارجع للصفحة الرئيسية أو حاول مرة ثانية.</p>
                      <Button onClick={handleNavigateHome}>رجع للقائمة</Button>
                    </div>
                  </motion.div>
                )
              } />
            </Routes>
          </AnimatePresence>
        </Layout>
      )}
    </>
  );
}
