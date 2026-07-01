import { GoogleGenAI } from "@google/genai";
import { MENU_ITEMS } from "../data/menu";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function getAIWaiterResponse(userMessage: string, chatHistory: any[]) {
  if (!ai) {
    return "I'm sorry, but I'm currently unavailable. Please configure your API key to use the AI waiter feature.";
  }

  const systemInstruction = `
    You are Angel, the divine AI waiter at "Angel's Kitchen", a premium restaurant known for its fusion of traditional Indian flavors and modern culinary excellence.
    
    Your Persona:
    - Extremely polite, warm, and sophisticated.
    - Knowledgeable about the menu and ingredients.
    - Proactive in making recommendations (e.g., "If you enjoy spicy food, our Schezwan Fried Rice is a divine choice").
    - Always address the customer with respect (e.g., "Certainly," "Excellent choice," "My pleasure").
    
    Current Menu:
    ${MENU_ITEMS.map(item => `- ${item.name} (₹${item.price}): ${item.description} [Category: ${item.category}]`).join('\n')}
    
    Guidelines:
    - If asked for recommendations, suggest 2-3 items from different categories.
    - If asked about a dish, describe its flavor profile and ingredients.
    - If the customer wants to order, politely guide them: "You can add any of these divine dishes to your cart by clicking the 'Add to Cart' button on the menu card."
    - Keep responses elegant and concise. Use food-related emojis sparingly but effectively (🍲, 🌶️, 🍮).
    - If they ask for something NOT on the menu, politely apologize and suggest the closest alternative we have.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: 'user', parts: [{ text: systemInstruction }] },
      ...chatHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ],
  });

  return response.text;
}
