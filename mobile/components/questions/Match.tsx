import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Question } from '../../types';

interface Props {
    question: Question;
    onAnswer: (answer: { left: string; right: string }[]) => void;
    onUpdate?: (answer: { left: string; right: string }[]) => void;
    disabled?: boolean;
}

interface MatchPair {
    left: string;
    right: string;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 3) / 2;

export default function Match({ question, onAnswer, onUpdate, disabled = false }: Props) {
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matches, setMatches] = useState<MatchPair[]>([]);

    // Shuffle right column items
    const shuffledRight = useMemo(() => {
        if (!question.pairs) return [];
        return [...question.pairs].sort(() => Math.random() - 0.5).map(p => p.right);
    }, [question.id]);

    const leftItems = useMemo(() => {
        return question.pairs?.map(p => p.left) || [];
    }, [question.pairs]);

    useEffect(() => {
        setMatches([]);
        setSelectedLeft(null);
    }, [question.id]);

    const isLeftMatched = (left: string) => matches.some(m => m.left === left);
    const isRightMatched = (right: string) => matches.some(m => m.right === right);
    const getMatchedRight = (left: string) => matches.find(m => m.left === left)?.right;
    const getMatchedLeft = (right: string) => matches.find(m => m.right === right)?.left;

    const handleLeftPress = (left: string) => {
        if (disabled || isLeftMatched(left)) return;
        setSelectedLeft(selectedLeft === left ? null : left);
    };

    const handleRightPress = (right: string) => {
        if (disabled || !selectedLeft || isRightMatched(right)) return;

        const newMatch = { left: selectedLeft, right };
        const newMatches = [...matches, newMatch];
        setMatches(newMatches);
        setSelectedLeft(null);
        onUpdate?.(newMatches);

        // Auto-submit when all pairs are matched
        if (newMatches.length === leftItems.length) {
            setTimeout(() => onAnswer(newMatches), 500);
        }
    };

    const removeMatch = (left: string) => {
        if (disabled) return;
        const newMatches = matches.filter(m => m.left !== left);
        setMatches(newMatches);
        onUpdate?.(newMatches);
    };

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.delay(100)} style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    اضغط على عنصر من اليسار ثم اضغط على العنصر المطابق من اليمين
                </Text>
            </Animated.View>

            <View style={styles.columnsContainer}>
                {/* Left Column */}
                <View style={styles.column}>
                    {leftItems.map((left, index) => {
                        const matched = isLeftMatched(left);
                        const isSelected = selectedLeft === left;

                        return (
                            <Animated.View
                                key={left}
                                entering={FadeInUp.delay(index * 50)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        styles.leftItem,
                                        isSelected && styles.itemSelected,
                                        matched && styles.itemMatched
                                    ]}
                                    onPress={() => matched ? removeMatch(left) : handleLeftPress(left)}
                                    disabled={disabled}
                                >
                                    <Text style={[styles.itemText, matched && styles.itemTextMatched]}>
                                        {left}
                                    </Text>
                                    {matched && (
                                        <Ionicons name="close-circle" size={18} color={colors.sand} />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                    {shuffledRight.map((right, index) => {
                        const matched = isRightMatched(right);

                        return (
                            <Animated.View
                                key={right}
                                entering={FadeInUp.delay(100 + index * 50)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        styles.rightItem,
                                        matched && styles.itemMatched,
                                        !matched && selectedLeft && styles.itemSelectable
                                    ]}
                                    onPress={() => handleRightPress(right)}
                                    disabled={disabled || matched || !selectedLeft}
                                >
                                    <Text style={[styles.itemText, matched && styles.itemTextMatched]}>
                                        {right}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {matches.length} / {leftItems.length} تم التوصيل
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacing.md,
    },
    instructionContainer: {
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    instructionText: {
        color: colors.sand,
        fontSize: 14,
        textAlign: 'center',
    },
    columnsContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.lg,
    },
    column: {
        flex: 1,
        gap: spacing.sm,
    },
    item: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.cardBackground,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        minHeight: 50,
        justifyContent: 'center',
        ...shadows.sm,
    },
    leftItem: {
        borderColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rightItem: {
        borderColor: '#22c55e',
    },
    itemSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
    },
    itemMatched: {
        opacity: 0.5,
        borderStyle: 'dashed',
    },
    itemSelectable: {
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    itemText: {
        color: colors.white,
        fontSize: 14,
        textAlign: 'center',
        flex: 1,
    },
    itemTextMatched: {
        color: colors.sand,
    },
    progressContainer: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    progressText: {
        color: colors.sand,
        fontSize: 14,
    },
});
