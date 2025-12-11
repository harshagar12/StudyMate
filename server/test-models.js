const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of potential model names to try
const models = [
    'gemini-1.5-flash', 
    'gemini-1.5-flash-001', 
    'gemini-1.5-flash-002',
    'gemini-1.5-pro', 
    'gemini-1.5-pro-001',
    'gemini-pro'
];

async function test() {
    console.log("Testing models with API key: " + (process.env.GEMINI_API_KEY ? "Present" : "Missing"));
    for (const m of models) {
        console.log(`Testing ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            // Simple prompt to check if model exists and answers
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`SUCCESS: ${m}`);
            // If we find one that works, we can stop or keep listing (let's stop to be fast)
            // But let's check preference: flash > pro
            if (m.includes('flash')) {
                 console.log(`Found working Flash model: ${m}`);
                 process.exit(0);
            }
        } catch (e) {
            console.log(`FAIL ${m}: ${e.message.split('\n')[0]}`);
        }
    }
}

test();
