"use client";

import { useMemo, useState } from "react";
import interviewQuestions from "../data/interview_questions.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FollowUp {
  question: string;
  purpose: string;
}

interface Question {
  id: number;
  role: string;
  difficulty: string;
  category: string;
  question: string;
  framework: string;
  expectedDuration: string;
  skillsTested?: string[];
  tip?: string;
  keyPoints?: string[];
  followUps?: FollowUp[];
  commonMistakes?: string[];
}

interface SuggestedAnswer {
  suggestedAnswer: string;
  whyItWorks: string[];
  keyPoints: string[];
  interviewTip: string;
}

type RatingValue = "very_similar" | "some_gaps" | "needs_improvement";

interface RecommendedLink {
  key: string;
  label: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeAnswerPayload(payload: unknown): SuggestedAnswer {
  if (!payload || typeof payload !== "object") {
    return { suggestedAnswer: "", whyItWorks: [], keyPoints: [], interviewTip: "" };
  }
  const p = payload as Record<string, unknown>;
  return {
    suggestedAnswer: typeof p.suggestedAnswer === "string" ? p.suggestedAnswer : "",
    whyItWorks: Array.isArray(p.whyItWorks)
      ? p.whyItWorks.filter((x): x is string => typeof x === "string")
      : [],
    keyPoints: Array.isArray(p.keyPoints)
      ? p.keyPoints.filter((x): x is string => typeof x === "string")
      : [],
    interviewTip: typeof p.interviewTip === "string" ? p.interviewTip : "",
  };
}

function deriveRecommendations(categories: string[]): RecommendedLink[] {
  const cats = categories.map((c) => c.toLowerCase());
  const links: RecommendedLink[] = [];
  if (cats.includes("kpis"))
    links.push({ key: "kpi", label: "KPI Library", href: "/kpi-library" });
  if (cats.some((c) => ["agile", "prioritization", "requirement gathering"].includes(c)))
    links.push({ key: "ba", label: "BA Copilot", href: "/ba-copilot" });
  if (cats.some((c) => ["stakeholder management", "conflict resolution", "introduction"].includes(c)))
    links.push({ key: "sarthak", label: "Ask Sarthak", href: "/ask-sarthak" });
  if (links.length === 0)
    links.push({ key: "ba", label: "BA Copilot", href: "/ba-copilot" });
  return links;
}

const DIFFICULTY_FACTOR: Record<string, number> = { Easy: 0.95, Medium: 1.0, Hard: 1.08 };

const RATING_OPTIONS: { value: RatingValue; label: string }[] = [
  { value: "very_similar", label: "✅ Very Similar" },
  { value: "some_gaps", label: "🟡 Some Gaps" },
  { value: "needs_improvement", label: "🔴 Needs Improvement" },
];

const RATING_NOTES: Record<RatingValue, string> = {
  very_similar: "Great — your answer aligns well. Keep this approach consistent.",
  some_gaps: "Good foundation. Review the suggested answer for points to strengthen.",
  needs_improvement: "No worries — focus on the gaps and practice more.",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SetupScreen({
  role,
  difficulty,
  interviewMode,
  onRoleChange,
  onDifficultyChange,
  onInterviewModeChange,
  onStart,
}: {
  role: string;
  difficulty: string;
  interviewMode: string;
  onRoleChange: (v: string) => void;
  onDifficultyChange: (v: string) => void;
  onInterviewModeChange: (v: string) => void;
  onStart: () => void;
}) {
  return (
    <>
      <div className="form-card">
        <div className="info-card-title">Interview Setup</div>
        <p className="info-card-text">Choose a role, difficulty, and interview mode to begin.</p>

        <div className="form-grid">
          <div className="field-group">
            <label className="field-label" htmlFor="role-select">Interview Role</label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="select-input"
            >
              <option>Business Analyst</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="difficulty-select">Difficulty</label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="select-input"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="mode-select">Interview Mode</label>
            <select
              id="mode-select"
              value={interviewMode}
              onChange={(e) => onInterviewModeChange(e.target.value)}
              className="select-input"
            >
              <option>Recruiter</option>
              <option>Hiring Manager</option>
              <option>Senior Business Analyst</option>
              <option>Product Manager</option>
              <option>Technical BA</option>
            </select>
          </div>
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={onStart}>Start Interview</button>
        </div>
      </div>

      {/* "Why use this?" lives BELOW the action, as supplementary context */}
      <div className="info-card">
        <div className="info-card-title">Why use this simulator?</div>
        <ul className="info-list">
          <li>No prompt engineering required</li>
          <li>BA-focused interview questions</li>
          <li>Structured interview flow</li>
          <li>Answer first, compare later</li>
        </ul>
        <p className="info-card-text">Built so you can focus on interviewing, not prompting AI.</p>
      </div>
    </>
  );
}

function QuestionProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="progress-group">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">{pct}%</span>
    </div>
  );
}

