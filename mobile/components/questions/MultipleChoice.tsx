import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Question } from '../../types';

interface Props {
    question: Question;
    onAnswer: (answer: string) => void;
    disabled?: boolean;
    selectedAnswer?: string | null;
    correctAnswer?: string | null;
}

const optionColors = [
    { bg: '#3b82f6', border: '#2563eb' }, // Blue
    { bg: '#ef4444', border: '#dc2626' }, // Red
    { bg: '#22c55e', border: '#16a34a' }, // Green
    { bg: '#f59e0b', border: '#d97706' }, // Amber
];

export default function MultipleChoice({ question, onAnswer, disabled = false, selectedAnswer, correctAnswer }: Props) {
    if (!question.options) return null;

    const getOptionStyle = (option: string, index: number) => {
        const baseColors = optionColors[index % optionColors.length];

        // If feedback is active (we have a selected answer)
        if (selectedAnswer) {
            if (option === correctAnswer) {
                // Always show correct answer in Green
                return {
                    backgroundColor: colors.success,
                    borderColor: '#16a34a',
                };
            }
            if (option === selectedAnswer && option !== correctAnswer) {
                // Show wrong selection in Red
                return {
                    backgroundColor: colors.error,
                    borderColor: '#dc2626',
                };
            }
            // Dim other options
            return {
                backgroundColor: baseColors.bg,
                borderColor: baseColors.border,
                opacity: 0.5,
            };
        }

        // Default state
        return {
            backgroundColor: baseColors.bg,
            borderColor: baseColors.border,
        };
    };

    return (
        <View style={styles.container}>
            {question.options.map((option, index) => (
                <Animated.View
                    key={index}
                    entering={FadeInUp.delay(index * 100)}
                >
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            getOptionStyle(option, index),
                            disabled && !selectedAnswer && styles.optionDisabled
                        ]}
                        onPress={() => !disabled && onAnswer(option)}
                        disabled={disabled}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        gap: spacing.md,
    },
    optionButton: {
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderBottomWidth: 4,
        ...shadows.sm,
    },
    optionDisabled: {
        opacity: 0.6,
    },
    optionText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
