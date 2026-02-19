# 🤖 ChatGPT API Integration Guide

## ✅ What's Been Added

Your document analyzer chatbot now uses **real ChatGPT API** for intelligent, context-aware responses!

---

## 🎯 Features

### **1. Real AI Responses**
- Powered by OpenAI's GPT-3.5-turbo
- Context-aware answers based on document analysis
- Natural conversation flow
- Maintains conversation history

### **2. Intelligent Fallback**
- Automatically falls back to mock responses if API fails
- No interruption to user experience
- Graceful error handling

### **3. Document Context**
- AI receives full document analysis
- Answers based on actual document content
- Understands lawyer recommendations
- Knows risk levels and clauses

---

## 📋 Setup Instructions

### **Step 1: Get OpenAI API Key**

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-...`)

### **Step 2: Add API Key to .env**

Open `server/.env` and replace:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

### **Step 3: Restart Server**

Stop the server (Ctrl+C) and restart:
```bash
cd server
npm start
```

---

## 🚀 How It Works

### **Architecture:**

```
User Question
     ↓
Frontend (Analyze.jsx)
     ↓
API Call: POST /api/chat/document
     ↓
Backend (chatController.js)
     ↓
ChatGPT Service (chatgptService.js)
     ↓
OpenAI API (GPT-3.5-turbo)
     ↓
AI Response
     ↓
