import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Question } from '../../types';

interface Props {
    question: Question;
    onAnswer: (answer: string) => void;
    onUpdate?: (answer: string) => void;
    disabled?: boolean;
}

export default function FillBlank({ question, onAnswer, onUpdate, disabled = false }: Props) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setInputValue('');
    }, [question.id]);

    const handleChange = (text: string) => {
        setInputValue(text);
        onUpdate?.(text);
    };

    const handleSubmit = () => {
        if (inputValue.trim() && !disabled) {
            onAnswer(inputValue.trim());
        }
    };

    // Check if text is Arabic
    const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);
    const textAlign = isArabic(question.question) ? 'right' : 'left';

    // Replace blank placeholder with visible indicator
    const displayQuestion = question.question.replace('___', '______');

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.delay(100)} style={styles.questionCard}>
                <Text style={[styles.questionText, { textAlign }]}>
                    {displayQuestion}
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200)} style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { textAlign }]}
                    value={inputValue}
                    onChangeText={handleChange}
                    placeholder="أدخل إجابتك هنا..."
                    placeholderTextColor="rgba(196, 167, 125, 0.5)"
                    editable={!disabled}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300)}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!inputValue.trim() || disabled) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!inputValue.trim() || disabled}
                >
                    <Text style={styles.submitButtonText}>تأكيد الإجابة</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        gap: spacing.lg,
    },
    questionCard: {
        backgroundColor: colors.cardBackground,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    questionText: {
        color: colors.white,
        fontSize: 18,
        lineHeight: 28,
    },
    inputContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.sm,
    },
    input: {
        padding: spacing.lg,
        color: colors.white,
        fontSize: 18,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.md,
    },
    submitButtonDisabled: {
        backgroundColor: 'rgba(236, 73, 19, 0.4)',
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
