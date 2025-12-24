import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { signOut, getCurrentUser } from '../services/authService';

export default function SettingsScreen() {
    const router = useRouter();
    const user = getCurrentUser();

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
                        await signOut();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const settingSections = [
        {
            title: 'الحساب',
            items: [
                {
                    icon: 'person',
                    label: user ? 'الملف الشخصي' : 'تسجيل الدخول',
                    action: () => router.push(user ? '/profile' : '/login'),
                },
            ],
        },
        {
            title: 'حول التطبيق',
            items: [
                {
                    icon: 'information-circle',
                    label: 'عن سبلة عمان',
                    action: () => router.push('/about'),
                },
                {
                    icon: 'shield-checkmark',
                    label: 'سياسة الخصوصية',
                    action: () => Linking.openURL('https://example.com/privacy'),
                },
                {
                    icon: 'document-text',
                    label: 'شروط الاستخدام',
                    action: () => Linking.openURL('https://example.com/terms'),
                },
            ],
        },
        {
            title: 'الدعم',
            items: [
                {
                    icon: 'help-circle',
                    label: 'المساعدة',
                    action: () => Alert.alert('المساعدة', 'للدعم: support@example.com'),
                },
                {
                    icon: 'star',
                    label: 'قيّم التطبيق',
                    action: () => Alert.alert('شكراً لك!', 'سيتم فتح المتجر قريباً'),
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الإعدادات</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {settingSections.map((section, sectionIndex) => (
                    <Animated.View
                        key={section.title}
                        entering={FadeInDown.delay(sectionIndex * 100)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[
                                        styles.settingItem,
                                        itemIndex < section.items.length - 1 && styles.settingItemBorder
                                    ]}
                                    onPress={item.action}
                                >
                                    <View style={styles.settingLeft}>
                                        <Ionicons name={item.icon as any} size={22} color={colors.sand} />
                                        <Text style={styles.settingLabel}>{item.label}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.sand} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                ))}

                {user && (
                    <Animated.View entering={FadeInDown.delay(400)}>
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Ionicons name="log-out" size={22} color={colors.error} />
                            <Text style={styles.signOutText}>تسجيل الخروج</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <Text style={styles.versionText}>الإصدار 1.0.0</Text>
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
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
        marginBottom: spacing.sm,
        textAlign: 'right',
    },
    sectionContent: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    settingItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    settingLabel: {
        color: colors.white,
        fontSize: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.error,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        marginTop: spacing.lg,
    },
    signOutText: {
        color: colors.error,
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center',
        color: colors.sand,
        opacity: 0.5,
        marginTop: spacing.xl,
        fontSize: 12,
    },
});