Display to User
```

### **Request Flow:**

1. **User asks question** in chat
2. **Frontend sends** to `/api/chat/document`:
   - Document analysis data
   - User message
   - Conversation history
3. **Backend builds context** with:
   - System prompt (legal expert role)
   - Document analysis details
   - Previous messages
4. **ChatGPT generates** intelligent response
5. **Response returned** to user

---

## 📊 API Endpoint

### **POST /api/chat/document**

**Request Body:**
```json
{
  "documentAnalysis": {
    "summary": "Service Agreement...",
    "documentType": "Service Agreement",
    "overallRiskScore": 45,
    "recommendedLawyers": [...],
    "clauses": [...],
    "recommendations": [...]
  },
  "message": "What are the main risks?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on my analysis, the highest risk clauses...",
    "timestamp": "2026-02-08T18:15:00.000Z"
  }
}
```

---

## 🎨 System Prompt

The AI is instructed to be:

```
You are an expert legal AI assistant analyzing legal documents.

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
- Highlight risks clearly
```

---

## 💬 Example Conversations

### **Example 1: Risk Assessment**

**User:** "What are the main risks in this document?"

**ChatGPT:** "Based on my analysis of your Service Agreement, here are the main risks:

🚨 **High Risk:**
1. **Non-Compete Clause** - The 24-month restriction is excessive and may not be fully enforceable under Indian law. Courts typically favor 12-month restrictions.

⚠️ **Medium Risk:**
2. **Early Termination Penalty** - The 2-month fee penalty creates a significant financial burden if you need to exit early.
3. **Liability Limitation** - Caps your recovery to 12 months of fees, which may be insufficient for high-value services.

**Recommendation:** I strongly suggest consulting a Contract Lawyer (High Priority) to negotiate these terms before signing."

### **Example 2: Lawyer Recommendation**

**User:** "What type of lawyer do I need?"

**ChatGPT:** "Based on this Service Agreement, I recommend consulting:

👨‍⚖️ **Contract Lawyer** (High Priority)
- **Why:** Primary expertise needed for reviewing and negotiating service agreement terms
- **Specializes in:** Contract Review, Negotiation, Drafting
- **Timeline:** Within 2-3 days

👨‍⚖️ **Employment Lawyer** (Medium Priority)
- **Why:** The non-compete and employee restriction clauses require employment law expertise
- **Specializes in:** Non-Compete Agreements, Employment Terms

Start with a Contract Lawyer to review the overall agreement, then consult an Employment Lawyer specifically for the non-compete clause."

### **Example 3: Specific Clause**

**User:** "Is the non-compete clause enforceable?"

**ChatGPT:** "The non-compete clause in your document has enforceability concerns:

⚖️ **Legal Analysis:**
- **Duration:** 24 months is unusually long
- **Indian Law:** Courts typically favor 12-month restrictions
- **Enforceability:** May be challenged as unreasonable in scope or duration

💡 **Suggested Action:**
Negotiate to reduce the duration to 12 months or add a reasonable compensation clause for the restriction period.

🔴 **Risk Level:** High

I recommend having an Employment Lawyer review this specific clause before signing."

---

## 🔧 Configuration

### **ChatGPT Settings:**

```javascript
{
  model: 'gpt-3.5-turbo',      // Fast and cost-effective
  temperature: 0.7,             // Balanced creativity
  max_tokens: 500,              // Concise responses
  presence_penalty: 0.6,        // Encourage new topics
  frequency_penalty: 0.3        // Reduce repetition
}
```

### **Cost Estimation:**

- **Model:** GPT-3.5-turbo
- **Cost:** ~$0.002 per 1K tokens
- **Average chat:** ~300-500 tokens
- **Cost per chat:** ~$0.001 (very cheap!)

---

## 🛡️ Error Handling

### **Scenario 1: API Key Missing**

```javascript
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
}
```

**Result:** Falls back to mock responses + shows toast warning

### **Scenario 2: API Quota Exceeded**

```javascript
if (error.code === 'insufficient_quota') {
    throw new Error('ChatGPT API quota exceeded');
}
```

**Result:** Falls back to mock responses + error message

### **Scenario 3: Network Error**

**Result:** Automatic fallback to mock responses

---

## 📱 Frontend Integration

### **Updated sendChatMessage:**

```javascript
const sendChatMessage = async () => {
    try {
        // Call ChatGPT API
        const response = await api.post('/chat/document', {
            documentAnalysis: result?.analysis,
            message: currentInput,
            conversationHistory: chatMessages
        });

        // Display AI response
        const aiResponse = {
            role: 'assistant',
            content: response.data.data.message,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, aiResponse]);

    } catch (error) {
        // Fallback to mock response
        const fallbackResponse = {
            role: 'assistant',
            content: getAIResponse(currentInput),
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, fallbackResponse]);
        
        // Show warning
        toast.error('ChatGPT API not configured. Using mock responses.');
    }
};
```

---

## 🧪 Testing

### **Test 1: With API Key**

1. Add valid `OPENAI_API_KEY` to `.env`
2. Restart server
3. Upload document
4. Ask: "What are the main risks?"
5. **Expected:** Real ChatGPT response

### **Test 2: Without API Key**

1. Remove or invalidate `OPENAI_API_KEY`
2. Restart server
3. Upload document
4. Ask: "What are the main risks?"
5. **Expected:** Mock response + warning toast

### **Test 3: Conversation History**

1. Ask: "What type of lawyer do I need?"
2. Then ask: "Why do you recommend that?"
3. **Expected:** ChatGPT remembers context

---

## 📊 Files Created/Modified

### **New Files:**
1. `server/src/services/chatgptService.js` - ChatGPT integration
2. `server/src/controllers/chatController.js` - Chat API controller
3. `server/src/routes/chatRoutes.js` - Chat routes

### **Modified Files:**
1. `server/src/server.js` - Added chat routes
2. `server/.env` - Added OPENAI_API_KEY
3. `client/src/pages/Analyze.jsx` - Updated to use API
4. `server/package.json` - Added openai dependency

---

## 🎯 Benefits

### **With ChatGPT API:**
✅ **Intelligent responses** - Context-aware and accurate
✅ **Natural conversation** - Understands follow-up questions
✅ **Document-specific** - Answers based on actual content
✅ **Professional** - Legal expert tone
✅ **Detailed** - Comprehensive explanations

### **Fallback Mode:**
✅ **Always works** - No downtime
✅ **Pattern matching** - Covers common questions
✅ **Instant** - No API delays
✅ **Free** - No API costs

---

## 💰 Cost Management

### **Tips to Reduce Costs:**

1. **Use GPT-3.5-turbo** (not GPT-4)
   - 10x cheaper
   - Still very capable

2. **Limit max_tokens** to 500
   - Keeps responses concise
   - Reduces cost

3. **Cache common questions**
   - Store frequent Q&A pairs
   - Serve from cache first

4. **Set usage limits**
   - Monitor API usage
   - Set monthly budget alerts

---

## 🔐 Security

### **Best Practices:**

1. **Never expose API key** in frontend
2. **Use environment variables** for secrets
3. **Add rate limiting** to prevent abuse
4. **Validate inputs** before sending to API
5. **Log API usage** for monitoring

---

## 🚀 Next Steps

### **Optional Enhancements:**

1. **Add Authentication**
   - Require login for chat
   - Track usage per user

2. **Implement Caching**
   - Cache common questions
   - Reduce API calls

3. **Add Streaming**
   - Stream responses word-by-word
   - Better UX for long responses

4. **Upgrade to GPT-4**
   - More accurate responses
   - Better legal reasoning
   - Higher cost

5. **Add Voice Input**
   - Speech-to-text
   - Voice questions

---

## 📋 Summary

**Your chatbot now:**

✅ Uses **real ChatGPT API** for intelligent responses
✅ Provides **context-aware** answers based on document
✅ Recommends **specific lawyer types**
✅ Explains **legal implications**
✅ **Falls back** gracefully if API unavailable
✅ Maintains **conversation history**
✅ Uses **professional legal tone**

**To activate:**
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to `server/.env`: `OPENAI_API_KEY=sk-...`
3. Restart server
4. Start chatting!

**Cost:** ~$0.001 per conversation (very affordable!)

---

## 🎉 Ready to Use!

Upload a document and ask questions to experience the power of ChatGPT-powered legal analysis! 🤖⚖️
