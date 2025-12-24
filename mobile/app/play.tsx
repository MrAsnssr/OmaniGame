import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius } from '../constants/theme';
import MultipleChoice from '../components/questions/MultipleChoice';
import FillBlank from '../components/questions/FillBlank';
import Order from '../components/questions/Order';
import Match from '../components/questions/Match';
import { isFillBlankCorrect } from '../utils/answerValidation';
import soundService from '../services/soundService';
// ... existing hooks ...

// Load sounds
useEffect(() => {
    soundService.loadSounds();
    return () => {
        soundService.unloadSounds();
    };
}, []);

// ... existing timer effect ...

const processAnswer = async (answer: any, isTimeout = false) => {
    setAnswered(true);

    let correct = false;

    if (!isTimeout && answer !== null) {
        switch (currentQuestion.type) {
            case 'multiple-choice':
                correct = answer === currentQuestion.answer;
                break;
            case 'fill-blank':
                correct = isFillBlankCorrect(answer, currentQuestion.answer || '');
                break;
            case 'order':
                correct = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctOrder);
                break;
            case 'match':
                correct = Array.isArray(answer) &&
                    answer.length === (currentQuestion.pairs?.length || 0) &&
                    answer.every((match: any) =>
                        currentQuestion.pairs?.some(p => p.left === match.left && p.right === match.right)
                    );
                break;
        }
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Play sound
    if (correct) {
        await soundService.playCorrect();
        incrementScore(10);
    } else {
        await soundService.playIncorrect();
    }

    // Move to next question after delay
    setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            nextQuestion();
        } else {
            endGame();
            router.replace('/result');
        }
    }, 2000); // Increased delay to 2s to allow sound/visuals to be appreciated
};

// ... existing handlers ...

const renderQuestion = () => {
    switch (currentQuestion.type) {
        case 'multiple-choice':
            return (
                <MultipleChoice
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    disabled={answered}
                    selectedAnswer={currentAnswer}
                    correctAnswer={currentQuestion.answer}
                />
            );
        // ... other cases ...
        case 'fill-blank':
            return (
                <FillBlank
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    onUpdate={handleUpdate}
                    disabled={answered}
                />
            );
        case 'order':
            return (
                <Order
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    onUpdate={handleUpdate}
                    disabled={answered}
                />
            );
        case 'match':
            return (
                <Match
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    onUpdate={handleUpdate}
                    disabled={answered}
                />
            );
        default:
            return null;
    }
};

return (
    <SafeAreaView style={styles.container} edges={['top']}>
        {/* Progress Header */}
        <View style={styles.header}>
            <View style={styles.progressInfo}>
                <Text style={styles.scoreText}>النقاط: {score}</Text>
                <Text style={styles.questionNumber}>
                    {currentQuestionIndex + 1} / {totalQuestions}
                </Text>
            </View>

            {/* Timer */}
            <View style={[
                styles.timerContainer,
                timeLeft <= 10 && styles.timerWarning,
                timeLeft <= 5 && styles.timerDanger
            ]}>
                <Text style={styles.timerText}>{timeLeft}</Text>
            </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
            <Animated.View
                style={[
                    styles.progressBar,
                    { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
                ]}
            />
        </View>

        {/* Question */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Animated.View>

        {/* Answer Section */}
        <View style={styles.answerContainer}>
            {renderQuestion()}
        </View>

        {/* Feedback Overlay */}
        {showFeedback && (
            <Animated.View entering={FadeIn} style={styles.feedbackOverlay}>
                <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                    <Text style={styles.feedbackText}>
                        {isCorrect ? '✓ صحيح!' : '✗ خطأ'}
                    </Text>
                    {!isCorrect && currentQuestion.answer && (
                        <Text style={styles.correctAnswerText}>
                            الإجابة: {currentQuestion.answer}
                        </Text>
                    )}
                </View>
            </Animated.View>
        )}
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    loadingText: {
        color: colors.sand,
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    progressInfo: {
        flex: 1,
    },
    scoreText: {
        color: colors.omaniGold,
        fontSize: 18,
        fontWeight: 'bold',
    },
    questionNumber: {
        color: colors.sand,
        fontSize: 14,
        opacity: 0.7,
        marginTop: 2,
    },
    timerContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerWarning: {
        backgroundColor: colors.warning,
    },
    timerDanger: {
        backgroundColor: colors.error,
    },
    timerText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: spacing.lg,
        borderRadius: 3,
        marginBottom: spacing.lg,
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    questionContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    questionText: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 32,
    },
    answerContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackBox: {
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    feedbackCorrect: {
        backgroundColor: colors.success,
    },
    feedbackWrong: {
        backgroundColor: colors.error,
    },
    feedbackText: {
        color: colors.white,
        fontSize: 32,
        fontWeight: 'bold',
    },
    correctAnswerText: {
        color: colors.white,
        fontSize: 16,
        marginTop: spacing.sm,
        opacity: 0.9,
    },
});
