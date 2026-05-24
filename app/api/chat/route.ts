import OpenAI from "openai";
import profileContext from "../../../data/profile_context";
import contextMap from "../../../data/contextMap";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message.toLowerCase();

let dynamicContext = "";

if (userMessage.includes("stakeholder")) {
  dynamicContext = contextMap.stakeholder;
} else if (userMessage.includes("agile")) {
  dynamicContext = contextMap.agile;
} else if (
  userMessage.includes("kpi") ||
  userMessage.includes("metrics")
) {
  dynamicContext = contextMap.kpi;
} else if (
  userMessage.includes("product")
) {
  dynamicContext = contextMap.product;
} else if (
  userMessage.includes("implementation")
) {
  dynamicContext = contextMap.implementation;
}

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "system",
          content: `
${profileContext}

Additional Context:
${dynamicContext}
`
        },
        {
          role: "user",
          content: body.message,
        },
      ],
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}