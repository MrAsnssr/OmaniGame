import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { Question } from '../../types';

interface Props {
    question: Question;
    onAnswer: (answer: string[]) => void;
    onUpdate?: (answer: string[]) => void;
    disabled?: boolean;
}

interface OrderItem {
    id: string;
    text: string;
}

// Remove years from text to avoid hints
const removeYear = (text: string): string => {
    return text.replace(/\s*\(\d{4}\)\s*/g, '').replace(/\s*\d{4}\s*/g, ' ').trim();
};

export default function Order({ question, onAnswer, onUpdate, disabled = false }: Props) {
    const [items, setItems] = useState<OrderItem[]>([]);

    useEffect(() => {
        if (question.items) {
            // Shuffle items for initial display
            const shuffled = [...question.items].sort(() => Math.random() - 0.5);
            setItems(shuffled);
        }
    }, [question.id]);

    const handleDragEnd = ({ data }: { data: OrderItem[] }) => {
        setItems(data);
        const order = data.map(item => item.id);
        onUpdate?.(order);
    };

    const handleSubmit = () => {
        if (!disabled) {
            const order = items.map(item => item.id);
            onAnswer(order);
        }
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<OrderItem>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={disabled ? undefined : drag}
                    disabled={isActive}
                    style={[
                        styles.itemContainer,
                        isActive && styles.itemActive,
                        disabled && styles.itemDisabled
                    ]}
                >
                    <Ionicons
                        name="menu"
                        size={24}
                        color={colors.sand}
                        style={styles.dragHandle}
                    />
                    <Text style={styles.itemText}>{removeYear(item.text)}</Text>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.delay(100)} style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    اسحب العناصر لترتيبها بالتسلسل الصحيح
                </Text>
            </Animated.View>

            <View style={styles.listContainer}>
                <DraggableFlatList
                    data={items}
                    onDragEnd={handleDragEnd}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    containerStyle={styles.flatList}
                />
            </View>

            <Animated.View entering={FadeInUp.delay(200)}>
                <TouchableOpacity
                    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={disabled}
                >
                    <Text style={styles.submitButtonText}>تأكيد الترتيب</Text>
                </TouchableOpacity>
            </Animated.View>
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
    listContainer: {
        flex: 1,
    },
    flatList: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...shadows.sm,
    },
    itemActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        transform: [{ scale: 1.02 }],
    },
    itemDisabled: {
        opacity: 0.6,
    },
    dragHandle: {
        marginRight: spacing.md,
    },
    itemText: {
        flex: 1,
        color: colors.white,
        fontSize: 16,
        textAlign: 'right',
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
