import OpenAI from "openai";

import profileContext from "../../../data/profile_context";
import contextMap from "../../../data/contextMap";

import projects from "../../../data/projects.json";
import behavioral from "../../../data/behavioral.json";
import starStories from "../../../data/star_stories.json";

function extractJsonPayload(content: string) {
  if (!content) return null;

  const trimmed = content.trim();
  if (!trimmed) return null;

  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const jsonCandidate = start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;

  try {
    return JSON.parse(jsonCandidate);
  } catch {
    return null;
  }
}

function normalizeAnswerPayload(payload: any) {
  if (!payload || typeof payload !== "object") {
    return {
      suggestedAnswer: "",
      whyItWorks: [],
      keyPoints: [],
      interviewTip: "",
    };
  }

  return {
    suggestedAnswer: typeof payload.suggestedAnswer === "string" ? payload.suggestedAnswer : "",
    whyItWorks: Array.isArray(payload.whyItWorks)
      ? payload.whyItWorks.filter((item: unknown): item is string => typeof item === "string")
      : [],
    keyPoints: Array.isArray(payload.keyPoints)
      ? payload.keyPoints.filter((item: unknown): item is string => typeof item === "string")
      : [],
    interviewTip: typeof payload.interviewTip === "string" ? payload.interviewTip : "",
  };
}

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
    if (
      userMessage.includes("fitrofy") ||
      userMessage.includes("healthtech") ||
      userMessage.includes("partnership") ||
      userMessage.includes("white label")
    ) {
      dynamicContext = `
Use realistic healthcare/SaaS partnership examples.
Focus on partnerships, integrations, white-label opportunities,
business discussions, requirement gathering and interactions
with stakeholders at various levels.
`;
    } else if (userMessage.includes("stakeholder")) {
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
    const projectKnowledge = projects.filter((project: any) => {
      const combinedText = `
        ${project.projectName}
        ${project.summary}
        ${project.objective}
        ${project.challenge}
        ${project.outcome}
        ${project.skills?.join(" ")}
        ${project.keywords?.join(" ")}
      `.toLowerCase();

      return (
        combinedText.includes(userMessage) ||
        project.keywords?.some((keyword: string) =>
          userMessage.includes(keyword.toLowerCase())
        )
      );
    });

    const qaKnowledge = [...behavioral, ...starStories].filter(
      (item: any) => {
        const combinedText = JSON.stringify(item).toLowerCase();

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
          `Question: ${item.question || item.scenario}
Answer: ${item.answer || item.result || item.action}`
      )
      .join("\n\n");

    knowledgeContext = `
${projectContext}

${qaContext}
`;

    const completion =
      await openai.chat.completions.create({
        model: "google/gemma-4-31b-it:free",

        messages: [
          {
            role: "system",
            content: `
You are an experienced Business Analyst interview coach.

Your role is to provide realistic sample interview answers that help candidates practice and improve their BA interview skills.

The response MUST be valid JSON with this exact structure:
{
  "suggestedAnswer": "A realistic, conversational interview answer (150-250 words, as if spoken in 90-120 seconds)",
  "whyItWorks": ["Reason 1", "Reason 2", "Reason 3"],
  "keyPoints": ["Keyword 1", "Keyword 2", "Keyword 3"],
  "interviewTip": "One practical coaching tip (max 2 sentences)"
}

Rules for the Suggested Answer:
- Write as a realistic Business Analyst candidate would answer in an interview.
- 150-250 words, conversational, natural, interview-ready.
- Sounds like something spoken in 90-120 seconds.
- Use STAR naturally when appropriate.
- Start with phrases like: "One project that comes to mind...", "One example from my experience...", "In one implementation project..."
- DO NOT begin with framework explanations.
- DO NOT give lectures.
- DO NOT say "I worked...", "My project..." unless the question explicitly asks about personal experience.
- Focus on answering the question, not teaching.

Rules for Why It Works:
- 4-6 concise bullet points explaining why this answer is effective.
- Example: "Starts with context", "Demonstrates stakeholder alignment", "Shows measurable impact"

Rules for Key Points:
- 4-8 keywords/phrases that should appear in a strong answer.
- Examples: "Requirement Gathering", "Stakeholder Management", "User Stories", "Trade-offs"

Rules for Interview Tip:
- One practical coaching tip.
- Maximum two sentences.
- Example: "If you don't have an identical example, use a similar project and focus on your decision-making process."

Knowledge Base References:

${knowledgeContext}

Purpose of the knowledge base:

The knowledge base exists ONLY to help you understand how experienced Business Analysts structure strong interview answers.

Do NOT reuse the specific projects, company names, domains, stakeholders, or implementations found in the knowledge base unless the interview question explicitly asks about Sarthak.

Important Rules:

* Never answer as Sarthak.
* Never write in first person ("I worked...", "One project that comes to mind...").
* Never reuse Tax Officer Management Platform, Infosys, Fitrofy, or any project from the knowledge base as the sample answer.
* Treat the knowledge base as writing style guidance, not factual content.
* Produce a generic Business Analyst sample answer that any experienced BA could adapt.
* Use common BA scenarios such as CRM implementation, workflow automation, claims processing, customer onboarding, ERP rollout, or approval workflow improvements.
* Encourage the candidate to replace the generic example with one from their own experience.
* Focus on interview technique rather than personal experience.

Additional Context:

${dynamicContext}


RESPOND ONLY WITH VALID JSON. NO OTHER TEXT.`,
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });

    const responseContent = completion.choices[0].message.content || "{}";
    const parsedResponse = extractJsonPayload(responseContent);

    if (parsedResponse) {
      return Response.json(normalizeAnswerPayload(parsedResponse));
    }

    console.error("Failed to parse response JSON:", responseContent);
    return Response.json({
      suggestedAnswer: "I couldn’t generate a structured answer right now. Please try again.",
      whyItWorks: [],
      keyPoints: [],
      interviewTip: "",
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
