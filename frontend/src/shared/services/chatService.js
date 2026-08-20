/**
 * DialectGo — Chat Service
 *
 * Handles AI chat completions via the Groq API.
 */
import { endpoints } from '../api/client';

const GROQ_API_KEY = endpoints.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Sends a user message to Groq and returns the assistant's reply.
 *
 * @param {Array<{role: string, content: string}>} chatHistory - Previous conversation turns
 * @param {string} systemPrompt - The system prompt injected at the start
 * @param {number} [maxTokens=300] - Max response length
 * @returns {Promise<string>} The assistant's reply text
 * @throws {Error} If the Groq API returns an error
 */
export const sendChatMessage = async (chatHistory, systemPrompt, maxTokens = 300) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }

  return data.choices?.[0]?.message?.content?.trim() ?? '';
};
