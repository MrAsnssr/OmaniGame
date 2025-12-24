import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { getCurrentUser } from '../services/authService';

export default function ShopScreen() {
    const router = useRouter();
    const user = getCurrentUser();
    const dirhams = useGameStore(state => state.dirhams);
    const addDirhams = useGameStore(state => state.addDirhams);

    const handleWatchAd = () => {
        // Simulate ad reward (actual ad implementation would go here)
        Alert.alert(
            'إعلان',
            'سيتم تشغيل الإعلان للحصول على 300 درهم',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'مشاهدة',
                    onPress: () => {
                        // Simulate ad completion
                        setTimeout(() => {
                            addDirhams(300);
                            Alert.alert('🎉 تهانينا!', 'حصلت على 300 درهم!');
                        }, 1000);
                    }
                }
            ]
        );
    };

    const coinPackages = [
        { id: 1, amount: 500, bonus: 0, price: '$0.99' },
        { id: 2, amount: 1200, bonus: 200, price: '$1.99', popular: true },
        { id: 3, amount: 2500, bonus: 500, price: '$3.99' },
        { id: 4, amount: 5500, bonus: 1500, price: '$7.99' },
        { id: 5, amount: 12000, bonus: 4000, price: '$14.99', bestValue: true },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>متجر العملات</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Current Balance */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.balanceCard}>
                <Ionicons name="diamond" size={32} color={colors.omaniGold} />
                <View>
                    <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
                    <Text style={styles.balanceValue}>{dirhams} درهم</Text>
                </View>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Watch Ad Section */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.adSection}>
                    <Text style={styles.sectionTitle}>احصل على دراهم مجانية</Text>
                    <TouchableOpacity style={styles.watchAdButton} onPress={handleWatchAd}>
                        <View style={styles.adReward}>
                            <Ionicons name="play-circle" size={40} color={colors.primary} />
                            <View>
                                <Text style={styles.adButtonText}>شاهد إعلان</Text>
                                <Text style={styles.adRewardText}>+300 درهم</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.sand} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Coin Packages */}
                <Animated.View entering={FadeInUp.delay(300)}>
                    <Text style={styles.sectionTitle}>باقات الدراهم</Text>
                    <View style={styles.packagesGrid}>
                        {coinPackages.map((pkg, index) => (
                            <TouchableOpacity
                                key={pkg.id}
                                style={[
                                    styles.packageCard,
                                    pkg.popular && styles.popularCard,
                                    pkg.bestValue && styles.bestValueCard
                                ]}
                                onPress={() => Alert.alert('قريباً', 'ميزة الشراء قيد التطوير')}
                            >
                                {pkg.popular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.badgeText}>الأكثر شعبية</Text>
                                    </View>
                                )}
                                {pkg.bestValue && (
                                    <View style={[styles.popularBadge, styles.bestValueBadge]}>
                                        <Text style={styles.badgeText}>أفضل قيمة</Text>
                                    </View>
                                )}
                                <Ionicons name="diamond" size={28} color={colors.omaniGold} />
                                <Text style={styles.packageAmount}>{pkg.amount.toLocaleString()}</Text>
                                {pkg.bonus > 0 && (
                                    <Text style={styles.packageBonus}>+{pkg.bonus} مجاناً</Text>
                                )}
                                <View style={styles.priceButton}>
                                    <Text style={styles.priceText}>{pkg.price}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    balanceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.omaniGold,
        marginBottom: spacing.lg,
    },
    balanceLabel: {
        fontSize: 14,
        color: colors.sand,
    },
    balanceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.omaniGold,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.md,
    },
    adSection: {
        marginBottom: spacing.xl,
    },
    watchAdButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    adReward: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    adButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
    adRewardText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
    },
    packagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    packageCard: {
        width: '47%',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        position: 'relative',
        ...shadows.sm,
    },
    popularCard: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    bestValueCard: {
        borderWidth: 2,
        borderColor: colors.omaniGold,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    bestValueBadge: {
        backgroundColor: colors.omaniGold,
    },
    badgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    packageAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: spacing.sm,
    },
    packageBonus: {
        fontSize: 12,
        color: colors.success,
        fontWeight: 'bold',
    },
    priceButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
    },
    priceText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
