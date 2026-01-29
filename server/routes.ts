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

CRITICAL FORMATTING RULES:
1. DO NOT use LaTeX syntax (no \\frac, \\sum, \\int, \\left, \\right, etc.)
2. Write mathematical expressions in plain readable text:
   - Instead of "\\frac{a}{b}" write "(a/b)" or "a divided by b"
   - Instead of "\\sum_{i=1}^{n}" write "sum from i=1 to n"
   - Instead of "\\sqrt{x}" write "sqrt(x)" or "square root of x"
   - Instead of "x^2" write "x^2" or "x squared"
   - Instead of Greek letters like "\\omega" write "omega" or "w"
3. Use simple notation: ^2 for squared, ^3 for cubed
4. Write fractions as (numerator)/(denominator)

Requirements:
1. Questions must be conceptual or numerical, appropriate for ${filters.exam} exam preparation.
2. Return ONLY a raw JSON array, no markdown code blocks.
3. Format: [{ "text": "Question String", "options": ["A", "B", "C", "D"], "correctIndex": 0-3 (number), "solution": "Detailed explanation in plain text", "subject": "Physics|Chemistry|Maths|Biology" }]
4. Ensure exactly one option is correct.
5. Make questions challenging but fair for the difficulty level.
6. All text MUST be human-readable without any special rendering.`;

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

  const httpServer = createServer(app);

  return httpServer;
}
