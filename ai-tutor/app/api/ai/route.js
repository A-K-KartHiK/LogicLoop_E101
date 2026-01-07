import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  console.log("SERVER KEY:", process.env.GROQ_API_KEY ? "LOADED" : "MISSING");

  const { message } = await req.json();

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI learning tutor. Explain concepts clearly and adapt to kids.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = response.choices[0].message.content;
    return Response.json({ reply });
  } catch (err) {
    console.error("Groq Error:", err.message);
    return Response.json({ reply: "⚠️ AI error: " + err.message }, { status: 500 });
  }
}
