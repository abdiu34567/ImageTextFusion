const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const textToImage = require('text-to-image');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function fetchImage(url) {
    const response = await axios({
        url,
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}

app.post('/embed-text', async (req, res) => {
    const { imageUrl, text } = req.body;
    try {
        console.log('Fetching image from URL:', imageUrl);
        const imageBuffer = await fetchImage(imageUrl);
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        console.log('Image metadata:', metadata);

        // Calculate dynamic dimensions and font size
        const maxWidth = metadata.width * 0.8;  // Text image width should be 80% of base image width
        const fontSize = Math.min(Math.round(metadata.width / 10), 48);  // Font size proportional to image width

        // Generate the text image with transparent background and shadow
        console.log('Generating text image...');
        const textImage = await textToImage.generate(text, {
            debug: false,
            maxWidth: maxWidth,
            fontSize: fontSize,
            fontWeight: "bold",
            fontFamily: 'Arial',
            lineHeight: fontSize,
            // margin: 20,
            bgColor: 'transparent',
            textColor: '#FFFFFF',  // Using white text
            shadowColor: '#000000',  // Adding black shadow
            shadowBlur: 5,  // Shadow blur radius
            shadowOffsetX: 2,  // Horizontal shadow offset
            shadowOffsetY: 2   // Vertical shadow offset
        });

        const textBuffer = Buffer.from(textImage.split(",")[1], 'base64');
        console.log('Text image generated successfully.');

        // Get the dimensions of the text image
        const textMetadata = await sharp(textBuffer).metadata();
        console.log('Text image metadata:', textMetadata);

        // Calculate position to place text at the bottom
        const top = metadata.height - textMetadata.height - 10;  // Adjust to place at the bottom with some margin
        const left = Math.round((metadata.width - textMetadata.width) / 2);  // Center the text horizontally

        // Composite the text image onto the original image
        console.log('Compositing text image onto the original image...');
        const output = await image
            .composite([
                {
                    input: textBuffer,
                    top: top,  // Position at the bottom
                    left: left  // Center horizontally
                }
            ])
            .toBuffer();
        console.log('Image composited successfully.');

        // Set appropriate headers and send the image buffer as a response
        res.set('Content-Type', 'image/jpeg');
        res.send(output);
        console.log('Response sent successfully.');
    } catch (error) {
        console.error('Failed to process image:', error);
        res.status(500).send('Failed to process image');
    }
});

app.listen(port, () => {
    console.log(`TextEmbedder API listening at http://localhost:${port}`);
});
