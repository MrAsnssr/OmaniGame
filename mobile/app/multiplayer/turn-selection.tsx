import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import socketService from '../../services/socketService';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { getCurrentUser } from '../../services/authService';

interface TurnData {
    activePlayerId: string;
    stage: 'category' | 'type';
    selectedCategoryId?: string;
    options?: any[];
}

export default function TurnSelectionScreen() {
    const router = useRouter();
    const user = getCurrentUser();
    const turnData = useGameStore(state => state.turnData) as TurnData;
    const players = useGameStore(state => state.players);
    const categories = useGameStore(state => state.categories);

    // Derived state
    const activePlayer = players.find(p => p.id === turnData?.activePlayerId);
    const isMyTurn = turnData?.activePlayerId === socketService.socket?.id;
    const stage = turnData?.stage || 'category';

    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Prevent back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    // Listen for game start from this screen
    useEffect(() => {
        const handleTurnUpdate = (data: any) => {
            // Store updates turnData automatically via listener in _layout or store
            // but we might need to reset local state
            setSelectedId(null);
        };

        const handleGameStarted = () => {
            router.replace('/multiplayer/play');
        };

        socketService.on('turn-update', handleTurnUpdate);
        socketService.on('game-started', handleGameStarted);

        return () => {
            socketService.off('turn-update');
            socketService.off('game-started');
        };
    }, []);

    const handleSelection = (id: string) => {
        if (!isMyTurn) return;
        setSelectedId(id);

        if (stage === 'category') {
            socketService.selectCategory(id);
        } else {
            socketService.selectType(id);
        }
    };

    const renderOption = ({ item, index }: { item: any; index: number }) => {
        // Prepare data based on stage
        let id, label, icon;
        if (stage === 'category') {
            id = item.id;
            label = item.name;
            icon = item.icon || 'book';
        } else {
            // Types are simple objects or strings, need normalized structure from server
            // Assuming server sends { id: 'multiple-choice', label: '...' }
            id = item.id;
            label = item.label;
            icon = item.icon || 'help';
        }

        const isSelected = selectedId === id;

        return (
            <Animated.View entering={ZoomIn.delay(index * 50)} style={styles.gridItem}>
                <TouchableOpacity
                    style={[
                        styles.card,
                        isMyTurn ? styles.activeCard : styles.disabledCard,
                        isSelected && styles.selectedCard
                    ]}
                    onPress={() => handleSelection(id)}
                    disabled={!isMyTurn}
                >
                    <Ionicons
                        name={stage === 'category' ? 'layers' : 'cube'}
                        size={32}
                        color={isSelected ? colors.white : colors.primary}
                    />
                    <Text style={[styles.cardText, isSelected && styles.selectedCardText]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Get active data source
    const options = stage === 'category'
        ? categories.filter(c => turnData?.options?.includes(c.id)) // Filter if server sends restricted list
        : [
            { id: 'multiple-choice', label: 'اختيار من متعدد' },
            { id: 'fill-blank', label: 'أكمل الفراغ' },
            { id: 'order', label: 'رتب العناصر' },
            { id: 'match', label: 'وصل العمودين' }
        ];
    // Note: Real implementation depends on exactly what 'turnData.options' contains

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Status */}
            <View style={styles.header}>
                <View style={styles.turnIndicator}>
                    {isMyTurn ? (
                        <Text style={styles.myTurnText}>دورك الآن! 🎲</Text>
                    ) : (
                        <Text style={styles.waitingText}>
                            دور {activePlayer?.name || 'اللاعب الآخر'}...
                        </Text>
                    )}
                </View>
                <Text style={styles.stageTitle}>
                    {stage === 'category' ? 'اختر الموضوع' : 'اختر نوع السؤال'}
                </Text>
            </View>

            {/* Options Grid */}
            <FlatList
                data={stage === 'category' ? categories : options} // Use full categories for demo if options undefined
                renderItem={renderOption}
                keyExtractor={(item: any) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.gap}
            />

            {/* Waiting Overlay for inactive players */}
            {!isMyTurn && (
                <View style={styles.waitingOverlay}>
                    <View style={styles.waitingMessage}>
                        <Ionicons name="time" size={32} color={colors.white} />
                        <Text style={styles.overlayText}>
                            جاري الاختيار بواسطة {activePlayer?.name}...
                        </Text>
                    </View>
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
        padding: spacing.xl,
        alignItems: 'center',
        paddingTop: spacing.xxl,
    },
    turnIndicator: {
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    myTurnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.success,
    },
    waitingText: {
        fontSize: 18,
        color: colors.sand,
    },
    stageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    gridContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    gap: {
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    gridItem: {
        flex: 1,
    },
    card: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        height: 120,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeCard: {
        borderColor: colors.primary,
        ...shadows.md,
    },
    disabledCard: {
        opacity: 0.7,
    },
    selectedCard: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    cardText: {
        fontSize: 16,
        color: colors.sand,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    selectedCardText: {
        color: colors.white,
    },
    waitingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        paddingBottom: spacing.xxl,
        alignItems: 'center',
    },
    waitingMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.woodDark,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.full,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.sand,
        ...shadows.lg,
    },
    overlayText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
