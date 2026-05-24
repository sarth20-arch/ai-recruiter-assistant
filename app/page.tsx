"use client";

import { useState } from "react";
import recruiterQA from "../data/recruiter_qa.json";
import kpiCards from "../data/kpi_cards.json";
import experience from "../data/experience.json";
import projects from "../data/projects.json";
import behavioral from "../data/behavioral.json";
import kpis from "../data/kpis.json";
import starStories from "../data/star_stories.json";
import recruiterQuestions from "../data/recruiter_questions.json";

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
const [aiResponse, setAiResponse] = useState("");
const [loading, setLoading] = useState(false);

  const recruiterModes = [
    "All",
    "Behavioral",
    "Product Thinking",
    "Agile",
    "Implementation",
    "Stakeholder Management",
  ];

  const filteredQuestions = recruiterQA.filter((item: any) => {
    const matchesMode =
      selectedMode === "All" ||
      item.category === selectedMode;

    const matchesSearch =
      item.question
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.answer
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesMode && matchesSearch;
  });
const askAI = async () => {
  if (!userQuestion) return;

  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userQuestion,
      }),
    });

    const data = await response.json();

    setAiResponse(data.reply);
  } catch (error) {
    console.error(error);
    setAiResponse("Something went wrong.");
  }

  setLoading(false);
};
  const toggleAnswer = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-800 p-6 hidden md:block">
        <h1 className="text-3xl font-bold mb-6">
          Sarthak Srivastava
        </h1>

        <div className="space-y-6">

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Role
            </h2>
            <p className="text-gray-400">
              Business Analyst → Product Management
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Experience
            </h2>
            <p className="text-gray-400">
              3+ Years
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Domains
            </h2>
            <ul className="text-gray-400 space-y-1">
              <li>SaaS</li>
              <li>HealthTech</li>
              <li>Tax Platforms</li>
              <li>AI Products</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Skills
            </h2>
            <ul className="text-gray-400 space-y-1">
              <li>Agile</li>
              <li>Stakeholder Management</li>
              <li>KPI Tracking</li>
              <li>Requirement Gathering</li>
              <li>Product Thinking</li>
            </ul>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
  {kpiCards.map((card) => (
    <div
      key={card.id}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
    >
      <p className="text-sm text-gray-400 mb-2">
        {card.title}
      </p>

      <h2 className="text-3xl font-bold mb-3">
        {card.value}
      </h2>

      <p className="text-gray-300 text-sm">
        {card.insight}
      </p>
    </div>
  ))}
</div>

        <h1 className="text-5xl font-bold mb-10">
          AI Recruiter Assistant
        </h1>

        <input
          type="text"
          placeholder="Search recruiter questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 mb-8 rounded-xl bg-gray-900 border border-gray-700 text-white"
        />
        <div className="mb-10 space-y-4">
  <textarea
    placeholder="Ask AI recruiter assistant anything..."
    value={userQuestion}
    onChange={(e) => setUserQuestion(e.target.value)}
    className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white min-h-[120px]"
  />

  <button
    onClick={askAI}
    className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
  >
    {loading ? "Thinking..." : "Ask AI"}
  </button>

  {aiResponse && (
    <div className="border border-gray-700 rounded-xl p-5 bg-gray-900">
      <h2 className="text-lg font-semibold mb-3">
  Sarthak's Response
</h2>

      <p className="text-gray-300 whitespace-pre-line">
        {aiResponse}
      </p>
    </div>
  )}
</div>

        <div className="flex gap-4 mb-10 flex-wrap">
          {recruiterModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-4 py-2 rounded-lg border ${
                selectedMode === mode
                  ? "bg-white text-black"
                  : "border-gray-700 text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredQuestions.map((item: any) => (
            <div
              key={item.id}
              className="border border-gray-700 p-5 rounded-xl cursor-pointer hover:border-white transition"
              onClick={() => toggleAnswer(item.id)}
            >
              <p className="text-sm text-gray-400 mb-2">
                {item.category}
              </p>

              <h2 className="text-xl font-semibold mb-2">
                {item.question}
              </h2>

              {selectedId === item.id && (
                <p className="text-gray-300 mt-4">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}