import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { getCurrentUser } from '../services/authService';

export default function MarketScreen() {
    const router = useRouter();
    const user = getCurrentUser();
    const marketItems = useGameStore(state => state.marketItems);
    const dirhams = useGameStore(state => state.dirhams);
    const spendDirhams = useGameStore(state => state.spendDirhams);
    const ownedMarketItemIds = useGameStore(state => state.ownedMarketItemIds);

    const handlePurchase = (item: any) => {
        if (!user) {
            Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول للشراء', [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'تسجيل الدخول', onPress: () => router.push('/login') }
            ]);
            return;
        }

        if (ownedMarketItemIds.includes(item.id)) {
            Alert.alert('مملوك', 'لديك هذا العنصر بالفعل');
            return;
        }

        if (dirhams < item.priceDirhams) {
            Alert.alert('رصيد غير كافي', 'ليس لديك دراهم كافية', [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'اذهب للمتجر', onPress: () => router.push('/shop') }
            ]);
            return;
        }

        Alert.alert(
            'تأكيد الشراء',
            `هل تريد شراء "${item.title}" مقابل ${item.priceDirhams} درهم؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'شراء',
                    onPress: () => {
                        // TODO: Implement actual purchase logic
                        Alert.alert('قريباً', 'ميزة الشراء قيد التطوير');
                    }
                }
            ]
        );
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'topic_unlock': return 'book';
            case 'subject_unlock': return 'library';
            case 'avatar_unlock': return 'person-circle';
            case 'membership_topics': return 'key';
            case 'membership_avatars': return 'star';
            default: return 'gift';
        }
    };

    const getItemColor = (type: string) => {
        switch (type) {
            case 'topic_unlock': return '#3b82f6';
            case 'subject_unlock': return '#8b5cf6';
            case 'avatar_unlock': return '#ec4899';
            case 'membership_topics': return colors.omaniGold;
            case 'membership_avatars': return colors.omaniGold;
            default: return colors.sand;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>السوق</Text>
                <TouchableOpacity onPress={() => router.push('/shop')} style={styles.dirhamsButton}>
                    <Ionicons name="diamond" size={16} color={colors.omaniGold} />
                    <Text style={styles.dirhamsText}>{dirhams}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {marketItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={64} color={colors.sand} />
                        <Text style={styles.emptyText}>لا توجد عناصر في السوق</Text>
                    </View>
                ) : (
                    <View style={styles.itemsGrid}>
                        {marketItems.map((item, index) => {
                            const isOwned = ownedMarketItemIds.includes(item.id);
                            const itemColor = getItemColor(item.type);

                            return (
                                <Animated.View
                                    key={item.id}
                                    entering={FadeInUp.delay(index * 50)}
                                    style={styles.itemCardWrapper}
                                >
                                    <TouchableOpacity
                                        style={[styles.itemCard, isOwned && styles.itemCardOwned]}
                                        onPress={() => handlePurchase(item)}
                                        disabled={isOwned}
                                    >
                                        {item.discountPercent && item.discountPercent > 0 && (
                                            <View style={styles.discountBadge}>
                                                <Text style={styles.discountText}>-{item.discountPercent}%</Text>
                                            </View>
                                        )}
                                        <View style={[styles.iconContainer, { backgroundColor: `${itemColor}20` }]}>
                                            <Ionicons name={getItemIcon(item.type) as any} size={32} color={itemColor} />
                                        </View>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        {item.description && (
                                            <Text style={styles.itemDescription} numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                        )}
                                        <View style={styles.priceContainer}>
                                            {isOwned ? (
                                                <View style={styles.ownedBadge}>
                                                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                                    <Text style={styles.ownedText}>مملوك</Text>
                                                </View>
                                            ) : (
                                                <>
                                                    <Ionicons name="diamond" size={16} color={colors.omaniGold} />
                                                    <Text style={styles.priceText}>{item.priceDirhams}</Text>
                                                </>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
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
    dirhamsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    dirhamsText: {
        color: colors.omaniGold,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: colors.sand,
        fontSize: 16,
        marginTop: spacing.md,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    itemCardWrapper: {
        width: '47%',
    },
    itemCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        position: 'relative',
        ...shadows.sm,
    },
    itemCardOwned: {
        opacity: 0.6,
    },
    discountBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    discountText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    itemDescription: {
        fontSize: 11,
        color: colors.sand,
        opacity: 0.7,
        textAlign: 'center',
        marginTop: 4,
        minHeight: 30,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: 4,
    },
    priceText: {
        color: colors.omaniGold,
        fontSize: 16,
        fontWeight: 'bold',
    },
    ownedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ownedText: {
        color: colors.success,
        fontSize: 12,
    },
});
