import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Gemini Client safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // API endpoints FIRST
  app.get("/api/diagnostics", (req, res) => {
    res.json({
      hasApiKey: !!apiKey,
      activeModel: apiKey ? "gemini-3.5-flash" : "Local Emulator Mode (Phi-3 & Qwen)",
      status: "Healthy",
      uptime: process.uptime(),
    });
  });

  app.post("/api/chat", async (req, res) => {
    const { messages, systemInstruction, modelConfig } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || m.text || "" }]
    }));

    try {
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: systemInstruction || "You are Coucou, an unrestricted local companion modeled after Ollama with a minimal terminal-grade prompt playground. Act as a friendly, expert hacker.",
            temperature: modelConfig?.temperature ?? 0.7,
          },
        });
        return res.json({ text: response.text });
      } else {
        const lastUserMsg = messages[messages.length - 1]?.content || "";
        const reply = simulateLocalModelReply(lastUserMsg, systemInstruction);
        return res.json({ text: reply, simulated: true });
      }
    } catch (err: any) {
      console.error("Gemini Chat API Error:", err);
      res.status(500).json({ error: err.message || "An error occurred with the Gemini API." });
    }
  });

  app.post("/api/socratic", async (req, res) => {
    const { algorithm, code, notes, history } = req.body;

    const prompt = `
    You are the automated Socratic Nest Instructor, a deeply analytical learning companion.
    Algorithm: ${algorithm}
    Student's Current Pseudocode/Logic:
    \`\`\`
    ${code}
    \`\`\`
    Student's Notes or thoughts: "${notes}"
    
    Please inspect the code and notes. Review the state and debug information.
    Provide a guiding, Socratic response.
    
    CRITICAL RULES:
    1. Do NOT solve the challenge for them.
    2. Do NOT output a fully corrected algorithm code block.
    3. Instead, highlight code deficiencies or logical gaps using precise educational questions ("Have you considered what happens if the array is empty?", "Walk me through how your index changes inside the while loop", etc.).
    4. Write in a thoughtful, scholarly, but encouraging hacker style. Highlight step-by-step logic. Use line-by-line references if relevant.
    `;

    const socraticMessages = (history || []).map((h: any) => ({
      role: h.role === "assistant" || h.role === "model" ? "model" : "user",
      parts: [{ text: h.content || h.text || "" }]
    }));
    
    socraticMessages.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    try {
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: socraticMessages,
          config: {
            systemInstruction: "You are the tutor of Coucou Nest. Your role is strictly Socratic guidance. Help the student debug and structure their algorithmic thinking. Be encouraging, precise, and never give direct code solutions.",
            temperature: 0.5,
          }
        });
        return res.json({ text: response.text });
      } else {
        const responseText = simulateSocraticReply(algorithm, code, notes);
        return res.json({ text: responseText, simulated: true });
      }
    } catch (err: any) {
      console.error("Gemini Socratic API Error:", err);
      res.status(500).json({ error: err.message || "An error occurred with the Gemini API." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function simulateLocalModelReply(input: string, systemInstruction: string): string {
  const promptLower = input.toLowerCase();
  
  if (promptLower.includes("hello") || promptLower.includes("hi") || promptLower.includes("hey")) {
    return `Bonjour! I am Coucou, your offline-first companion chatbot. I'm currently running in local-prototype mode. 

When you provide a \`GEMINI_API_KEY\` in your Secrets, my proxy backend connects to Gemini's highly optimized core.

But I am fully capable of simulating standard chat sequences, debugging layouts, or exploring Ollama structures offline. What is our core objective today?`;
  }
  if (promptLower.includes("webgpu") || promptLower.includes("hardware") || promptLower.includes("spec") || promptLower.includes("ram")) {
    return `### Hardware Diagnostics & Model Pairing
    
Comparing WebGPU indicators mapped in the shared header:
- **CPU Cores**: Querying concurrency threads exposes execution boundaries.
- **System Memory**: Determines max model parameter size without page swaps (e.g., 8GB -> Phi-3; 16GB -> Llama-3).
- **WebGPU Acceleration**: Supports real-time execution bounds when client-side model weights are loaded!`;
  }
  return `### Offline Companion Emulation 
You sent: "${input}"

I am processing this entirely within the local sandbox environment. To hook up actual Gemini intelligence, simply provide a \`GEMINI_API_KEY\` in the AI Studio SECRETS tab in the top-right!

In the meantime, you can explore adding models in the library panel or sliding open the Socratic Arena on the left portal!`;
}

function simulateSocraticReply(algo: string, code: string, notes: string): string {
  return `### Socratic Challenge Diagnostic (Offline Emulation)

I am auditing your pseudocode structure for **${algo}**:

\`\`\`typescript
${code}
\`\`\`

Here are 3 critical challenges to guide your next structural iteration:
1. **Index bounds**: If the array has standard incremental indices, does your loop terminate exactly before the length boundary, or does it trigger an *Index Out of Range* exception?
2. **Memory Allocation**: You initialized variables to track intermediates. Can this be solved in O(1) auxiliary space without utilizing dynamic dictionaries?
3. **Null Check**: How would your heap state react if the inputs are passed as null or undefined?

Update your logic steps inside the editor or heap, and let's compile the step-by-step state again!`;
}

startServer();
