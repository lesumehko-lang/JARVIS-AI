
import express from "express";

const app = express();

app.use(express.json());
app.use(express.static(process.cwd()));

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Пустое сообщение" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Не настроен GROQ_API_KEY" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Ты играешь выбранного пользователем вымышленного персонажа. Соблюдай его характер, но оставайся дружелюбным и безопасным. Отвечай на русском языке."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(500).json({
        error: data.error?.message || "Ошибка Groq"
      });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("JARVIS запущен на порту " + PORT);
});
