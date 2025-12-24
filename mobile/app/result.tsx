import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function ResultScreen() {
    const router = useRouter();
    const score = useGameStore(state => state.score);
    const gameQuestions = useGameStore(state => state.gameQuestions);
    const resetGame = useGameStore(state => state.resetGame);
    const startGameWithTopics = useGameStore(state => state.startGameWithTopics);

    const totalQuestions = gameQuestions.length;
    const correctAnswers = score / 10;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Determine result message and color
    let resultMessage = '';
    let resultColor = colors.error;
    let resultEmoji = '😢';

    if (percentage >= 90) {
        resultMessage = 'ممتاز! أنت خبير في عمان';
        resultColor = colors.omaniGold;
        resultEmoji = '🏆';
    } else if (percentage >= 70) {
        resultMessage = 'أحسنت! معلوماتك جيدة جداً';
        resultColor = colors.success;
        resultEmoji = '⭐';
    } else if (percentage >= 50) {
        resultMessage = 'جيد! استمر في التعلم';
        resultColor = colors.warning;
        resultEmoji = '👍';
    } else {
        resultMessage = 'حاول مرة أخرى!';
        resultColor = colors.error;
        resultEmoji = '💪';
    }

    const handlePlayAgain = () => {
        const topicIds = [...new Set(gameQuestions.map(q => q.category))];
        startGameWithTopics(topicIds);
        router.replace('/play');
    };

    const handleGoHome = () => {
        resetGame();
        router.replace('/');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `حصلت على ${correctAnswers}/${totalQuestions} في لعبة سبلة عمان! 🇴🇲\nهل تستطيع التغلب عليّ؟`,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>
                {/* Celebration Emoji */}
                <Animated.View entering={ZoomIn.delay(100)} style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{resultEmoji}</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={styles.title}>انتهت اللعبة!</Text>
                </Animated.View>

                {/* Score Card */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={[styles.percentage, { color: resultColor }]}>{percentage}%</Text>
                        <Text style={styles.scoreText}>{correctAnswers}/{totalQuestions}</Text>
                    </View>
                    <Text style={[styles.resultMessage, { color: resultColor }]}>{resultMessage}</Text>
                </Animated.View>

                {/* Stats */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        <Text style={styles.statValue}>{correctAnswers}</Text>
                        <Text style={styles.statLabel}>صحيح</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                        <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
                        <Text style={styles.statLabel}>خطأ</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="diamond" size={24} color={colors.omaniGold} />
                        <Text style={styles.statValue}>+{score}</Text>
                        <Text style={styles.statLabel}>نقاط</Text>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View entering={FadeInUp.delay(500)} style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAgain}>
                        <Ionicons name="refresh" size={24} color={colors.white} />
                        <Text style={styles.primaryButtonText}>العب مرة أخرى</Text>
                    </TouchableOpacity>

                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
                            <Ionicons name="share-social" size={20} color={colors.sand} />
                            <Text style={styles.secondaryButtonText}>مشاركة</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
                            <Ionicons name="home" size={20} color={colors.sand} />
                            <Text style={styles.secondaryButtonText}>القائمة</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    emojiContainer: {
        marginBottom: spacing.lg,
    },
    emoji: {
        fontSize: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.sand,
        marginBottom: spacing.xl,
    },
    scoreCard: {
        backgroundColor: colors.cardBackground,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        width: '100%',
        maxWidth: 280,
        ...shadows.lg,
    },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.woodDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    percentage: {
        fontSize: 42,
        fontWeight: 'bold',
    },
    scoreText: {
        fontSize: 16,
        color: colors.sand,
        opacity: 0.7,
    },
    resultMessage: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        width: '100%',
        ...shadows.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: colors.sand,
        opacity: 0.7,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: spacing.sm,
    },
    buttonsContainer: {
        width: '100%',
        gap: spacing.md,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        ...shadows.md,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryButtonText: {
        color: colors.sand,
        fontSize: 14,
    },
});
