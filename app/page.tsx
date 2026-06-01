  "use client";

  import { useState } from "react";
  import recruiterQA from "../data/recruiter_qa.json";
  import Image from "next/image";

  export default function Home() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedMode, setSelectedMode] = useState("All");
    const [userQuestion, setUserQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState(
    "Recruiter Assistant"
  );

  const [featureIdea, setFeatureIdea] = useState("");
  const [storyOutput, setStoryOutput] = useState("");
  const [storyLoading, setStoryLoading] = useState(false);

    const recruiterModes = [
      "All",
      "Behavioral",
      "Product Thinking",
      "Agile",
      "Implementation",
      "Stakeholder Management",
    ];

    const filteredQuestions = recruiterQA.filter((item: any) => {
      return (
        selectedMode === "All" ||
        item.category === selectedMode
      );
    });

    const askAI = async () => {
      if (!userQuestion.trim()) return;

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
    const generateUserStory = async () => {
    if (!featureIdea.trim()) return;

    setStoryLoading(true);

    try {
      const response = await fetch("/api/user-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feature: featureIdea,
        }),
      });

      const data = await response.json();

      setStoryOutput(data.story);
    } catch (error) {
      console.error(error);

      setStoryOutput(
        "Unable to generate user story."
      );
    }

    setStoryLoading(false);
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
          <div className="flex items-center gap-4 mb-6">
  <Image
    src="/logo.png"
    alt="AI Business Analyst"
    width={80}
    height={80}
  />

  <div>
    <h1 className="text-4xl font-bold">
      AI Recruiter Assistant
    </h1>

    <p className="text-gray-400">
      AI-powered Interview & BA Toolkit
    </p>
  </div>
</div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Role
              </h2>
              <p className="text-gray-400">
                Business Analyst , Product Management
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
                <li>Requirement Gathering</li>
                <li>Product Thinking</li>
                <li>Implementation</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-10">
          <h1 className="text-5xl font-bold mb-10">
            Ask Sarthak
          </h1>
          <div className="flex gap-4 mb-8">
    <button
      onClick={() =>
        setActiveSection("Recruiter Assistant")
      }
      className={`px-4 py-2 rounded-lg ${
        activeSection === "Recruiter Assistant"
          ? "bg-white text-black"
          : "bg-gray-900"
      }`}
    >
      Recruiter Assistant
    </button>

    <button
      onClick={() =>
        setActiveSection("BA Toolkit")
      }
      className={`px-4 py-2 rounded-lg ${
        activeSection === "BA Toolkit"
          ? "bg-white text-black"
          : "bg-gray-900"
      }`}
    >
      BA Toolkit
    </button>
  </div>

          {activeSection === "Recruiter Assistant" && (
  <>
    {/* AI Chat */}
    <div className="mb-10 space-y-4">
      <textarea
        placeholder="Ask Sarthak anything..."
        value={userQuestion}
        onChange={(e) => setUserQuestion(e.target.value)}
        className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white min-h-[120px]"
      />

      <button
        onClick={askAI}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
      >
        {loading ? "Thinking..." : "Ask Sarthak"}
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

    {/* Recruiter Modes */}
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

    {/* Question Cards */}
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
  </>
)}
{activeSection === "BA Toolkit" && (
  <div className="space-y-6">

    <h2 className="text-3xl font-bold">
      AI User Story Generator
    </h2>

    <p className="text-gray-400">
      Describe a feature and generate user stories,
      acceptance criteria and edge cases.
    </p>

    <textarea
      value={featureIdea}
      onChange={(e) =>
        setFeatureIdea(e.target.value)
      }
      placeholder="Example: Users should login using OTP verification"
      className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 min-h-[120px]"
    />

    <button
      onClick={generateUserStory}
      className="bg-white text-black px-6 py-3 rounded-xl"
    >
      {storyLoading
        ? "Generating..."
        : "Generate User Story"}
    </button>

    {storyOutput && (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <pre className="whitespace-pre-wrap">
          {storyOutput}
        </pre>
      </div>
    )}
  </div>
)}
      </section>
    </main>
  );
}