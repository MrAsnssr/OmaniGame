import { Audio } from 'expo-av';

class SoundService {
    private correctSound: Audio.Sound | null = null;
    private incorrectSound: Audio.Sound | null = null;
    private isLoaded = false;

    async loadSounds() {
        if (this.isLoaded) return;

        try {
            const { sound: correct } = await Audio.Sound.createAsync(
                require('../assets/sounds/correct.mp3')
            );
            const { sound: incorrect } = await Audio.Sound.createAsync(
                require('../assets/sounds/incorrect.mp3')
            );

            this.correctSound = correct;
            this.incorrectSound = incorrect;
            this.isLoaded = true;
        } catch (error) {
            console.log('Error loading sounds:', error);
            // Default to fail silently if sounds (like files) are missing
        }
    }

    async playCorrect() {
        try {
            if (this.correctSound) {
                await this.correctSound.replayAsync();
            }
        } catch (error) {
            console.log('Error playing correct sound:', error);
        }
    }

    async playIncorrect() {
        try {
            if (this.incorrectSound) {
                await this.incorrectSound.replayAsync();
            }
        } catch (error) {
            console.log('Error playing incorrect sound:', error);
        }
    }

    async unloadSounds() {
        if (this.correctSound) {
            await this.correctSound.unloadAsync();
        }
        if (this.incorrectSound) {
            await this.incorrectSound.unloadAsync();
        }
        this.isLoaded = false;
    }
}

export const soundService = new SoundService();
export default soundService;
