import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import socketService from '../../services/socketService';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Player } from '../../types';

export default function WaitingRoom() {
    const router = useRouter();
    const roomCode = useGameStore(state => state.roomCode);
    const players = useGameStore(state => state.players);
    const isHost = useGameStore(state => state.isHost);
    const gameMode = useGameStore(state => state.gameMode);
    const updatePlayers = useGameStore(state => state.updatePlayers);
    const setMultiplayerGame = useGameStore(state => state.setMultiplayerGame);
    const setTurnData = useGameStore(state => state.setTurnData);
    const resetMultiplayer = useGameStore(state => state.resetMultiplayer);
    const questions = useGameStore(state => state.questions);
    const questionCount = useGameStore(state => state.questionCount);

    useEffect(() => {
        // Socket event listeners
        socketService.on('player-joined', (data: any) => {
            updatePlayers(data.players);
        });

        socketService.on('player-left', (data: any) => {
            updatePlayers(data.players);
        });

        socketService.on('game-started', (data: any) => {
            setMultiplayerGame(data.question, data.questionIndex, data.totalQuestions);
            router.replace('/multiplayer/play');
        });

        socketService.on('turn-start', (data: any) => {
            setTurnData(data);
            router.replace('/multiplayer/turn-selection');
        });

        socketService.on('room-closed', () => {
            Alert.alert('الغرفة مغلقة', 'تم إغلاق الغرفة من قبل المضيف');
            resetMultiplayer();
            router.replace('/');
        });

        return () => {
            socketService.off('player-joined');
            socketService.off('player-left');
            socketService.off('game-started');
            socketService.off('turn-start');
            socketService.off('room-closed');
        };
    }, []);

    const handleStartGame = () => {
        if (players.length < 2) {
            Alert.alert('انتظر', 'تحتاج لاعبين على الأقل للبدء');
            return;
        }

        // Get random questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        const gameQuestions = shuffled.slice(0, questionCount);

        socketService.startGame(gameQuestions);
    };

    const handleLeaveRoom = () => {
        Alert.alert(
            'مغادرة الغرفة',
            'هل تريد مغادرة الغرفة؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'مغادرة',
                    style: 'destructive',
                    onPress: () => {
                        socketService.leaveRoom();
                        resetMultiplayer();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `انضم إلى غرفتي في سبلة عمان! 🇴🇲\nرمز الغرفة: ${roomCode}`,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const renderPlayer = ({ item, index }: { item: Player; index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={[styles.playerCard, item.isHost && styles.hostCard]}
        >
            <View style={styles.playerInfo}>
                <Ionicons
                    name="person-circle"
                    size={40}
                    color={item.isHost ? colors.omaniGold : colors.sand}
                />
                <View>
                    <Text style={styles.playerName}>{item.name}</Text>
                    {item.isHost && (
                        <Text style={styles.hostBadge}>المضيف</Text>
                    )}
                </View>
            </View>
            <View style={[
                styles.statusDot,
                item.connected ? styles.statusOnline : styles.statusOffline
            ]} />
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>غرفة الانتظار</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Room Code */}
            <Animated.View entering={BounceIn.delay(100)} style={styles.codeContainer}>
                <Text style={styles.codeLabel}>رمز الغرفة</Text>
                <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{roomCode}</Text>
                    <TouchableOpacity onPress={handleShareCode} style={styles.shareButton}>
                        <Ionicons name="share-social" size={20} color={colors.sand} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.gameModeText}>
                    {gameMode === 'turn-based' ? '🎯 لعب بالأدوار' : '🎲 لعب عشوائي'}
                </Text>
            </Animated.View>

            {/* Players List */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.playersSection}>
                <Text style={styles.sectionTitle}>
                    اللاعبون ({players.length})
                </Text>
                <FlatList
                    data={players}
                    renderItem={renderPlayer}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.playersList}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>

            {/* Start Button (Host only) */}
            {isHost && (
                <Animated.View entering={FadeInUp.delay(300)} style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.startButton, players.length < 2 && styles.startButtonDisabled]}
                        onPress={handleStartGame}
                        disabled={players.length < 2}
                    >
                        <Ionicons name="play" size={24} color={colors.white} />
                        <Text style={styles.startButtonText}>
                            {players.length < 2 ? 'انتظر لاعباً آخر...' : 'ابدأ اللعب!'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {!isHost && (
                <View style={styles.waitingMessage}>
                    <Ionicons name="hourglass" size={24} color={colors.sand} />
                    <Text style={styles.waitingText}>انتظر المضيف لبدء اللعبة...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.sand,
    },
    placeholder: {
        width: 40,
    },
    codeContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginHorizontal: spacing.lg,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    codeLabel: {
        fontSize: 14,
        color: colors.sand,
        marginBottom: spacing.sm,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    codeText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 8,
    },
    shareButton: {
        padding: spacing.sm,
        backgroundColor: colors.woodDark,
        borderRadius: borderRadius.full,
    },
    gameModeText: {
        marginTop: spacing.md,
        color: colors.sand,
        fontSize: 14,
    },
    playersSection: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.sand,
        marginBottom: spacing.md,
    },
    playersList: {
        gap: spacing.sm,
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    hostCard: {
        borderWidth: 1,
        borderColor: colors.omaniGold,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    playerName: {
        fontSize: 16,
        color: colors.white,
        fontWeight: '500',
    },
    hostBadge: {
        fontSize: 12,
        color: colors.omaniGold,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusOnline: {
        backgroundColor: colors.success,
    },
    statusOffline: {
        backgroundColor: colors.error,
    },
    bottomContainer: {
        padding: spacing.lg,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        ...shadows.md,
    },
    startButtonDisabled: {
        backgroundColor: 'rgba(236, 73, 19, 0.4)',
    },
    startButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    waitingMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        gap: spacing.sm,
    },
    waitingText: {
        color: colors.sand,
        fontSize: 16,
    },
});
