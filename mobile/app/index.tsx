import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { getCurrentUser } from '../services/authService';

const { width } = Dimensions.get('window');

export default function MainMenu() {
    const router = useRouter();
    const dirhams = useGameStore(state => state.dirhams);
    const currentStreak = useGameStore(state => state.currentStreak);
    const user = getCurrentUser();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>سبلة عمان</Text>
                        <Text style={styles.subtitle}>اختبر معلوماتك عن السلطنة</Text>
                    </View>

                    {/* Currency display */}
                    <TouchableOpacity
                        style={styles.currencyButton}
                        onPress={() => router.push('/shop')}
                    >
                        <Ionicons name="diamond" size={20} color={colors.omaniGold} />
                        <Text style={styles.currencyText}>{dirhams}</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Flag decoration */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.flagContainer}>
                    <View style={[styles.flagStripe, { backgroundColor: colors.omaniRed }]} />
                    <View style={[styles.flagStripe, { backgroundColor: colors.omaniWhite }]} />
                    <View style={[styles.flagStripe, { backgroundColor: colors.omaniGreen }]} />
                </Animated.View>

                {/* Game Mode Buttons */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.gameModeContainer}>
                    <Text style={styles.sectionTitle}>اختر طريقة اللعب</Text>

                    {/* Singleplayer */}
                    <TouchableOpacity
                        style={styles.gameModeButton}
                        onPress={() => router.push('/categories')}
                    >
                        <View style={styles.gameModeIcon}>
                            <Ionicons name="person" size={32} color={colors.sand} />
                        </View>
                        <View style={styles.gameModeText}>
                            <Text style={styles.gameModeTitle}>فردي</Text>
                            <Text style={styles.gameModeSubtitle}>العب وحدك بدون إنترنت</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.sand} />
                    </TouchableOpacity>

                    {/* Multiplayer */}
                    <TouchableOpacity
                        style={styles.gameModeButton}
                        onPress={() => router.push('/multiplayer')}
                    >
                        <View style={styles.gameModeIcon}>
                            <Ionicons name="people" size={32} color={colors.sand} />
                        </View>
                        <View style={styles.gameModeText}>
                            <Text style={styles.gameModeTitle}>جماعي</Text>
                            <Text style={styles.gameModeSubtitle}>تحدى أصدقاءك أونلاين</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.sand} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => user ? router.push('/profile') : router.push('/login')}
                    >
                        <Ionicons name="person-circle" size={28} color={colors.sand} />
                        <Text style={styles.quickButtonText}>{user ? 'الملف الشخصي' : 'تسجيل الدخول'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => router.push('/leaderboard')}
                    >
                        <Ionicons name="trophy" size={28} color={colors.omaniGold} />
                        <Text style={styles.quickButtonText}>المتصدرين</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => router.push('/market')}
                    >
                        <Ionicons name="storefront" size={28} color={colors.sand} />
                        <Text style={styles.quickButtonText}>السوق</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings-sharp" size={28} color={colors.sand} />
                        <Text style={styles.quickButtonText}>الإعدادات</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Streak Display */}
                {currentStreak > 0 && (
                    <Animated.View entering={FadeInUp.delay(500)} style={styles.streakContainer}>
                        <Ionicons name="flame" size={24} color={colors.primary} />
                        <Text style={styles.streakText}>سلسلة اللعب: {currentStreak} يوم</Text>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.sand,
        textAlign: 'right',
    },
    subtitle: {
        fontSize: 16,
        color: colors.sand,
        opacity: 0.7,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    currencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.omaniGold,
        ...shadows.sm,
    },
    currencyText: {
        color: colors.omaniGold,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: spacing.xs,
    },
    flagContainer: {
        flexDirection: 'row',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    flagStripe: {
        flex: 1,
    },
    gameModeContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.md,
    },
    gameModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...shadows.md,
    },
    gameModeIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        backgroundColor: colors.woodDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    gameModeText: {
        flex: 1,
    },
    gameModeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'right',
    },
    gameModeSubtitle: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
        textAlign: 'right',
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    quickButton: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...shadows.sm,
    },
    quickButtonText: {
        color: colors.sand,
        fontSize: 14,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(236, 73, 19, 0.2)',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    streakText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: spacing.sm,
    },
});
