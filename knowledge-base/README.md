# Knowledge Base

The AI Recruiter Assistant uses a structured knowledge repository to generate contextual and grounded responses instead of relying solely on generic LLM outputs.

## Purpose

This knowledge base acts as the system's source of truth and contains curated information about:

- Professional Experience
- Projects
- KPI Knowledge
- Behavioral Scenarios
- STAR Stories
- Recruiter Questions
- Business Analysis Concepts

---

## Knowledge Assets

### projects.json

Contains project information including:

- Objectives
- Challenges
- Actions
- Outcomes
- Skills Used

Current Projects:
- Tax Officer Management Platform
- HealthTech Partnership Initiative
- AI Recruiter Assistant

---

### experience.json

Contains professional experience, responsibilities, and implementation examples.

---

### recruiter_questions.json

Contains recruiter-focused interview questions and curated responses.

Examples:

- Tell me about yourself
- Why Product Management?
- Why should we hire you?
- What are your strengths?

---

### star_stories.json

Contains STAR-format examples covering:

- Requirement ambiguity
- Stakeholder management
- Agile improvements
- Delivery challenges

---

### behavioral.json

Contains situational and behavioral interview scenarios.

---

### kpis.json

Contains KPI examples including:

- Activation Rate
- Retention Rate
- Feature Adoption
- Sprint Velocity
- Stakeholder Alignment

---

## How It Works

User Question

↓

Context Selection

↓

Relevant Knowledge Retrieval

↓

Prompt Construction

↓

LLM Processing

↓

Grounded Response

---

## Why This Matters

The assistant does not rely solely on generic AI responses.

Instead, responses are grounded using structured datasets that represent real projects, experiences, KPIs, and interview scenarios.
