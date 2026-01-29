import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { filters, count = 2 } = req.body;

      const subjectText =
        filters.subject === "Mix"
          ? filters.exam === "JEE"
            ? "Physics, Chemistry, or Maths"
            : "Physics, Chemistry, or Biology"
          : filters.subject;

      const prompt = `You are an expert exam setter for ${filters.exam} (India).
Generate ${count} distinct multiple choice questions.
Subject: ${subjectText}.
Difficulty Level: ${filters.difficulty}/5.
Language: ${filters.language}.

Requirements:
1. Questions must be conceptual or numerical, appropriate for ${filters.exam} exam preparation.
2. Return ONLY a raw JSON array, no markdown code blocks.
3. Format: [{ "text": "Question String", "options": ["A", "B", "C", "D"], "correctIndex": 0-3 (number), "solution": "Detailed explanation", "subject": "Physics|Chemistry|Maths|Biology" }]
4. Ensure exactly one option is correct.
5. Make questions challenging but fair for the difficulty level.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      
      try {
        const questions = JSON.parse(text);
        res.json({ questions });
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        res.status(500).json({ error: "Failed to parse AI response" });
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const { question, userMessage, history } = req.body;

      const contextPrompt = `You are a helpful, encouraging AI tutor for ${question.subject} helping a student preparing for competitive exams.

Context about the current question:
- Question: "${question.text}"
- Correct Answer: "${question.correctAnswer}"
- Solution: "${question.solution}"

Student's question: "${userMessage}"

Instructions:
1. Answer the student's doubt clearly and concisely.
2. Be encouraging and supportive.
3. Keep your response brief (2-4 sentences) unless the student asks for more details.
4. Use simple language and relate concepts to what they already know.
5. If relevant, provide additional tips or related concepts.`;

      const messages = (history || []).map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content }],
      }));

      messages.push({
        role: "user",
        parts: [{ text: contextPrompt }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
      });

      const responseText = response.text || "I couldn't generate a response. Please try again.";
      res.json({ response: responseText });
    } catch (error) {
      console.error("Error in tutor chat:", error);
      res.status(500).json({ error: "Failed to get response from AI tutor" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
