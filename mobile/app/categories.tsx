import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
    const router = useRouter();
    const topicsBySubject = useGameStore(state => state.getTopicsBySubject());
    const startGameWithTopics = useGameStore(state => state.startGameWithTopics);
    const questionCount = useGameStore(state => state.questionCount);
    const setQuestionCount = useGameStore(state => state.setQuestionCount);
    const timePerQuestion = useGameStore(state => state.timePerQuestion);
    const setTimePerQuestion = useGameStore(state => state.setTimePerQuestion);
    const selectedTypes = useGameStore(state => state.selectedTypes);
    const toggleType = useGameStore(state => state.toggleType);

    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

    const subjectEntries = useMemo(() => Object.entries(topicsBySubject), [topicsBySubject]);

    const toggleSubject = (subjectId: string) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const toggleTopic = (topicId: string) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };

    const selectAllInSubject = (subjectId: string) => {
        const topics = topicsBySubject[subjectId]?.topics || [];
        const allIds = topics.map(t => t.id);
        const allSelected = allIds.every(id => selectedTopics.includes(id));

        if (allSelected) {
            setSelectedTopics(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedTopics(prev => [...new Set([...prev, ...allIds])]);
        }
    };

    const handleStartGame = () => {
        if (selectedTopics.length === 0) return;
        startGameWithTopics(selectedTopics);
        router.push('/play');
    };

    const questionTypes = [
        { id: 'multiple-choice', label: 'اختيار متعدد', icon: 'list' },
        { id: 'fill-blank', label: 'أكمل الفراغ', icon: 'create' },
        { id: 'order', label: 'ترتيب', icon: 'swap-vertical' },
        { id: 'match', label: 'توصيل', icon: 'git-compare' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.sand} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>اختر المواضيع</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Settings Section */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>إعدادات اللعبة</Text>

                    {/* Question Count */}
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>عدد الأسئلة</Text>
                        <View style={styles.settingButtons}>
                            {[5, 10, 15, 20].map(count => (
                                <TouchableOpacity
                                    key={count}
                                    style={[styles.settingButton, questionCount === count && styles.settingButtonActive]}
                                    onPress={() => setQuestionCount(count)}
                                >
                                    <Text style={[styles.settingButtonText, questionCount === count && styles.settingButtonTextActive]}>
                                        {count}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Time per Question */}
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>الوقت (ثانية)</Text>
                        <View style={styles.settingButtons}>
                            {[15, 30, 45, 60].map(time => (
                                <TouchableOpacity
                                    key={time}
                                    style={[styles.settingButton, timePerQuestion === time && styles.settingButtonActive]}
                                    onPress={() => setTimePerQuestion(time)}
                                >
                                    <Text style={[styles.settingButtonText, timePerQuestion === time && styles.settingButtonTextActive]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Question Types */}
                    <Text style={styles.settingLabel}>أنواع الأسئلة</Text>
                    <View style={styles.typesContainer}>
                        {questionTypes.map(type => (
                            <TouchableOpacity
                                key={type.id}
                                style={[styles.typeButton, selectedTypes.includes(type.id) && styles.typeButtonActive]}
                                onPress={() => toggleType(type.id)}
                            >
                                <Ionicons
                                    name={type.icon as any}
                                    size={20}
                                    color={selectedTypes.includes(type.id) ? colors.white : colors.sand}
                                />
                                <Text style={[styles.typeButtonText, selectedTypes.includes(type.id) && styles.typeButtonTextActive]}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Categories Section */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>المواضيع</Text>

                    {subjectEntries.map(([subjectId, { subject, topics }], index) => (
                        <View key={subjectId} style={styles.subjectContainer}>
                            {/* Subject Header */}
                            <TouchableOpacity
                                style={styles.subjectHeader}
                                onPress={() => toggleSubject(subjectId)}
                            >
                                <View style={styles.subjectLeft}>
                                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                                    <Text style={styles.subjectName}>{subject.name}</Text>
                                    <Text style={styles.topicCount}>({topics.length})</Text>
                                </View>
                                <View style={styles.subjectRight}>
                                    <TouchableOpacity
                                        style={styles.selectAllButton}
                                        onPress={() => selectAllInSubject(subjectId)}
                                    >
                                        <Text style={styles.selectAllText}>
                                            {topics.every(t => selectedTopics.includes(t.id)) ? 'إلغاء الكل' : 'اختر الكل'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Ionicons
                                        name={expandedSubjects.includes(subjectId) ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={colors.sand}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Topics */}
                            {expandedSubjects.includes(subjectId) && (
                                <View style={styles.topicsContainer}>
                                    {topics.map(topic => (
                                        <TouchableOpacity
                                            key={topic.id}
                                            style={[styles.topicButton, selectedTopics.includes(topic.id) && styles.topicButtonActive]}
                                            onPress={() => toggleTopic(topic.id)}
                                        >
                                            <Text style={styles.topicIcon}>{topic.icon}</Text>
                                            <Text style={[styles.topicName, selectedTopics.includes(topic.id) && styles.topicNameActive]}>
                                                {topic.name}
                                            </Text>
                                            {selectedTopics.includes(topic.id) && (
                                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </Animated.View>

                {/* Spacer for bottom button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Start Button */}
            <View style={styles.startButtonContainer}>
                <TouchableOpacity
                    style={[styles.startButton, selectedTopics.length === 0 && styles.startButtonDisabled]}
                    onPress={handleStartGame}
                    disabled={selectedTopics.length === 0}
                >
                    <Text style={styles.startButtonText}>
                        {selectedTopics.length === 0
                            ? 'اختر موضوعاً واحداً على الأقل'
                            : `ابدأ اللعب (${selectedTopics.length} موضوع)`}
                    </Text>
                    <Ionicons name="play" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>
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
    scrollView: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    settingsSection: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.md,
    },
    settingRow: {
        marginBottom: spacing.md,
    },
    settingLabel: {
        fontSize: 14,
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.sm,
    },
    settingButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
    },
    settingButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    settingButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    settingButtonText: {
        color: colors.sand,
        fontSize: 14,
    },
    settingButtonTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
    typesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: spacing.xs,
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeButtonText: {
        color: colors.sand,
        fontSize: 12,
    },
    typeButtonTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
    categoriesSection: {
        marginBottom: spacing.lg,
    },
    subjectContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    subjectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    subjectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    subjectIcon: {
        fontSize: 24,
    },
    subjectName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
    topicCount: {
        fontSize: 14,
        color: colors.sand,
        opacity: 0.7,
    },
    subjectRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    selectAllButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    selectAllText: {
        fontSize: 12,
        color: colors.sand,
    },
    topicsContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    topicButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
        marginBottom: spacing.xs,
        gap: spacing.sm,
    },
    topicButtonActive: {
        backgroundColor: 'rgba(236, 73, 19, 0.2)',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    topicIcon: {
        fontSize: 18,
    },
    topicName: {
        flex: 1,
        fontSize: 14,
        color: colors.sand,
    },
    topicNameActive: {
        color: colors.white,
        fontWeight: '500',
    },
    startButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        backgroundColor: colors.woodDark,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        ...shadows.md,
    },
    startButtonDisabled: {
        backgroundColor: 'rgba(236, 73, 19, 0.3)',
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
    },
});
