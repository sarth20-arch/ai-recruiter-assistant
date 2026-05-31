import OpenAI from "openai";

import profileContext from "../../../data/profile_context";
import contextMap from "../../../data/contextMap";

import projects from "../../../data/projects.json";
import behavioral from "../../../data/behavioral.json";
import starStories from "../../../data/star_stories.json";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userMessage = body.message.toLowerCase();

    let dynamicContext = "";
    let knowledgeContext = "";

    // Dynamic Context Selection

    if (userMessage.includes("stakeholder")) {
      dynamicContext = contextMap.stakeholder;
    } else if (userMessage.includes("agile")) {
      dynamicContext = contextMap.agile;
    } else if (
      userMessage.includes("kpi") ||
      userMessage.includes("metrics")
    ) {
      dynamicContext = contextMap.kpi;
    } else if (userMessage.includes("product")) {
      dynamicContext = contextMap.product;
    } else if (userMessage.includes("implementation")) {
      dynamicContext = contextMap.implementation;
    }

    // Knowledge Retrieval
// Knowledge Retrieval
console.log(projects);
console.log(typeof projects);
console.log(Array.isArray(projects));
const projectKnowledge = projects.filter((project: any) => {
  const combinedText = `
    ${project.projectName}
    ${project.summary}
    ${project.objective}
    ${project.challenge}
    ${project.outcome}
    ${project.skills.join(" ")}
  `.toLowerCase();

  return (
    userMessage.includes("project") ||
    userMessage.includes("challenge") ||
    userMessage.includes("implementation") ||
    userMessage.includes("experience")
  );
});

const qaKnowledge = [...behavioral, ...starStories].filter(
  (item: any) => {
    const combinedText =
      `${item.question} ${item.answer}`.toLowerCase();

    return (
      (userMessage.includes("stakeholder") &&
        combinedText.includes("stakeholder")) ||

      (userMessage.includes("agile") &&
        combinedText.includes("agile")) ||

      (userMessage.includes("requirement") &&
        combinedText.includes("requirement")) ||

      (userMessage.includes("implementation") &&
        combinedText.includes("implementation"))
    );
  }
);

const projectContext = projectKnowledge
  .slice(0, 2)
  .map(
    (project: any) => `
Project: ${project.projectName}

Summary: ${project.summary}

Objective: ${project.objective}

Challenge: ${project.challenge}

Actions:
${project.actions.join(", ")}

Outcome: ${project.outcome}
`
  )
  .join("\n\n");

const qaContext = qaKnowledge
  .slice(0, 3)
  .map(
    (item: any) =>
      `Question: ${item.question}\nAnswer: ${item.answer}`
  )
  .join("\n\n");

knowledgeContext = `
${projectContext}

${qaContext}
`;
 
    const completion =
      await openai.chat.completions.create({
        model: "openai/gpt-oss-120b:free",

        messages: [
          {
            role: "system",
            content: `
${profileContext}

Additional Context:
${dynamicContext}

Relevant Experience (use these examples whenever possible and do not invent a different project if a relevant example exists):
${knowledgeContext}

Important:
- Answer as Sarthak Srivastava.
- Prefer using the provided Relevant Experience examples.
- If a relevant example exists, use it instead of creating a new scenario.
- Do not invent project details that are not present in the provided experience.
- Stay grounded in the supplied examples.
- Use provided experience when relevant.
- Keep answers conversational.
- Avoid generic AI language.
- Keep answers concise unless more detail is requested.
- If an outcome is not explicitly provided in the knowledge base, do not invent one.
- When information is unavailable, state the actions taken rather than creating metrics or results.
`,
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });

    return Response.json({
      reply:
        completion.choices[0].message.content ||
        "No response generated.",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}