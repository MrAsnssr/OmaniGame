import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { signInWithEmail, signUpWithEmail } from '../services/authService';

export default function LoginScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
            return;
        }

        setLoading(true);

        try {
            const result = isLogin
                ? await signInWithEmail(email, password)
                : await signUpWithEmail(email, password);

            if (result.success) {
                router.replace('/');
            } else {
                Alert.alert('خطأ', result.error || 'حدث خطأ');
            }
        } catch (error: any) {
            Alert.alert('خطأ', error.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.sand} />
                        </TouchableOpacity>
                    </View>

                    {/* Logo/Title */}
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.logoContainer}>
                        <Text style={styles.title}>سبلة عمان</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                        </Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View entering={FadeInUp.delay(200)} style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail" size={20} color={colors.sand} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="البريد الإلكتروني"
                                placeholderTextColor="rgba(196, 167, 125, 0.5)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                textAlign="right"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed" size={20} color={colors.sand} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="كلمة المرور"
                                placeholderTextColor="rgba(196, 167, 125, 0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                textAlign="right"
                            />
                        </View>

                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed" size={20} color={colors.sand} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="تأكيد كلمة المرور"
                                    placeholderTextColor="rgba(196, 167, 125, 0.5)"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    textAlign="right"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
                            </Text>
                        </TouchableOpacity>

                        {/* Toggle Login/Signup */}
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.toggleText}>
                                {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
                                <Text style={styles.toggleTextHighlight}>
                                    {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Skip */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.replace('/')}
                    >
                        <Text style={styles.skipText}>المتابعة كضيف</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    backButton: {
        padding: spacing.sm,
        alignSelf: 'flex-start',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: colors.sand,
    },
    subtitle: {
        fontSize: 18,
        color: colors.sand,
        opacity: 0.7,
        marginTop: spacing.sm,
    },
    formContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.woodDark,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        color: colors.white,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.md,
        ...shadows.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleButton: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    toggleText: {
        color: colors.sand,
        fontSize: 14,
    },
    toggleTextHighlight: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    skipButton: {
        alignItems: 'center',
        padding: spacing.md,
    },
    skipText: {
        color: colors.sand,
        fontSize: 14,
        opacity: 0.7,
    },
});
