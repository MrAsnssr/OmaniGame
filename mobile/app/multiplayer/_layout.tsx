import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function MultiplayerLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.woodDark },
                animation: 'slide_from_right',
                gestureEnabled: false, // Prevent swiping back during game
            }}
        >
            <Stack.Screen name="index" options={{ gestureEnabled: true }} />
            <Stack.Screen name="waiting" options={{ gestureEnabled: true }} />
            <Stack.Screen name="play" />
            <Stack.Screen name="turn-selection" />
            <Stack.Screen name="leaderboard" />
        </Stack>
    );
}
