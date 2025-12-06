import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'src', 'assets');
const uploadsDir = 'C:/Users/abdul/.gemini/antigravity/brain/bcd05c00-28fe-443f-ac12-e2cf290b4d47';

const imagesToProcess = [
    { src: 'uploaded_image_1_1765065302929.png', dest: 'خطفة.png' },    // Singleplayer (red)
    { src: 'uploaded_image_0_1765065302929.png', dest: 'السبلة.png' },   // Multiplayer (green)
    { src: 'uploaded_image_2_1765065302929.png', dest: 'كبارية.png' },   // Leaderboard (white)
];

async function processImages() {
    for (const img of imagesToProcess) {
        const inputPath = path.join(uploadsDir, img.src);
        const outputPath = path.join(assetsDir, img.dest);

        try {
            // Trim transparent/white borders
            await sharp(inputPath)
                .trim()
                .png()
                .toFile(outputPath);

            console.log(`Processed: ${img.src} -> ${img.dest}`);
        } catch (err) {
            console.error(`Error processing ${img.src}:`, err.message);
        }
    }

    console.log('Done!');
}

processImages();
