import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import socketService from '../../services/socketService';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import soundService from '../../services/soundService';

// Question Components
import MultipleChoice from '../../components/questions/MultipleChoice';
import FillBlank from '../../components/questions/FillBlank';
import Order from '../../components/questions/Order';
import Match from '../../components/questions/Match';

export default function MultiplayerGameScreen() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState<any>(null);

    // Store state
    const currentQuestion = useGameStore(state => state.currentQuestion);
    const questionIndex = useGameStore(state => state.questionIndex);
    const totalQuestions = useGameStore(state => state.totalQuestions);
    const timePerQuestion = useGameStore(state => state.timePerQuestion);
    const setScore = useGameStore(state => state.setScore);
    const setMultiplayerGame = useGameStore(state => state.setMultiplayerGame);
    const setTurnData = useGameStore(state => state.setTurnData);

    // Prevent back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    // Socket Setup
    useEffect(() => {
        soundService.loadSounds();
        setTimeLeft(timePerQuestion);
        setIsAnswered(false);
        setShowResult(false);
        setCurrentAnswer(null);

        // Timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!isAnswered) handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Socket Listeners
        socketService.on('player-answered', (data: any) => {
            // Optional: Show who answered (toast/notification)
        });

        socketService.on('next-question', (data: any) => {
            setMultiplayerGame(data.question, data.questionIndex, data.totalQuestions);
            // Reset for next question
            setTimeLeft(timePerQuestion);
            setIsAnswered(false);
            setShowResult(false);
            setCurrentAnswer(null);
        });

        socketService.on('game-over', (data: any) => {
            router.replace('/multiplayer/leaderboard');
        });

        socketService.on('turn-start', (data: any) => {
            setTurnData(data);
            router.replace('/multiplayer/turn-selection');
        });

        socketService.on('force-disconnect', () => {
            Alert.alert('فصل الاتصال', 'انقطع الاتصال بالخادم');
            router.replace('/');
        });

        return () => {
            soundService.unloadSounds();
            clearInterval(timer);
            socketService.off('player-answered');
            socketService.off('next-question');
            socketService.off('game-over');
            socketService.off('turn-start');
            socketService.off('force-disconnect');
        };
    }, [currentQuestion?.id]); // Re-run when question changes

    const handleAnswer = async (answer: any, isCorrectProp?: boolean) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setCurrentAnswer(answer);

        let isCorrect = isCorrectProp;
        if (typeof isCorrectProp === 'undefined') {
            if (currentQuestion.type === 'multiple-choice') isCorrect = answer === currentQuestion.answer;
            else if (currentQuestion.type === 'fill-blank') isCorrect = answer?.trim() === currentQuestion.answer;
            // For Order/Match, usually handled by component if simple, or server validation.
            // Assume correct if passed undefined? No, default false to be safe.
            else isCorrect = false;
        }

        // Play sound
        if (isCorrect) {
            await soundService.playCorrect();
        } else {
            await soundService.playIncorrect();
        }

        const score = isCorrect ? Math.ceil(10 + (timeLeft / timePerQuestion) * 5) : 0;

        // Optimistically update local score (optional)
        if (isCorrect) {
            setScore((prev) => prev + score);
        }

        socketService.submitAnswer({
            answer,
            isCorrect: !!isCorrect,
            timeLeft,
            score
        });

        // Show waiting message
        setShowResult(true);
    };

    const handleTimeUp = () => {
        if (isAnswered) return;
        setIsAnswered(true);
        socketService.submitAnswer({
            answer: null,
            isCorrect: false,
            timeLeft: 0,
            score: 0
        });
        setShowResult(true);
    };

    const renderQuestion = () => {
        if (!currentQuestion) return null;

        const commonProps = {
            question: currentQuestion,
            onAnswer: (ans: any) => {
                let correct = false;
                if (currentQuestion.type === 'multiple-choice') {
                    correct = ans === currentQuestion.answer;
                } else if (currentQuestion.type === 'fill-blank') {
                    correct = ans?.trim() === currentQuestion.answer;
                }
                // Order and Match often pass full data, simplistic check here might be complex.
                // For now, we rely on server validation but calling handleAnswer triggers sound.
                // If we want immediate sound for Order/Match we need robust client validation.
                // Assuming simple components:
                handleAnswer(ans, correct);
            },
            disabled: isAnswered,
            key: currentQuestion.id,
        };

        switch (currentQuestion.type) {
            case 'multiple-choice':
                return (
                    <MultipleChoice
                        {...commonProps}
                        selectedAnswer={currentAnswer}
                        correctAnswer={currentQuestion.answer}
                    />
                );
            case 'fill-blank':
                return <FillBlank {...commonProps} />;
            case 'order':
                return <Order {...commonProps} />;
            case 'match':
                return <Match {...commonProps} />;
            default:
                return <Text>نوع السؤال غير مدعوم ({currentQuestion.type})</Text>;
        }
    };

    if (!currentQuestion) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>جاري تحميل السؤال...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <Text style={styles.questionCounter}>
                        سؤال {questionIndex + 1} / {totalQuestions}
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((questionIndex + 1) / totalQuestions) * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                <View style={[
                    styles.timerBadge,
                    timeLeft <= 5 && styles.timerUrgent
                ]}>
                    <Ionicons name="time" size={20} color={colors.white} />
                    <Text style={styles.timerText}>{timeLeft}</Text>
                </View>
            </View>

            {/* Question Area */}
            <View style={styles.questionContainer}>
                {renderQuestion()}
            </View>

            {/* Waiting Overlay */}
            {showResult && (
                <Animated.View entering={FadeIn} style={styles.waitingOverlay}>
                    <View style={styles.waitingCard}>
                        <ActivityDot />
                        <Text style={styles.waitingText}>
                            في انتظار باقي اللاعبين...
                        </Text>
                    </View>
                </Animated.View>
            )}

            {/* Exit Button (Top Left) */}
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => {
                    Alert.alert('خروج', 'هل تريد مغادرة اللعبة؟', [
                        { text: 'إلغاء', style: 'cancel' },
                        {
                            text: 'مغادرة',
                            style: 'destructive',
                            onPress: () => {
                                socketService.leaveRoom();
                                router.replace('/');
                            }
                        }
                    ]);
                }}
            >
                <Ionicons name="close" size={24} color={colors.sand} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Simple pulsing dot animation
const ActivityDot = () => {
    return (
        <Ionicons name="hourglass" size={40} color={colors.primary} style={{ marginBottom: spacing.md }} />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.md,
    },
    progressContainer: {
        flex: 1,
    },
    questionCounter: {
        color: colors.sand,
        fontSize: 14,
        marginBottom: 6,
        textAlign: 'right',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.primary,
        minWidth: 70,
        justifyContent: 'center',
    },
    timerUrgent: {
        backgroundColor: colors.error,
        borderColor: colors.error,
    },
    timerText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    questionContainer: {
        flex: 1,
        // Child components (Question types) handle their own padding/scrolling
    },
    loadingText: {
        color: colors.sand,
        fontSize: 18,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    waitingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    waitingCard: {
        backgroundColor: colors.cardBackground,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.lg,
        width: '80%',
    },
    waitingText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    exitButton: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        padding: spacing.sm,
        zIndex: 50,
    },
});
