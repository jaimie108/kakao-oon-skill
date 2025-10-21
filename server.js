// server.js
import express from "express";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(express.json());

// GPT 키 (OpenAI API 키를 환경변수로)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/skill/fortune", async (req, res) => {
  try {
    const userMsg = req.body?.userRequest?.utterance || " ";
    const userId = req.body?.userRequest?.user?.id || "anon";

    // GPT에 보낼 프롬프트
    const messages = [
      { role: "system", content: "너는 대한민국 최고의 명리 전문가이자 따뜻한 상담가이다. 사주, 오행, 주역을 통합적으로 해석하되 단정적인 점괘가 아닌 실생활 중심의 조언을 한다." },
      { role: "user", content: userMsg }
    ];

    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // 또는 gpt-4o
        messages,
        temperature: 0.7
      })
    });

    const data = await gptResponse.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() || "답변을 불러오지 못했습니다.";

    // 카카오톡 응답 포맷 (반드시 이 형식)
    return res.json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: answer } }],
        quickReplies: [
          { label: "추가 질문", action: "message", messageText: "추가 질문" },
          { label: "처음으로", action: "message", messageText: "처음으로" }
        ]
      }
    });
  } catch (e) {
    console.error(e);
    return res.json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: "서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요." } }]
      }
    });
  }
});

app.get("/", (req, res) => res.send("Server is running."));
app.listen(3000, () => console.log("✅ Skill server running on port 3000"));