function RatingSelfCheck({
  rating,
  onRate,
}: {
  rating: RatingValue | null;
  onRate: (v: RatingValue) => void;
}) {
  return (
    <div className="tip-card section-spaced">
      <div className="info-card-title">How similar was your answer?</div>
      <div className="rating-group">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRate(opt.value)}
            className={`rating-button${rating === opt.value ? " active" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {rating && <p className="rating-note">{RATING_NOTES[rating]}</p>}
    </div>
  );
}

function SuggestedAnswerPanel({
  answer,
  question,
}: {
  answer: SuggestedAnswer;
  question: Question;
}) {
  return (
    <div className="response-card section-spaced">
      <div className="response-label">💡 Suggested Answer</div>
      <p className="response-text">{answer.suggestedAnswer}</p>

      {question.keyPoints && question.keyPoints.length > 0 && (
        <div className="section-spaced">
          <div className="info-card-title">📌 Key Points to Mention</div>
          <div className="badge-row">
            {question.keyPoints.map((point) => (
              <span key={point} className="badge">{point}</span>
            ))}
          </div>
        </div>
      )}

      {answer.interviewTip && (
        <div className="tip-card section-spaced">
          <div className="info-card-title">💡 Interview Tip</div>
          <p className="info-card-text">{answer.interviewTip}</p>
        </div>
      )}

      {answer.whyItWorks.length > 0 && (
        <div className="tip-card section-spaced">
          <div className="info-card-title">✓ Why This Answer Works</div>
          <ul className="info-list">
            {answer.whyItWorks.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {question.followUps && question.followUps.length > 0 && (
        <div className="section-spaced">
          <div className="info-card-title">🗣️ Possible Follow-up Questions</div>
          <p className="info-card-text">The interviewer may ask:</p>
          <div className="follow-up-grid">
            {question.followUps.map((fu, idx) => (
              <div key={idx} className="follow-up-card">
                <div className="follow-up-question">{fu.question}</div>
                <div className="follow-up-purpose">{fu.purpose}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionScreen({
  questions,
  difficulty,
  interviewMode,
  onRestart,
  onReturnHome,
}: {
  questions: Question[];
  difficulty: string;
  interviewMode: string;
  onRestart: () => void;
  onReturnHome: () => void;
}) {
  const coveredCategories = Array.from(
    new Set(questions.map((q) => q.category).filter(Boolean))
  );
  const totalCategories = Array.from(
    new Set((interviewQuestions as Question[])
      .filter((q) => q.difficulty === difficulty)
      .map((q) => q.category)
      .filter(Boolean))
  );
  const totalAvailable = (interviewQuestions as Question[]).filter(
    (q) => q.difficulty === difficulty
  ).length;

  const qRatio = totalAvailable ? Math.min(1, questions.length / totalAvailable) : 1;
  const catRatio = totalCategories.length ? coveredCategories.length / totalCategories.length : 1;
  const factor = DIFFICULTY_FACTOR[difficulty] ?? 1;
  const readinessScore = Math.min(100, Math.round(((qRatio * 0.5) + (catRatio * 0.5)) * 100 * factor));
  const readinessLabel =
    readinessScore >= 85 ? "Excellent" : readinessScore >= 65 ? "Good" : "Needs Practice";

  const recommendations = deriveRecommendations(coveredCategories);

  return (
    <div className="completion-card">
      <div className="section-header">
        <div className="section-title">🎉 Mock Interview Complete</div>
        <p className="info-card-text">
          This readiness score reflects how many questions you completed and how well topics were covered.
        </p>
      </div>

      {/* Readiness score */}
      <div className="tip-card section-spaced">
        <div className="info-card-title">Interview Readiness</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${readinessScore}%` }} />
        </div>
        <div className="readiness-meta">
          <div>
            <div className="summary-label">Score</div>
            <div className="summary-value">{readinessScore}%</div>
          </div>
          <div>
            <div className="summary-label">Status</div>
            <div className="summary-value">{readinessLabel}</div>
          </div>
        </div>
        <p className="info-card-text">Based on questions completed, difficulty, and topic coverage.</p>
      </div>

      {/* Session summary */}
      <div className="summary-grid section-spaced">
        <div className="summary-card">
          <div className="summary-label">Questions Completed</div>
          <div className="summary-value">{questions.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Difficulty</div>
          <div className="summary-value">{difficulty}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Interview Mode</div>
          <div className="summary-value">{interviewMode}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Topics Covered</div>
          <div className="badge-row">
            {coveredCategories.length
              ? coveredCategories.map((c) => <span key={c} className="badge">{c}</span>)
              : <span className="caption">—</span>}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="section-spaced">
        <div className="info-card-title">Recommended Next</div>
        <div className="recommendation-row">
          {recommendations.map((rec) => (
            <button
              key={rec.key}
              className={`recommendation-button${rec.key === "ba" ? " primary" : ""}`}
              onClick={() => {
                // TODO: replace with router.push(rec.href) once routing is wired
                console.log("Navigate to", rec.href);
              }}
            >
              {rec.label}
            </button>
          ))}
        </div>
      </div>

      <div className="button-row">
        <button className="primary-button" onClick={onRestart}>Restart Interview</button>
        <button className="secondary-button" onClick={onReturnHome}>Return Home</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function InterviewSimulator() {
  // Setup state
  const [role, setRole] = useState("Business Analyst");
  const [difficulty, setDifficulty] = useState("Easy");
  const [interviewMode, setInterviewMode] = useState("Recruiter");

  // Session state
  const [started, setStarted] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Per-question state
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState<SuggestedAnswer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState<RatingValue | null>(null);
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});

  const filteredQuestions = useMemo(
    () =>
      (interviewQuestions as Question[]).filter(
        (q) => q.role === role && q.difficulty === difficulty
      ),
    [role, difficulty]
  );

  const activeQuestions = started ? sessionQuestions : filteredQuestions;
  const currentQuestion: Question | undefined = activeQuestions[currentIndex];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const startInterview = () => {
    setSessionQuestions(shuffleArray(filteredQuestions));
    setCurrentIndex(0);
    setSuggestedAnswer(null);
    setRevealed(false);
    setAnswered(false);
    setRating(null);
    setNotesMap({});
    setCompleted(false);
    setStarted(true);
  };

  const revealAnswer = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentQuestion.question }),
      });
      const data = await res.json();
      setSuggestedAnswer(normalizeAnswerPayload(data));
    } catch {
      setSuggestedAnswer({
        suggestedAnswer: "Unable to generate answer. Please try again.",
        whyItWorks: [],
        keyPoints: [],
        interviewTip: "",
      });
    } finally {
      setLoading(false);
      setRevealed(true);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSuggestedAnswer(null);
      setRevealed(false);
      setAnswered(false);
      setRating(null);
    } else {
      setCompleted(true);
    }
  };

  const restartInterview = () => {
    setStarted(false);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setAnswered(false);
    setSuggestedAnswer(null);
    setRevealed(false);
    setRating(null);
    setNotesMap({});
    setCompleted(false);
  };

  const returnHome = () => {
    setStarted(false);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setCompleted(false);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="interview-page">
      {/* Page header — always visible */}
      <div className="section-header">
        <h1 className="section-title">Mock Interview</h1>
        <p className="section-subtitle">
          Practice realistic Business Analyst interview questions and compare your approach with a sample answer.
        </p>
      </div>

      {/* Setup screen */}
      {!started && (
        <SetupScreen
          role={role}
          difficulty={difficulty}
          interviewMode={interviewMode}
          onRoleChange={setRole}
          onDifficultyChange={setDifficulty}
          onInterviewModeChange={setInterviewMode}
          onStart={startInterview}
        />
      )}

      {/* Active question */}
      {started && !completed && currentQuestion && (
        <div className="question-card">
          {/* Progress — top of card, before question */}
          <QuestionProgress current={currentIndex} total={activeQuestions.length} />

          {/* Metadata badges */}
          <div className="badge-row">
            <span className="badge">📂 {currentQuestion.category}</span>
            <span className="badge">⭐ {currentQuestion.difficulty}</span>
            <span className="badge">⏱ {currentQuestion.expectedDuration}</span>
            <span className="badge">📋 {currentQuestion.framework}</span>
          </div>

          {/* Primary focus: the question */}
          <h2 className="question-text">{currentQuestion.question}</h2>
          <p className="time-tip">Think about your answer first, then compare it with mine.</p>

          {/* Skills being assessed */}
          {currentQuestion.skillsTested && currentQuestion.skillsTested.length > 0 && (
            <div className="text-card section-spaced">
              <div className="info-card-title">Recruiter is assessing</div>
              <div className="badge-row">
                {currentQuestion.skillsTested.map((skill) => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="field-group section-spaced">
            <div className="info-card-title">Quick Notes (Optional)</div>
            {!answered ? (
              <textarea
                placeholder={`Example:\n\n• MoSCoW\n\n• Business Value\n\n• Stakeholder Alignment\n\n• MVP`}
                value={notesMap[currentQuestion.id] ?? ""}
                onChange={(e) =>
                  setNotesMap((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                }
                className="notes-area"
              />
            ) : (
              <div className="note-preview">
                <div className="note-preview-card">
                  <div className="note-preview-label">Your Notes</div>
                  <div className="note-preview-text">{notesMap[currentQuestion.id] || "—"}</div>
                </div>
                <div className="note-preview-card">
                  <div className="note-preview-label">Private Preparation</div>
                  <div className="note-preview-text">
                    These notes are for your preparation and won't be sent to the AI.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="button-row">
            {!answered && (
              <button className="primary-button" onClick={() => setAnswered(true)}>
                I've Answered
              </button>
            )}
            {answered && !revealed && (
              <button className="primary-button" onClick={revealAnswer} disabled={loading}>
                {loading ? "Generating Suggested Answer…" : "Reveal Suggested Answer"}
              </button>
            )}
            {revealed && (
              <button className="primary-button" onClick={nextQuestion}>
                Next Question
              </button>
            )}
            <button className="secondary-button" onClick={restartInterview}>
              Restart Interview
            </button>
          </div>

          {/* Suggested answer panel */}
          {revealed && suggestedAnswer && (
            <SuggestedAnswerPanel answer={suggestedAnswer} question={currentQuestion} />
          )}

          {/* Self-rating */}
          {revealed && (
            <RatingSelfCheck rating={rating} onRate={setRating} />
          )}
        </div>
      )}

      {/* Completion screen */}
      {completed && (
        <CompletionScreen
          questions={sessionQuestions}
          difficulty={difficulty}
          interviewMode={interviewMode}
          onRestart={restartInterview}
          onReturnHome={returnHome}
        />
      )}
    </div>
  );
}
