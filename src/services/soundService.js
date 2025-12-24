class SoundService {
    constructor() {
        this.sounds = {};
        this.loaded = false;
    }

    loadSounds() {
        if (this.loaded) return;

        try {
            this.sounds.correct = new Audio('/sounds/correct.mp3');
            this.sounds.incorrect = new Audio('/sounds/incorrect.mp3');

            // Preload
            this.sounds.correct.load();
            this.sounds.incorrect.load();

            this.loaded = true;
        } catch (error) {
            console.error('Failed to load sounds:', error);
        }
    }

    playCorrect() {
        if (!this.sounds.correct) return;
        this.sounds.correct.currentTime = 0;
        this.sounds.correct.play().catch(e => console.log('Audio play failed:', e));
    }

    playIncorrect() {
        if (!this.sounds.incorrect) return;
        this.sounds.incorrect.currentTime = 0;
        this.sounds.incorrect.play().catch(e => console.log('Audio play failed:', e));
    }
}

export default new SoundService();
