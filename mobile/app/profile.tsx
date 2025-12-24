import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { signOut, getCurrentUser, updateUserProfile } from '../services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const user = getCurrentUser();
    const dirhams = useGameStore(state => state.dirhams);
    const currentStreak = useGameStore(state => state.currentStreak);
    const longestStreak = useGameStore(state => state.longestStreak);
    const ownedTopicIds = useGameStore(state => state.ownedTopicIds);
    const ownedAvatarIds = useGameStore(state => state.ownedAvatarIds);

    const handleSignOut = async () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل تريد تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'خروج',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await signOut();
                        if (result.success) {
                            router.replace('/');
                        }
                    }
                },
            ]
        );
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.sand} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>الملف الشخصي</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.notLoggedIn}>
                    <Ionicons name="person-circle-outline" size={64} color={colors.sand} />
                    <Text style={styles.notLoggedInText}>لم تسجل الدخول</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الملف الشخصي</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={80} color={colors.sand} />
                    </View>
                    <Text style={styles.displayName}>
                        {user.displayName || 'لاعب'}
                    </Text>
                    <Text style={styles.email}>{user.email}</Text>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="diamond" size={28} color={colors.omaniGold} />
                        <Text style={styles.statValue}>{dirhams}</Text>
                        <Text style={styles.statLabel}>درهم</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={28} color={colors.primary} />
                        <Text style={styles.statValue}>{currentStreak}</Text>
                        <Text style={styles.statLabel}>السلسلة الحالية</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="trophy" size={28} color={colors.omaniGold} />
                        <Text style={styles.statValue}>{longestStreak}</Text>
                        <Text style={styles.statLabel}>أطول سلسلة</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="library" size={28} color={colors.sand} />
                        <Text style={styles.statValue}>{ownedTopicIds.length}</Text>
                        <Text style={styles.statLabel}>مواضيع مملوكة</Text>
                    </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/shop')}>
                        <View style={styles.actionLeft}>
                            <Ionicons name="cart" size={24} color={colors.sand} />
                            <Text style={styles.actionText}>متجر العملات</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.sand} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/market')}>
                        <View style={styles.actionLeft}>
                            <Ionicons name="storefront" size={24} color={colors.sand} />
                            <Text style={styles.actionText}>السوق</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.sand} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings')}>
                        <View style={styles.actionLeft}>
                            <Ionicons name="settings" size={24} color={colors.sand} />
                            <Text style={styles.actionText}>الإعدادات</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.sand} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
                        <View style={styles.actionLeft}>
                            <Ionicons name="log-out" size={24} color={colors.error} />
                            <Text style={[styles.actionText, { color: colors.error }]}>تسجيل الخروج</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
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
    scrollContent: {
        padding: spacing.lg,
    },
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    notLoggedInText: {
        color: colors.sand,
        fontSize: 18,
    },
    loginButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    loginButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    avatarContainer: {
        marginBottom: spacing.md,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },
    email: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
        marginTop: spacing.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
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
        textAlign: 'center',
    },
    actionsContainer: {
        gap: spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    actionText: {
        color: colors.sand,
        fontSize: 16,
    },
    signOutButton: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.error,
        backgroundColor: 'transparent',
    },
});
