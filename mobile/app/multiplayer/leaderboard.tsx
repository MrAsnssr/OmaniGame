import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import socketService from '../../services/socketService';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Player } from '../../types';

export default function RoundLeaderboardScreen() {
    const router = useRouter();
    const players = useGameStore(state => state.players).sort((a, b) => b.score - a.score);
    const roomCode = useGameStore(state => state.roomCode);
    const setMultiplayerGame = useGameStore(state => state.setMultiplayerGame);
    const setTurnData = useGameStore(state => state.setTurnData);
    const resetMultiplayer = useGameStore(state => state.resetMultiplayer);

    const isGameOver = useGameStore(state => state.isGameOver); // Need to add this to store or derive it

    // Prevent back
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        socketService.on('game-started', (data: any) => {
            // New round or next question
            setMultiplayerGame(data.question, data.questionIndex, data.totalQuestions);
            router.replace('/multiplayer/play');
        });

        socketService.on('turn-start', (data: any) => {
            setTurnData(data);
            router.replace('/multiplayer/turn-selection');
        });

        return () => {
            socketService.off('game-started');
            socketService.off('turn-start');
        };
    }, []);

    const handleExit = () => {
        socketService.leaveRoom();
        resetMultiplayer();
        router.replace('/');
    };

    const renderPlayer = ({ item, index }: { item: Player; index: number }) => {
        let medalColor = colors.cardBackground;
        let rankIcon = null;

        if (index === 0) {
            medalColor = 'rgba(255, 215, 0, 0.2)';
            rankIcon = <Ionicons name="trophy" size={24} color="#FFD700" />;
        } else if (index === 1) {
            rankIcon = <Ionicons name="medal" size={24} color="#C0C0C0" />;
        } else if (index === 2) {
            rankIcon = <Ionicons name="medal" size={24} color="#CD7F32" />;
        } else {
            rankIcon = <Text style={styles.rankText}>{index + 1}</Text>;
        }

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100)}
                style={[styles.playerCard, { backgroundColor: index === 0 ? medalColor : colors.cardBackground }]}
            >
                <View style={styles.rankContainer}>
                    {rankIcon}
                </View>

                <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, index === 0 && styles.winnerName]}>
                        {item.name}
                    </Text>
                    {item.isHost && <Ionicons name="star" size={12} color={colors.omaniGold} />}
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{item.score}</Text>
                    <Text style={styles.scoreLabel}>نقطة</Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>النتائج</Text>
                <Text style={styles.subtitle}>رمز الغرفة: {roomCode}</Text>
            </View>

            {/* Podium Animation for Top 3 (Optional - simplified list for now) */}
            <FlatList
                data={players}
                renderItem={renderPlayer}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Waiting Indicator */}
            <View style={styles.footer}>
                <View style={styles.waitingContainer}>
                    <Ionicons name="hourglass" size={20} color={colors.primary} />
                    <Text style={styles.waitingText}>
                        في انتظار الجولة التالية...
                    </Text>
                </View>

                <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                    <Ionicons name="log-out" size={20} color={colors.sand} />
                    <Text style={styles.exitText}>خروج من اللعبة</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.sand,
        opacity: 0.7,
        letterSpacing: 2,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.cardBackground,
        ...shadows.sm,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.sand,
    },
    playerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    playerName: {
        fontSize: 18,
        color: colors.white,
    },
    winnerName: {
        fontWeight: 'bold',
        color: colors.omaniGold,
    },
    scoreContainer: {
        alignItems: 'center',
        minWidth: 60,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scoreLabel: {
        fontSize: 12,
        color: colors.sand,
    },
    footer: {
        padding: spacing.xl,
        gap: spacing.lg,
    },
    waitingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    waitingText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
    },
    exitText: {
        color: colors.sand,
        fontSize: 14,
    },
});
