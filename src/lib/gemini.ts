import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateContent(prompt: string, context?: string) {
  const modelsToTry = ["gemini-1.5-flash"];

  let fullPrompt = prompt;
  if (context) {
    fullPrompt = `Context: ${context}\n\nQuestion/Prompt: ${prompt}`;
  }

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models failed, throw an error with the last error message
  throw new Error("All AI models failed. Last error: " + (lastError?.message || "Unknown error"));
}

