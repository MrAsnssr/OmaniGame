import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function AboutScreen() {
    const router = useRouter();

    const handleEmail = () => {
        Linking.openURL('mailto:asnssrr@gmail.com');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>عن المطور</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Logo or Icon */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="game-controller" size={64} color={colors.omaniGold} />
                    </View>
                    <Text style={styles.appName}>سبلة عمان</Text>
                    <Text style={styles.version}>الإصدار 1.0.0</Text>
                </Animated.View>

                {/* Developer Story */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.card}>
                    <Text style={styles.sectionTitle}>قصة المطور</Text>
                    <Text style={styles.text}>
                        أهلاً بك في لعبة سبلة عمان! 👋
                    </Text>
                    <Text style={styles.text}>
                        أنا مطور ألعاب مستقل من سلطنة عمان 🇴🇲، شغوف بالبرمجة ونشر الثقافة العمانية الأصيلة بطريقة عصرية وممتعة.
                    </Text>
                    <Text style={styles.text}>
                        تم تطوير هذه اللعبة بجهد فردي وحب كبير، لتكون منصة تجمعنا على التحدي والمعرفة. هدفي هو صنع تجربة تليق بالمستخدم العماني والعربي، وتمزج بين المتعة والفائدة.
                    </Text>
                    <Text style={styles.text}>
                        شكراً لدعمكم المستمر وتجربتكم للعبة. كل ملاحظة منكم تساعدني على التحسن وتقديم الأفضل.
                    </Text>
                </Animated.View>

                {/* Contact Section */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.card}>
                    <Text style={styles.sectionTitle}>تواصل معنا</Text>
                    <Text style={styles.text}>
                        لديك اقتراح؟ واجهت مشكلة؟ أو تود فقط إلقاء التحية؟
                    </Text>

                    <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                        <View style={styles.iconBox}>
                            <Ionicons name="mail" size={24} color={colors.white} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
                            <Text style={styles.contactValue}>asnssrr@gmail.com</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.sand} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Footer */}
                <Text style={styles.copyright}>
                    © 2024 جميع الحقوق محفوظة
                </Text>
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
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.omaniGold,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    version: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
        marginTop: 4,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.omaniGold,
        marginBottom: spacing.md,
        textAlign: 'right',
    },
    text: {
        fontSize: 16,
        color: colors.white,
        lineHeight: 26,
        textAlign: 'right',
        marginBottom: spacing.md,
        opacity: 0.9,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.woodDark,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.md,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: colors.sand,
        marginBottom: 2,
        textAlign: 'right',
    },
    contactValue: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    copyright: {
        textAlign: 'center',
        color: colors.sand,
        opacity: 0.5,
        fontSize: 12,
        marginTop: spacing.md,
    },
});
