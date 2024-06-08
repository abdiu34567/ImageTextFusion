import sharp from 'sharp';
import axios from 'axios';
import textToImage from 'text-to-image';

export const fetchImage = async (url) => {
    const response = await axios({
        url,
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data, 'binary');
}

async function embedTextOnImage() {
    // const imageUrl = 'YOUR_IMAGE_URL'; // Replace with your image URL
    const text = 'Your text here';

    try {
        // const imageData = await fetch
        const textImage = await textToImage.generate(text, {
            debug: true,
            maxWidth: 800,
            fontSize: 48,
            fontFamily: 'Arial',
            lineHeight: 48,
            margin: 40,
            bgColor: 'white',
            textColor: 'black'
        });

        // const imageUrl = 
        const imageBuffer = await fetchImage(imageUrl);
        const image = sharp(imageBuffer);
        const textBuffer = Buffer.from(textImage.split(",")[1], 'base64');

        const { width, height } = await image.metadata();

        await image
            .composite([
                {
                    input: textBuffer,
                    top: height / 2,  // Adjust text position as needed
                    left: width / 4  // Adjust text position as needed
                }
            ])
            .toFile('output.jpg');  // Output image file

        console.log('Image created successfully!');
    } catch (error) {
        console.error('Error processing the image:', error);
    }
}

// embedTextOnImage();
