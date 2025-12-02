import { useState, useEffect } from "react";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState("Strengths Journal");

  // =====================================
  //             PERSONAS
  // =====================================
  const PERSONAS = [
    {
      id: "milspouse-001",
      name: "Avery Carter",
      headline: "Registered Nurse | Compact-State RN | Telehealth-friendly",
      skills: [
        "Nursing",
        "RN",
        "Telehealth",
        "Care Coordination",
        "EMR",
        "Epic",
        "Patient Education",
      ],
    },
    {
      id: "milspouse-002",
      name: "Jordan Lee",
      headline: "Project Manager | Remote-first | Military spouse network lead",
      skills: [
        "Project Management",
        "Scheduling",
        "Stakeholder Communication",
        "Excel",
        "Jira",
        "Confluence",
      ],
    },
    {
      id: "milspouse-003",
      name: "Taylor Morgan",
      headline:
        "Elementary Teacher | License Portability | Substitute/remote tutoring",
      skills: [
        "Teaching",
        "Curriculum Design",
        "Classroom Management",
        "Reading Intervention",
        "Google Classroom",
      ],
    },
    {
      id: "christine-bennet",
      name: "CHRISTINE BENNET",
      headline: "Teacher | 10+ yrs classroom experience | Seattle, WA",
      skills: [
        "Organization",
        "Critical Thinking",
        "Classroom Management",
        "Adaptability",
        "Blackboard",
        "Leadership",
        "Creativity",
        "Problem-Solving",
      ],
    },
  ];

  const [selectedPersonaId, setSelectedPersonaId] = useState(PERSONAS[0].id);
  const selectedPersona =
    PERSONAS.find((p) => p.id === selectedPersonaId) ?? PERSONAS[0];

  // =====================================
  //      BACKEND CONFIG & AI STATE
  // =====================================

  const API_BASE = "http://127.0.0.1:8000";

  // AI Hint (homework)
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mentor Notes → AI Summary
  const [mentorNotes, setMentorNotes] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Mentor Matching
  const [mentorMatches, setMentorMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  // =====================================
  //           ASSIGNMENTS
  // =====================================

  const assignments = [
    {
      title: "Strengths Journal",
      stage: "Confidence",
      eta: "8–10 min",
      due: "Due in 3 days",
      desc: "Write 3 moments this week that energized you. Tag skills you used.",
      status: "Not started",
    },
    {
      title: "STAR Story: Relocation Win",
      stage: "Identity → Career",
      eta: "12–15 min",
      due: "Due in 5 days",
      desc: "Draft a STAR story that turns a challenge into a strength.",
      status: "In progress",
    },
    {
      title: "Micro-Network Task",
      stage: "Career Exploration",
      eta: "5–7 min",
      due: "Due tomorrow",
      desc: "Send 1 informational-interview request using our template.",
      status: "Not started",
    },
    {
      title: "Resume Transferables",
      stage: "Job-Search Readiness",
      eta: "10–12 min",
      due: "Due next week",
      desc: "Reframe 3 experiences into resume bullets with impact.",
      status: "Not started",
    },
  ];

  // map assignment → prompt
  const questionByTitle = {
    "Strengths Journal":
      "Write 3 moments this week that energized you. Tag skills you used.",
    "STAR Story: Relocation Win":
      "Draft a STAR story that turns a challenge into a strength.",
    "Resume Transferables":
      "Reframe 3 experiences into resume bullets with impact.",
    "Micro-Network Task":
      "Send 1 informational-interview request using our template.",
  };

  const [currentPrompt, setCurrentPrompt] = useState(
    questionByTitle["Strengths Journal"]
  );

  useEffect(() => {
    setCurrentPrompt(
      questionByTitle[selected] || questionByTitle["Strengths Journal"]
    );
  }, [selected]);

  // =====================================
  //              AI HINT CALL
  // =====================================

  async function getAiHint() {
    if (selected === "Micro-Network Task") return;

    setLoading(true);
    setError("");
    setHints([]);
    try {
      const res = await fetch(`${API_BASE}/ai-hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:
            questionByTitle[selected] || questionByTitle["Strengths Journal"],
          // backend will look up by resume_name in resumes.json
          resume_name: selectedPersona.name,
          meeting_notes: "",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHints(Array.isArray(data.hints) ? data.hints : []);
    } catch (e) {
      setError(e.message || "AI hint failed");
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  //     MENTOR NOTES → WEEKLY TASKS
  // =====================================

  async function generateSummary() {
    setTaskLoading(true);
    setTaskError("");
    setAiResult(null);
    try {
      const res = await fetch(`${API_BASE}/generate-weekly-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_notes: mentorNotes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      setTaskError(e.message || "Failed to connect to backend");
    } finally {
      setTaskLoading(false);
    }
  }

  // =====================================
  //          MENTOR MATCHING LOGIC
  // =====================================

  function buildMatchProfileFromPersona(persona) {
    switch (persona.id) {
      case "milspouse-001":
        return {
          backgroundTags: ["nurse", "telehealth", "compact license"],
          goals: ["telehealth role", "remote work", "license portability"],
          preferredSupport: ["quick tips", "structured guidance"],
          traits: "Calm, detail-oriented",
          connectionPref: "Short messages + video",
          milSpouseYears: "3–5 years",
        };
      case "milspouse-002":
        return {
          backgroundTags: ["project manager", "dod contractor", "remote work"],
          goals: ["project management role", "remote work", "networking"],
          preferredSupport: ["structured guidance", "goal-setting"],
          traits: "Organized, proactive",
          connectionPref: "Bi-weekly calls",
          milSpouseYears: "3–5 years",
        };
      case "milspouse-003":
        return {
          backgroundTags: ["teacher", "license portability", "public-school"],
          goals: ["teaching role", "license reciprocity", "flexible schedule"],
          preferredSupport: ["emotional support", "quick tips"],
          traits: "Warm, student-centered",
          connectionPref: "Evening calls",
          milSpouseYears: "5+ years",
        };
      case "christine-bennet":
        return {
          backgroundTags: ["teacher", "experienced"],
          goals: ["teaching role", "student impact", "career growth"],
          preferredSupport: ["peer mentoring", "light structure"],
          traits: "Experienced, reflective",
          connectionPref: "Email + occasional calls",
          milSpouseYears: "N/A",
        };
      default:
        return {
          backgroundTags: [],
          goals: [],
          preferredSupport: [],
          traits: "",
          connectionPref: "",
          milSpouseYears: "",
        };
    }
  }

  async function fetchMentorMatches() {
    setMatchLoading(true);
    setMatchError("");
    setMentorMatches([]);
    try {
      const profile = buildMatchProfileFromPersona(selectedPersona);
      const res = await fetch(`${API_BASE}/mentor-matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchProfile: profile }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMentorMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (e) {
      setMatchError(e.message || "Mentor matching failed");
    } finally {
      setMatchLoading(false);
    }
  }

  useEffect(() => {
    if (view === "matching") {
      fetchMentorMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedPersonaId]);

  const userProfileHighlights = (() => {
    const base = buildMatchProfileFromPersona(selectedPersona);
    return {
      traits: base.traits || "Motivated, resilient",
      motivation: "Growth, stability",
      goal:
        base.goals[0] ||
        "Clarify next career step in a portable, spouse-friendly field",
      connection: base.connectionPref || "Flexible virtual touchpoints",
      mentorType:
        base.preferredSupport.join(" + ") ||
        "Supportive accountability + realistic planning",
      milSpouse: base.milSpouseYears || "Not specified",
    };
  })();

  // =====================================
  //                 UI
  // =====================================

  return (
    <div className="p-6 space-y-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">The Hub</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Persona Dropdown */}
          <div className="text-sm">
            <label className="mr-2 text-gray-600">Persona:</label>
            <select
              className="bg-gray-100 px-3 py-1 rounded-xl"
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm bg-gray-100 px-3 py-1 rounded-xl">
            Stage: <span className="font-semibold">Confidence → Career</span>
          </div>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-xl">
            Streak: <span className="font-semibold">3 days</span>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setView("dashboard")}
          className={`px-3 py-1.5 rounded-xl ${
            view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setView("activity")}
          className={`px-3 py-1.5 rounded-xl ${
            view === "activity" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Activity Player
        </button>
        <button
          onClick={() => setView("feedback")}
          className={`px-3 py-1.5 rounded-xl ${
            view === "feedback" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Feedback
        </button>
        <button
          onClick={() => setView("mentorNotes")}
          className={`px-3 py-1.5 rounded-xl ${
            view === "mentorNotes" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Mentor Notes
        </button>
        <button
          onClick={() => setView("matching")}
          className={`px-3 py-1.5 rounded-xl ${
            view === "matching" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Find a Mentor
        </button>
      </div>

      {/* Dashboard */}
      {view === "dashboard" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {assignments.map((a) => (
              <div
                key={a.title}
                className="border rounded-2xl p-4 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-xs text-gray-500">
                      {a.stage} • {a.eta}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg ${
                      a.status === "In progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{a.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{a.due}</span>
                  <button
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-xl"
                    onClick={() => {
                      setSelected(a.title);
                      setView("activity");
                      setHints([]);
                      setError("");
                      setCurrentPrompt(questionByTitle[a.title] || "");
                    }}
                  >
                    {a.status === "In progress" ? "Resume" : "Start"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coach */}
          <div className="border rounded-2xl p-4 space-y-4">
            <h3 className="font-semibold">Coach</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
              Today’s nudge: Try{" "}
              <span className="font-medium">{assignments[0].title}</span>.
            </div>
          </div>
        </div>
      )}

      {/* Activity Player */}
      {view === "activity" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Main Section */}
          <div className="col-span-2 border rounded-2xl p-4">
            <h3 className="font-semibold mb-2">{selected}</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <span className="font-semibold">Prompt:</span> {currentPrompt}
            </div>

            {selected === "Micro-Network Task" ? (
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <p>Use the template below to send one networking message.</p>
                <pre className="bg-gray-100 p-2 rounded-xl text-xs whitespace-pre-wrap">
                  {`Subject: Quick 15-min chat about your role at [Company]?

Hi [Name], I'm exploring [field] and noticed your background in [topic]. Would you be open to a quick 15-min chat next week?
Thanks! —[Your Name]`}
                </pre>
              </div>
            ) : (
              <>
                <textarea
                  className="mt-3 w-full h-40 border rounded-xl p-3 text-sm"
                  placeholder="Type your reflections here…"
                ></textarea>

                <div className="mt-3 flex gap-2">
                  <button
                    className="text-sm bg-gray-100 px-3 py-1 rounded-xl"
                    onClick={getAiHint}
                    disabled={loading}
                  >
                    {loading ? "Thinking…" : "Get AI Hint"}
                  </button>
                  <button className="text-sm bg-gray-100 px-3 py-1 rounded-xl">
                    Insert Example
                  </button>
                  <button
                    className="ml-auto text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl"
                    onClick={() => setView("feedback")}
                  >
                    Submit for Review
                  </button>
                </div>

                {(error || hints.length > 0) && (
                  <div className="mt-4 border rounded-xl p-3 bg-gray-50 text-sm">
                    {error ? (
                      <div className="text-red-600">Error: {error}</div>
                    ) : (
                      <>
                        <div className="font-semibold mb-1">AI Hints</div>
                        <ul className="list-disc list-inside space-y-1">
                          {hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar: Persona Overview */}
          <div className="border rounded-2xl p-4 space-y-3">
            <h4 className="font-semibold">Persona Overview</h4>
            <p className="text-sm font-semibold">{selectedPersona.name}</p>
            <p className="text-xs text-gray-600">{selectedPersona.headline}</p>

            <h5 className="text-xs font-semibold text-gray-700 mt-2">
              Key Skills
            </h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedPersona.skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-800 mt-3">
              AI hints are grounded in this persona’s resume profile.
            </div>
          </div>
        </div>
      )}

      {/* Feedback View */}
      {view === "feedback" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 border rounded-2xl p-4">
            <h3 className="font-semibold">Quick Feedback</h3>
            <p className="text-sm text-gray-600">
              Help us improve these activities. This takes{" "}
              <strong>30–45 seconds</strong>.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="border rounded-2xl p-3">
                <p className="text-sm">How helpful was this activity?</p>
                <div className="mt-2 flex gap-2 text-sm">
                  {["1", "2", "3", "4", "5"].map((n) => (
                    <button
                      key={n}
                      className="px-3 py-1 rounded-xl bg-gray-100"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border rounded-2xl p-3">
                <p className="text-sm">Effort required felt…</p>
                <div className="mt-2 flex gap-2 text-sm">
                  {["Too low", "Just right", "Too high"].map((t) => (
                    <button
                      key={t}
                      className="px-3 py-1 rounded-xl bg-gray-100"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl"
                onClick={() => setView("dashboard")}
              >
                Submit Feedback
              </button>
            </div>
          </div>

          <div className="border rounded-2xl p-4 space-y-3">
            <h4 className="font-semibold">After you submit</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>AI draft of resume bullet (edit anytime)</li>
              <li>Mentor notes appear within 48h</li>
              <li>Next activity unlocked</li>
            </ul>
          </div>
        </div>
      )}

      {/* Mentor Notes */}
      {view === "mentorNotes" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 border rounded-2xl p-4">
            <h3 className="font-semibold mb-1">Mentor Notes → AI Summary</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter session notes and generate a summary + tasks.
            </p>
            <textarea
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              className="w-full h-40 border rounded-xl p-3 text-sm mb-3"
              placeholder="Ex: Mentee was more confident in interviews but still unsure about resume focus..."
            />
            <div className="flex gap-2">
              <button
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl"
                onClick={generateSummary}
                disabled={taskLoading}
              >
                {taskLoading ? "Generating..." : "Generate AI Summary"}
              </button>
              <button
                className="text-sm bg-gray-100 px-3 py-1 rounded-xl"
                onClick={() => setMentorNotes("")}
              >
                Clear
              </button>
            </div>

            {taskError && (
              <div className="mt-4 text-red-600 text-sm">❌ {taskError}</div>
            )}
            {aiResult && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-xl p-4 bg-blue-50">
                  <h4 className="font-semibold text-sm mb-1">
                    🧭 Session Summary
                  </h4>
                  <p className="text-sm text-gray-700">
                    {aiResult.session_summary ||
                      aiResult.raw_output ||
                      "No summary text available."}
                  </p>
                </div>
                <div className="border rounded-xl p-4 bg-green-50">
                  <h4 className="font-semibold text-sm mb-1">
                    ✅ Recommended Next Steps
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {(aiResult.next_steps || []).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                {aiResult.emotional_progress && (
                  <div className="border rounded-xl p-4 bg-purple-50">
                    <h4 className="font-semibold text-sm mb-1">
                      💬 Emotional Progress
                    </h4>
                    <p className="text-sm text-gray-700">
                      {aiResult.emotional_progress}
                    </p>
                  </div>
                )}
                <details className="border rounded-xl p-2 bg-gray-50 text-xs">
                  <summary className="cursor-pointer text-gray-700">
                    View raw JSON
                  </summary>
                  <pre className="overflow-auto text-xs mt-2">
                    {JSON.stringify(aiResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
          <div className="border rounded-2xl p-6">
            <h4 className="font-semibold mb-2">Quick Directions</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Write 3–5 sentences max.</li>
              <li>Include confidence, blockers, or wins.</li>
              <li>Click “Generate AI Summary.”</li>
            </ul>
          </div>
        </div>
      )}

      {/* Find a Mentor */}
      {view === "matching" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Left Panel: Matching Results List */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Your Mentor Matches</h3>
                <p className="text-sm text-gray-600">
                  Based on {selectedPersona.name}’s profile and goals, here are
                  the top mentor recommendations from our scoring engine.
                </p>
              </div>
              <button
                className="text-sm bg-gray-100 px-3 py-1 rounded-xl"
                onClick={fetchMentorMatches}
                disabled={matchLoading}
              >
                {matchLoading ? "Refreshing…" : "Refresh matches"}
              </button>
            </div>

            {matchError && (
              <div className="border rounded-xl p-3 bg-red-50 text-sm text-red-700">
                Error: {matchError}
              </div>
            )}

            {!matchError && mentorMatches.length === 0 && !matchLoading && (
              <div className="border rounded-xl p-3 bg-gray-50 text-sm text-gray-700">
                No matches yet. Try refreshing or adjusting the persona.
              </div>
            )}

            {mentorMatches.map((mentor) => (
              <div key={mentor.id} className="border rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{mentor.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{mentor.title}</p>
                    <p className="text-sm text-gray-700">{mentor.bio}</p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <h4 className="text-3xl font-bold text-blue-600">
                      {mentor.matchPercent}%
                    </h4>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                <div className="border rounded-xl p-3 bg-blue-50 border-blue-100">
                  <h5 className="font-semibold text-sm text-blue-800">
                    Match Explanation (rule-based engine)
                  </h5>
                  <p
                    className="text-sm text-gray-800 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: mentor.matchReason || "",
                    }}
                  ></p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    {mentor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl">
                    Connect with {mentor.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Matching Context */}
          <div className="space-y-4">
            <div className="border rounded-2xl p-6 space-y-3">
              <h4 className="font-semibold">Matching Based On:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>
                  <strong className="text-gray-900">Goal:</strong>{" "}
                  {userProfileHighlights.goal}
                </li>
                <li>
                  <strong className="text-gray-900">Mentor Type:</strong>{" "}
                  {userProfileHighlights.mentorType}
                </li>
                <li>
                  <strong className="text-gray-900">Motivation:</strong>{" "}
                  {userProfileHighlights.motivation}
                </li>
                <li>
                  <strong className="text-gray-900">Connection:</strong>{" "}
                  {userProfileHighlights.connection}
                </li>
                <li>
                  <strong className="text-gray-900">Experience:</strong>{" "}
                  {userProfileHighlights.milSpouse}
                </li>
              </ul>
            </div>

            <div className="border rounded-2xl p-6 space-y-4">
              <h4 className="font-semibold">Our Matching Principles</h4>
              <p className="text-xs text-gray-600">
                Matching is based on shared background, aligned goals, and
                preferred support style — not random pairing.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>
                  <strong>Shared Experience Matters</strong>
                  <br />
                  <span className="text-xs text-gray-600">
                    We prioritize mentors who understand nursing, teaching, PM,
                    and military family transitions.
                  </span>
                </li>
                <li>
                  <strong>Goal Alignment</strong>
                  <br />
                  <span className="text-xs text-gray-600">
                    Telehealth, DoD PM roles, and license portability are
                    explicitly encoded as goals.
                  </span>
                </li>
                <li>
                  <strong>Support Style Fit</strong>
                  <br />
                  <span className="text-xs text-gray-600">
                    Some spouses want structured goal-setting, others prefer
                    quick tips or peer-style mentoring — we use that too.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
