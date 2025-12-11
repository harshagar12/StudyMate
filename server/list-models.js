const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('Error listing models:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listModels();
