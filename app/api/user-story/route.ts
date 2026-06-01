import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const completion =
      await openai.chat.completions.create({
        model: "openai/gpt-oss-120b:free",

        messages: [
          {
            role: "system",
            content: `
You are an experienced Business Analyst.

Generate the following sections. Keep each section concise.

1) User Story — one short sentence.
2) Acceptance Criteria — numbered list, MAX 5 concise bullets (each ≤ ~12 words).
3) Edge Cases — numbered list, MAX 5 concise bullets.
4) Priority — a single word (Low / Medium / High) or short phrase.

Return plain text with clear numbered sections and short bullets only.
`,
          },
          {
            role: "user",
            content: body.feature,
          },
        ],
      });

    return Response.json({
      story: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}