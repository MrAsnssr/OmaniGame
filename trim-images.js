const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'src', 'assets');

const imagesToTrim = [
    'شعار.png',
    'خطفة.png',
    'السبلة.png',
    'كبارية.png'
];

async function trimImages() {
    for (const imageName of imagesToTrim) {
        const inputPath = path.join(assetsDir, imageName);
        const outputPath = path.join(assetsDir, imageName);

        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${imageName} - file not found`);
            continue;
        }

        try {
            // Read the image and trim transparent pixels
            const trimmedBuffer = await sharp(inputPath)
                .trim()  // This removes transparent borders
                .toBuffer();

            // Save back to the same file
            await sharp(trimmedBuffer).toFile(outputPath + '.tmp');

            // Replace original with trimmed version
            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath + '.tmp', outputPath);

            console.log(`Trimmed: ${imageName}`);
        } catch (err) {
            console.error(`Error trimming ${imageName}:`, err.message);
        }
    }

    console.log('Done!');
}

trimImages();
