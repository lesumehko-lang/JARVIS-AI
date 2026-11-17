
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "ИИ пока не настроен"
      });
    }

    const message = req.body.message;

    if (typeof message !== "string" ||
        !message.trim() ||
        message.length > 4000) {
      return res.status(400).json({
        error: "Проверь сообщение"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction:
          "Ты JARVIS, русскоязычный вежливый ИИ-помощник. Отвечай понятно и кратко."
      }
    });

    res.json({
      reply: response.text || "Не удалось получить ответ."
    });

  } catch (error) {
    console.error("JARVIS error:", error.message);
    res.status(500).json({
      error: "Ошибка ИИ. Попробуй ещё раз."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("JARVIS запущен на порту " + PORT);
});
