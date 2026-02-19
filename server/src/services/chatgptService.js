const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Chat with document using ChatGPT
 * @param {Object} params - Chat parameters
 * @param {string} params.documentAnalysis - The analyzed document data
 * @param {string} params.userMessage - User's question
 * @param {Array} params.conversationHistory - Previous messages
 * @returns {Promise<string>} - AI response
 */
const chatWithDocument = async ({ documentAnalysis, userMessage, conversationHistory = [] }) => {
    try {
        // Build system prompt with document context
        const systemPrompt = `You are an expert legal AI assistant analyzing legal documents. 

Document Analysis Context:
${JSON.stringify(documentAnalysis, null, 2)}

Your role:
- Answer questions about this specific document
- Provide legal insights and explanations
- Identify risks and suggest actions
- Explain clauses in plain English
- Recommend which type of lawyer to consult
- Be concise but thorough
- Use emojis for better readability

Important:
- Base all answers on the provided document analysis
- If asked about something not in the document, say so
- Provide actionable advice
- Highlight risks clearly`;

        // Build messages array
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: userMessage }
        ];

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
            presence_penalty: 0.6,
            frequency_penalty: 0.3
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('ChatGPT API Error:', error);

        // Fallback to mock response if API fails
        if (error.code === 'insufficient_quota' || error.status === 429) {
            throw new Error('ChatGPT API quota exceeded. Please add API credits or use mock mode.');
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured. Please add it to your .env file.');
        }

        throw error;
    }
};

/**
 * Generate document summary using ChatGPT
 * @param {string} documentText - Extracted document text
 * @returns {Promise<Object>} - Document analysis
 */
const analyzeDocument = async (documentText) => {
    try {
        const systemPrompt = `You are an expert legal document analyzer. Analyze the provided legal document and return a JSON response with:
- documentType: Type of document (e.g., "Service Agreement", "Employment Contract")
- legalCategory: Main legal category (e.g., "Contract Law", "Employment Law")
- summary: Brief 2-3 sentence summary
- overallRiskScore: Risk score from 0-100
- keyRisks: Array of main risks
- recommendedLawyers: Array of lawyer types needed with priority

Be thorough but concise.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this legal document:\n\n${documentText.substring(0, 3000)}` }
            ],
            temperature: 0.5,
            max_tokens: 800
        });

        return JSON.parse(completion.choices[0].message.content);

    } catch (error) {
        console.error('Document Analysis Error:', error);
        throw error;
    }
};

module.exports = {
    chatWithDocument,
    analyzeDocument
};
