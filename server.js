// server.js
import express from "express";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// GPT 연결 테스트용 라우트
app.get("/", (req, res) => res.send("Server is running."));

app.post("/skill/fortune", async (req, res) => {
  try {
    // 카카오에서 온 사용자 메시지
    const userMsg = req.body?.userRequest?.utterance || " ";
    console.log("👉 User message:", userMsg);

    // GPT로 보낼 프롬프트
    const messages = [
      {
        role: "system",
        content:
          "너는 대한민국 최고의 명리학 전문가이자 따뜻한 심리 상담가이다. " +
          "사주, 오행, 십신, 대운, 세운을 통합적으로 해석하되, 단정적인 예언은 피하고 실생활 조언 중심으로 답한다.",
      },
      { role: "user", content: userMsg },
    ];

    // 🔹 GPT 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 또는 gpt-4o
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      "사주 해석 중 오류가 발생했습니다.";

    console.log("🪄 GPT response:", answer);

    // 🔹 카카오톡 응답 형식으로 반환
    return res.json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: answer } }],
        quickReplies: [
          { label: "추가 질문", action: "message", messageText: "추가 질문" },
          { label: "처음으로", action: "message", messageText: "처음으로" },
        ],
      },
    });
  } catch (e) {
    console.error("❌ Error:", e);
    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "서버가 잠시 불안정합니다. 잠시 후 다시 시도해주세요.",
            },
          },
        ],
      },
    });
  }
});

app.listen(3000, () => console.log("✅ Skill server running on port 3000"));
