import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { onAuthChange } from '../services/authService';
import { colors } from '../constants/theme';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
    const initializeFirestore = useGameStore(state => state.initializeFirestore);
    const setCurrentUser = useGameStore(state => state.setCurrentUser);
    const loadUserDirhams = useGameStore(state => state.loadUserDirhams);
    const loadUserPurchases = useGameStore(state => state.loadUserPurchases);
    const loadUserStreak = useGameStore(state => state.loadUserStreak);
    const loadUserAvatarV2 = useGameStore(state => state.loadUserAvatarV2);

    useEffect(() => {
        // Initialize Firestore data
        initializeFirestore();

        // Listen for auth changes
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                setCurrentUser(user.uid, user.displayName);
                await loadUserDirhams(user.uid);
                await loadUserPurchases(user.uid);
                await loadUserStreak(user.uid);
                await loadUserAvatarV2(user.uid);
            } else {
                setCurrentUser(null, null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                <View style={styles.container}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: colors.woodDark },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="categories" />
                        <Stack.Screen name="play" />
                        <Stack.Screen name="result" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="profile" />
                        <Stack.Screen name="settings" />
                        <Stack.Screen name="shop" />
                        <Stack.Screen name="market" />
                        <Stack.Screen name="leaderboard" />
                        <Stack.Screen name="multiplayer" />
                    </Stack>
                </View>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.woodDark,
    },
});
