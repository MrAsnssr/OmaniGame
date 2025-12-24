import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { getCurrentUser } from '../services/authService';

interface LeaderboardEntry {
    id: string;
    displayName: string;
    longestStreak: number;
    currentStreak?: number;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const user = getCurrentUser();
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'streak' | 'games'>('streak');

    useEffect(() => {
        loadLeaderboard();
    }, [tab]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const streakRef = collection(db, 'streaks');
            const q = query(
                streakRef,
                orderBy(tab === 'streak' ? 'longestStreak' : 'currentStreak', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LeaderboardEntry[];
            setLeaders(data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const isCurrentUser = user?.uid === item.id;
        const rank = index + 1;

        let medalColor = colors.sand;
        if (rank === 1) medalColor = '#FFD700';
        else if (rank === 2) medalColor = '#C0C0C0';
        else if (rank === 3) medalColor = '#CD7F32';

        return (
            <Animated.View
                entering={FadeInUp.delay(index * 50).springify()}
                style={[styles.leaderCard, isCurrentUser && styles.currentUserCard]}
            >
                <View style={styles.rankContainer}>
                    {rank <= 3 ? (
                        <Ionicons name="medal" size={28} color={medalColor} />
                    ) : (
                        <Text style={styles.rankText}>{rank}</Text>
                    )}
                </View>
                <View style={styles.playerInfo}>
                    <Ionicons name="person-circle" size={40} color={colors.sand} />
                    <View>
                        <Text style={[styles.playerName, isCurrentUser && styles.currentUserName]}>
                            {item.displayName || 'لاعب'}
                        </Text>
                        {isCurrentUser && <Text style={styles.youBadge}>أنت</Text>}
                    </View>
                </View>
                <View style={styles.scoreContainer}>
                    <Ionicons name="flame" size={20} color={colors.primary} />
                    <Text style={styles.scoreText}>{item.longestStreak || 0}</Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المتصدرين</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'streak' && styles.tabActive]}
                    onPress={() => setTab('streak')}
                >
                    <Ionicons
                        name="flame"
                        size={20}
                        color={tab === 'streak' ? colors.white : colors.sand}
                    />
                    <Text style={[styles.tabText, tab === 'streak' && styles.tabTextActive]}>
                        أطول سلسلة
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'games' && styles.tabActive]}
                    onPress={() => setTab('games')}
                >
                    <Ionicons
                        name="trophy"
                        size={20}
                        color={tab === 'games' ? colors.white : colors.sand}
                    />
                    <Text style={[styles.tabText, tab === 'games' && styles.tabTextActive]}>
                        السلسلة الحالية
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Leaderboard List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>جاري التحميل...</Text>
                </View>
            ) : leaders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={64} color={colors.sand} />
                    <Text style={styles.emptyText}>لا يوجد متصدرين بعد</Text>
                    <Text style={styles.emptySubtext}>كن أول من يتصدر القائمة!</Text>
                </View>
            ) : (
                <FlatList
                    data={leaders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: 4,
        marginBottom: spacing.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.sm,
        gap: spacing.xs,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.sand,
        fontSize: 14,
    },
    tabTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    leaderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    currentUserCard: {
        borderWidth: 1,
        borderColor: colors.primary,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
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
        gap: spacing.sm,
    },
    playerName: {
        fontSize: 16,
        color: colors.white,
    },
    currentUserName: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    youBadge: {
        fontSize: 10,
        color: colors.primary,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.woodDark,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: colors.sand,
        marginTop: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        color: colors.sand,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
        marginTop: spacing.xs,
    },
});
