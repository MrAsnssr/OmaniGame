import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import socketService from '../services/socketService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { getCurrentUser } from '../services/authService';

export default function MultiplayerLobby() {
    const router = useRouter();
    const user = getCurrentUser();

    const subjects = useGameStore(state => state.subjects);
    const categories = useGameStore(state => state.categories);
    const setRoomData = useGameStore(state => state.setRoomData);
    const questionCount = useGameStore(state => state.questionCount);
    const setQuestionCount = useGameStore(state => state.setQuestionCount);
    const timePerQuestion = useGameStore(state => state.timePerQuestion);
    const setTimePerQuestion = useGameStore(state => state.setTimePerQuestion);
    const selectedTypes = useGameStore(state => state.selectedTypes);
    const toggleType = useGameStore(state => state.toggleType);

    const [playerName, setPlayerName] = useState(user?.displayName || '');
    const [roomCode, setRoomCode] = useState('');
    const [gameMode, setGameMode] = useState<'standard' | 'turn-based'>('standard');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        // Connect to socket
        socketService.connect();

        // Set up socket listeners
        socketService.on('room-created', (data: any) => {
            setRoomData(data.roomCode, data.players, true, data.gameMode);
            router.push('/multiplayer/waiting');
        });

        socketService.on('room-joined', (data: any) => {
            setRoomData(data.roomCode, data.players, false, data.gameMode);
            router.push('/multiplayer/waiting');
        });

        socketService.on('error', (data: any) => {
            Alert.alert('خطأ', data.message);
            setIsCreating(false);
            setIsJoining(false);
        });

        return () => {
            socketService.off('room-created');
            socketService.off('room-joined');
            socketService.off('error');
        };
    }, []);

    const handleCreateRoom = () => {
        if (!playerName.trim()) {
            Alert.alert('خطأ', 'الرجاء إدخال اسمك');
            return;
        }
        if (selectedTopics.length === 0) {
            Alert.alert('خطأ', 'الرجاء اختيار موضوع واحد على الأقل');
            return;
        }

        setIsCreating(true);
        socketService.createRoom(playerName.trim(), {
            questionCount,
            timePerQuestion,
            selectedTypes,
            topicIds: selectedTopics
        }, gameMode);
    };

    const handleJoinRoom = () => {
        if (!playerName.trim()) {
            Alert.alert('خطأ', 'الرجاء إدخال اسمك');
            return;
        }
        if (!roomCode.trim()) {
            Alert.alert('خطأ', 'الرجاء إدخال رمز الغرفة');
            return;
        }

        setIsJoining(true);
        socketService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    };

    const toggleTopic = (topicId: string) => {
        setSelectedTopics(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };

    const questionTypes = [
        { id: 'multiple-choice', label: 'اختيار', icon: 'list' },
        { id: 'fill-blank', label: 'فراغ', icon: 'create' },
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
                <Text style={styles.headerTitle}>اللعب الجماعي</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Player Name */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
                    <Text style={styles.sectionTitle}>اسمك</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person" size={20} color={colors.sand} />
                        <TextInput
                            style={styles.input}
                            value={playerName}
                            onChangeText={setPlayerName}
                            placeholder="أدخل اسمك"
                            placeholderTextColor="rgba(196, 167, 125, 0.5)"
                            textAlign="right"
                        />
                    </View>
                </Animated.View>

                {/* Game Mode */}
                <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
                    <Text style={styles.sectionTitle}>نوع اللعب</Text>
                    <View style={styles.gameModeContainer}>
                        <TouchableOpacity
                            style={[styles.gameModeButton, gameMode === 'standard' && styles.gameModeButtonActive]}
                            onPress={() => setGameMode('standard')}
                        >
                            <Ionicons name="shuffle" size={20} color={gameMode === 'standard' ? colors.white : colors.sand} />
                            <Text style={[styles.gameModeText, gameMode === 'standard' && styles.gameModeTextActive]}>عشوائي</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.gameModeButton, gameMode === 'turn-based' && styles.gameModeButtonActive]}
                            onPress={() => setGameMode('turn-based')}
                        >
                            <Ionicons name="swap-horizontal" size={20} color={gameMode === 'turn-based' ? colors.white : colors.sand} />
                            <Text style={[styles.gameModeText, gameMode === 'turn-based' && styles.gameModeTextActive]}>بالأدوار</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Settings */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
                    <Text style={styles.sectionTitle}>إعدادات اللعبة</Text>

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>عدد الأسئلة</Text>
                        <View style={styles.settingButtons}>
                            {[5, 10, 15].map(count => (
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

                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>الوقت (ثانية)</Text>
                        <View style={styles.settingButtons}>
                            {[15, 30, 45].map(time => (
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
                                    size={16}
                                    color={selectedTypes.includes(type.id) ? colors.white : colors.sand}
                                />
                                <Text style={[styles.typeButtonText, selectedTypes.includes(type.id) && styles.typeButtonTextActive]}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Topics */}
                <Animated.View entering={FadeInUp.delay(250)} style={styles.section}>
                    <Text style={styles.sectionTitle}>المواضيع ({selectedTopics.length} مختار)</Text>
                    <View style={styles.topicsContainer}>
                        {categories.slice(0, 12).map(topic => (
                            <TouchableOpacity
                                key={topic.id}
                                style={[styles.topicChip, selectedTopics.includes(topic.id) && styles.topicChipActive]}
                                onPress={() => toggleTopic(topic.id)}
                            >
                                <Text style={styles.topicIcon}>{topic.icon}</Text>
                                <Text style={[styles.topicText, selectedTopics.includes(topic.id) && styles.topicTextActive]}>
                                    {topic.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.actionsSection}>
                    <TouchableOpacity
                        style={[styles.createButton, isCreating && styles.buttonDisabled]}
                        onPress={handleCreateRoom}
                        disabled={isCreating || isJoining}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.white} />
                        <Text style={styles.createButtonText}>
                            {isCreating ? 'جاري الإنشاء...' : 'إنشاء غرفة'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.orDivider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.orText}>أو</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.joinContainer}>
                        <TextInput
                            style={styles.roomCodeInput}
                            value={roomCode}
                            onChangeText={setRoomCode}
                            placeholder="رمز الغرفة"
                            placeholderTextColor="rgba(196, 167, 125, 0.5)"
                            autoCapitalize="characters"
                            maxLength={6}
                            textAlign="center"
                        />
                        <TouchableOpacity
                            style={[styles.joinButton, isJoining && styles.buttonDisabled]}
                            onPress={handleJoinRoom}
                            disabled={isCreating || isJoining}
                        >
                            <Text style={styles.joinButtonText}>
                                {isJoining ? 'جاري...' : 'انضمام'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={{ height: spacing.xxl }} />
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
    scrollView: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    section: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.woodDark,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        color: colors.white,
        fontSize: 16,
    },
    gameModeContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    gameModeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
        gap: spacing.xs,
    },
    gameModeButtonActive: {
        backgroundColor: colors.primary,
    },
    gameModeText: {
        color: colors.sand,
        fontSize: 14,
    },
    gameModeTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
    settingRow: {
        marginBottom: spacing.md,
    },
    settingLabel: {
        fontSize: 14,
        color: colors.sand,
        textAlign: 'right',
        marginBottom: spacing.xs,
    },
    settingButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.xs,
    },
    settingButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
    },
    settingButtonActive: {
        backgroundColor: colors.primary,
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
        gap: spacing.xs,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.woodDark,
        gap: 4,
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
    },
    typeButtonText: {
        color: colors.sand,
        fontSize: 12,
    },
    typeButtonTextActive: {
        color: colors.white,
    },
    topicsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    topicChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.woodDark,
        gap: 4,
    },
    topicChipActive: {
        backgroundColor: colors.primary,
    },
    topicIcon: {
        fontSize: 14,
    },
    topicText: {
        color: colors.sand,
        fontSize: 12,
    },
    topicTextActive: {
        color: colors.white,
    },
    actionsSection: {
        marginBottom: spacing.lg,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        ...shadows.md,
    },
    createButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    orDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    orText: {
        color: colors.sand,
        paddingHorizontal: spacing.md,
    },
    joinContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    roomCodeInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    joinButton: {
        backgroundColor: colors.success,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
    },
    joinButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
