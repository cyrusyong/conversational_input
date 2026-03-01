import React, { useMemo, useState } from "react";

/**
 * Conversational Housing Prototype (frontend-only)
 * - Single input
 * - Extracts structured info from free text
 * - Asks 1–3 follow-up questions for missing fields
 * - Updates "What I understand" panel dynamically
 * - Shows mock housing options once enough info exists
 */

// ---- Lightweight parsing helpers (prototype quality) ----
function clean(s) {
  return (s || "").trim();
}

function parseBudget(text) {
  // Examples: "$1400", "1400", "under 1500", "below $1,600"
  const t = text.toLowerCase();
  const underMatch = t.match(
    /(under|below|max|less than)\s*\$?\s*([0-9]{3,5})/,
  );
  if (underMatch) return { type: "max", value: Number(underMatch[2]) };

  const rangeMatch = t.match(
    /\$?\s*([0-9]{3,5})\s*(to|-)\s*\$?\s*([0-9]{3,5})/,
  );
  if (rangeMatch)
    return {
      type: "range",
      min: Number(rangeMatch[1]),
      max: Number(rangeMatch[3]),
    };

  const singleMatch = t.match(/\$?\s*([0-9]{3,5})/);
  if (singleMatch) return { type: "single", value: Number(singleMatch[1]) };

  return null;
}

function parseBedrooms(text) {
  const t = text.toLowerCase();

  // "2 bedrooms", "2 bedroom", "2 bed", "2 br"
  const m = t.match(/\b([0-5])\s*(bedrooms?|beds?|br)\b/);
  if (m) return Number(m[1]);

  // "studio"
  if (/\bstudio\b/.test(t)) return 0;

  // "one bedroom", "two bedrooms" (optional but nice)
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  const w = t.match(/\b(one|two|three|four|five)\s+bedrooms?\b/);
  if (w) return words[w[1]];

  return null;
}

function parsePets(text) {
  const t = text.toLowerCase();
  if (
    t.includes("pet-friendly") ||
    t.includes("pet friendly") ||
    t.includes("pets ok") ||
    t.includes("dog") ||
    t.includes("cat")
  )
    return true;
  if (t.includes("no pets") || t.includes("pet free") || t.includes("no pet"))
    return false;
  return null;
}

function parseCommute(text) {
  const t = text.toLowerCase();

  // 1) "within 10 minutes", "under 10 minutes"
  let m = t.match(/\b(within|under)\s*([0-9]{1,2})\s*(min|mins|minutes)\b/);
  if (m) return { maxMinutes: Number(m[2]) };

  // 2) "max 10 minutes", "at most 10 minutes", "no more than 10 minutes"
  m = t.match(
    /\b(max|at most|no more than)\s*([0-9]{1,2})\s*(min|mins|minutes)\b/,
  );
  if (m) return { maxMinutes: Number(m[2]) };

  // 3) ✅ "10 minutes max", "10 min max"
  m = t.match(/\b([0-9]{1,2})\s*(min|mins|minutes)\s*max\b/);
  if (m) return { maxMinutes: Number(m[1]) };

  // 4) "10-minute commute", "10 minute commute"
  m = t.match(/\b([0-9]{1,2})\s*-\s*minute\b|\b([0-9]{1,2})\s*minute\b/);
  const val = Number(m?.[1] || m?.[2]);
  if (m && val) return { maxMinutes: val };

  // 5) "10 minutes away/from"
  m = t.match(/\b([0-9]{1,2})\s*(min|mins|minutes)\s*(away|from)\b/);
  if (m) return { maxMinutes: Number(m[1]) };

  return null;
}

function parseLocations(text) {
  // Prototype heuristics:
  // - "currently in X"
  // - "I'm in X"
  // - "relocating to X" / "moving to X"
  // - base names: "Fort Moore", "Fort Benning", etc.
  const t = text;

  let current = null;
  let relocating = null;
  const cur1 = t.match(
    /\bcurrently in\s+(.+?)(?=\s+(and|but|with|because|so)\b|[.,;:\n]|$)/i,
  );
  const cur2 = t.match(
    /\b(i am|i'm)\s+in\s+(.+?)(?=\s+(and|but|with|because|so)\b|[.,;:\n]|$)/i,
  );

  if (cur1) current = clean(cur1[1]);
  else if (cur2) current = clean(cur2[2]);

  const rel1 = t.match(
    /\b(relocating|moving|pcs|pcsing)\s+to\s+(.+?)(?=\s+(and|but|with|because|so)\b|[.,;:\n]|$)/i,
  );
  if (rel1) relocating = clean(rel1[2]);

  // If they mention Fort Moore/Benning anywhere, assume relocating destination if not set
  if (!relocating) {
    if (/fort\s+moore/i.test(t)) relocating = "Fort Moore / Columbus, GA";
    else if (/fort\s+benning/i.test(t))
      relocating = "Fort Benning / Columbus, GA";
  }

  return { current, relocating };
}

function classifyGoal(text) {
  const t = (text || "").toLowerCase();

  const housingHits =
    t.includes("housing") ||
    t.includes("apartment") ||
    t.includes("rent") ||
    t.includes("lease") ||
    t.includes("move") ||
    t.includes("relocat") ||
    t.includes("place to live") ||
    t.includes("townhome") ||
    t.includes("roommate");

  const jobHits =
    t.includes("job") ||
    t.includes("employment") ||
    t.includes("resume") ||
    t.includes("work") ||
    t.includes("career");

  const childcareHits =
    t.includes("childcare") || t.includes("daycare") || t.includes("babysit");

  const educationHits =
    t.includes("school") ||
    t.includes("college") ||
    t.includes("degree") ||
    t.includes("certification");

  if (housingHits) return "Find Housing";
  if (jobHits) return "Find a Job";
  if (childcareHits) return "Childcare";
  if (educationHits) return "Education";
  return "Unknown";
}

function formatBudget(b) {
  if (!b) return "";
  if (b.type === "max") return `Under $${b.value}/mo`;
  if (b.type === "range") return `$${b.min}–$${b.max}/mo`;
  if (b.type === "single") return `Around $${b.value}/mo`;
  return "";
}

// ---- Follow-up question engine (simple, deterministic) ----
function computeMissing(profile) {
  // For housing we want these: relocating_to, budget, pets, bedrooms, commute, current_location
  const missing = [];
  if (!profile.relocating_to) missing.push("relocating_to");
  if (!profile.current_location) missing.push("current_location"); // optional but nice
  if (!profile.budget) missing.push("budget");
  if (profile.pets === null || profile.pets === undefined) missing.push("pets");
  if (profile.bedrooms === null || profile.bedrooms === undefined)
    missing.push("bedrooms");
  if (!profile.commute) missing.push("commute");
  return missing;
}

function nextQuestions(profile) {
  const missing = computeMissing(profile);

  // Ask at most 3; prioritize what’s required to search
  const priority = [
    "relocating_to",
    "budget",
    "bedrooms",
    "pets",
    "commute",
    "current_location",
  ];
  const asked = [];
  for (const key of priority) {
    if (missing.includes(key)) asked.push(key);
    if (asked.length >= 3) break;
  }

  return asked.map((key) => {
    switch (key) {
      case "relocating_to":
        return { key, prompt: "Where are you relocating to (base/city)?" };
      case "budget":
        return {
          key,
          prompt: "What monthly budget range feels realistic for you?",
        };
      case "bedrooms":
        return {
          key,
          prompt: "How many bedrooms do you need? (e.g., studio, 1 bed, 2 bed)",
        };
      case "pets":
        return { key, prompt: "Do you need pet-friendly housing?" };
      case "commute":
        return {
          key,
          prompt:
            "How close do you want to be to base (max commute in minutes)?",
        };
      case "current_location":
        return { key, prompt: "Where are you currently located?" };
      default:
        return { key, prompt: "Quick question to tailor your plan:" };
    }
  });
}

// ---- Mock housing results (filtered lightly) ----
const MOCK_LISTINGS = [
  {
    id: "pr",
    name: "Pine Ridge Apartments",
    price: 1350,
    distanceMin: 8,
    tags: ["Apartment", "Pet Friendly"],
    beds: 2,
  },
  {
    id: "lo",
    name: "Liberty Oaks Townhomes",
    price: 1480,
    distanceMin: 12,
    tags: ["Townhome", "Washer/Dryer"],
    beds: 2,
  },
  {
    id: "rw",
    name: "Riverwalk Homes",
    price: 1525,
    distanceMin: 14,
    tags: ["House", "Yard", "Pet Friendly"],
    beds: 3,
  },
  {
    id: "cs",
    name: "Cedar Springs Studio",
    price: 1100,
    distanceMin: 10,
    tags: ["Studio", "Utilities Included"],
    beds: 0,
  },
];

function filterListings(profile) {
  let list = [...MOCK_LISTINGS];

  if (profile.budget?.type === "max") {
    list = list.filter((x) => x.price <= profile.budget.value);
  } else if (profile.budget?.type === "range") {
    list = list.filter(
      (x) => x.price >= profile.budget.min && x.price <= profile.budget.max,
    );
  } else if (profile.budget?.type === "single") {
    const v = profile.budget.value;
    list = list.filter((x) => x.price >= v - 200 && x.price <= v + 200);
  }

  if (profile.bedrooms !== null && profile.bedrooms !== undefined) {
    list = list.filter((x) => x.beds === profile.bedrooms);
  }

  if (profile.pets === true) {
    list = list.filter((x) => x.tags.some((t) => /pet/i.test(t)));
  }

  if (profile.commute?.maxMinutes) {
    list = list.filter((x) => x.distanceMin <= profile.commute.maxMinutes);
  }

  return list;
}

export default function CareerCorpsHousingPrototype() {
  const chips = ["Find Housing", "Find a Job", "Childcare", "New to the Area"];

  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Start by describing what you need. I’ll ask a few follow-up questions and suggest housing options.",
    },
  ]);

  const [mode, setMode] = useState("INTAKE");
  // INTAKE -> HOUSING -> (later other modes)
  const [detectedGoal, setDetectedGoal] = useState("Unknown");

  const [input, setInput] = useState("");
  const [profile, setProfile] = useState({
    goal: "Find Housing",
    current_location: "",
    relocating_to: "",
    budget: null,
    pets: null,
    bedrooms: null,
    commute: null,
  });

  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [selectedListingId, setSelectedListingId] = useState(null);

  const inferredQuestions = useMemo(() => nextQuestions(profile), [profile]);

  const readyForListings = useMemo(() => {
    // Minimal requirements to show options
    return Boolean(profile.relocating_to && profile.budget);
  }, [profile.relocating_to, profile.budget]);

  const listings = useMemo(
    () => (readyForListings ? filterListings(profile) : []),
    [profile, readyForListings],
  );
  const selected = useMemo(
    () => listings.find((l) => l.id === selectedListingId) || null,
    [listings, selectedListingId],
  );

  function applyExtraction(text) {
    const { current, relocating } = parseLocations(text);
    const budget = parseBudget(text);
    const bedrooms = parseBedrooms(text);
    const pets = parsePets(text);
    const commute = parseCommute(text);

    setProfile((p) => ({
      ...p,
      goal: "Find Housing",
      current_location: current || p.current_location,
      relocating_to: relocating || p.relocating_to,
      budget: budget || p.budget,
      bedrooms: bedrooms !== null ? bedrooms : p.bedrooms,
      pets: pets !== null ? pets : p.pets,
      commute: commute || p.commute,
    }));
  }

  function onSend() {
    const text = clean(input);
    if (!text) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");

    // If already in housing mode, keep extracting AND acknowledge
    if (mode === "HOUSING") {
      applyExtraction(text);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Got it. I updated your preferences and refreshed the matches.",
        },
      ]);
      return;
    }

    // Otherwise (first message), detect goal
    const goal =
      mode === "HOUSING" ? "Find Housing" : classifyGoal(text) || profile.goal;
    setDetectedGoal(goal);

    if (goal !== "Find Housing") {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            goal === "Unknown"
              ? "For demo day, we’re focusing on housing. Tell me where you’re relocating to and your monthly budget."
              : `It sounds like your main goal is: ${goal}. For demo day, we’re focusing on housing. If you want housing help, tell me where you’re relocating to and your budget.`,
        },
      ]);
      return;
    }

    // Enter housing mode and extract from the first message
    setMode("HOUSING");
    applyExtraction(text);
    setProfile((p) => ({ ...p, goal: "Find Housing" }));

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: "Got it — housing. I’ll summarize what I know on the right as you share details.",
      },
    ]);
  }

  // helper to avoid stale state inside timeout
  function inferProfileDeltaFromText(text, currentProfile) {
    const goal = classifyGoal(text) || currentProfile.goal;
    const { current, relocating } = parseLocations(text);
    const budget = parseBudget(text);
    const bedrooms = parseBedrooms(text);
    const pets = parsePets(text);
    const commute = parseCommute(text);

    return {
      goal,
      current_location: current || currentProfile.current_location,
      relocating_to: relocating || currentProfile.relocating_to,
      budget: budget || currentProfile.budget,
      bedrooms: bedrooms !== null ? bedrooms : currentProfile.bedrooms,
      pets: pets !== null ? pets : currentProfile.pets,
      commute: commute || currentProfile.commute,
    };
  }

  function answerFollowUp(key, value) {
    setFollowUpAnswers((a) => ({ ...a, [key]: value }));

    // Update profile based on which key was answered
    setProfile((p) => {
      if (key === "budget") {
        const b = parseBudget(String(value)) || p.budget;
        return { ...p, budget: b };
      }
      if (key === "bedrooms") {
        const b = parseBedrooms(String(value));
        return { ...p, bedrooms: b !== null ? b : p.bedrooms };
      }
      if (key === "pets") {
        const v = String(value).toLowerCase();
        const bool =
          v.includes("y") || v.includes("true") || v.includes("pet")
            ? true
            : v.includes("n")
              ? false
              : p.pets;
        return { ...p, pets: bool };
      }
      if (key === "commute") {
        const c = parseCommute(String(value)) || {
          maxMinutes: Number(String(value).replace(/[^0-9]/g, "")),
        };
        return { ...p, commute: c?.maxMinutes ? c : p.commute };
      }
      if (key === "relocating_to") {
        return { ...p, relocating_to: clean(String(value)) };
      }
      if (key === "current_location") {
        return { ...p, current_location: clean(String(value)) };
      }
      return p;
    });

    // Add to message thread to keep it “conversational”
    setMessages((m) => [...m, { role: "user", text: String(value) }]);
  }

  const understandingRows = useMemo(() => {
    const rows = [];
    if (profile.current_location)
      rows.push({ label: "Currently in", value: profile.current_location });
    if (profile.relocating_to)
      rows.push({ label: "Relocating to", value: profile.relocating_to });
    if (profile.goal) rows.push({ label: "Goal", value: profile.goal });
    if (profile.budget)
      rows.push({ label: "Budget", value: formatBudget(profile.budget) });
    if (profile.bedrooms !== null && profile.bedrooms !== undefined)
      rows.push({
        label: "Bedrooms",
        value: profile.bedrooms === 0 ? "Studio" : `${profile.bedrooms} bed`,
      });
    if (profile.pets !== null && profile.pets !== undefined)
      rows.push({
        label: "Pets",
        value: profile.pets ? "Pet-friendly needed" : "No pets",
      });
    if (profile.commute?.maxMinutes)
      rows.push({
        label: "Commute",
        value: `Under ${profile.commute.maxMinutes} minutes`,
      });
    return rows;
  }, [profile]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">CareerCorps Navigator</h1>
            <p className="text-sm text-stone-500">
              Prototype: Housing conversational intake
            </p>
          </div>
          <nav className="flex gap-2 text-sm">
            {["Dashboard", "Jobs", "Housing", "Community", "Mentors"].map(
              (item) => (
                <div
                  key={item}
                  className={`rounded-lg border px-3 py-2 ${
                    item === "Housing"
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Main */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-sm font-medium text-stone-500">
              Start here
            </p>
            <h2 className="text-2xl font-semibold">Tell us what you need.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Describe your situation naturally. I’ll extract the important
              details, ask a few follow-up questions, and suggest housing
              options.
            </p>

            {/* Goal chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    chip === profile.goal
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-stone-100 text-stone-700"
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Conversation thread (simple) */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-400">
                Conversation
              </p>
              <div className="mt-3 space-y-3">
                {messages.slice(1).map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-white border border-stone-200" : "bg-stone-100 border border-stone-200"}`}
                  >
                    <span className="block text-xs uppercase tracking-wide text-stone-400 mb-1">
                      {m.role}
                    </span>
                    <div className="text-stone-700">{m.text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                  placeholder='Example: "I’m relocating to Fort Moore and need pet-friendly housing under $1500"'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSend();
                  }}
                />
                <button
                  onClick={onSend}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Listings */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Suggested housing options
              </h3>
              {!readyForListings ? (
                <p className="mt-2 text-sm text-stone-500">
                  Once we know your relocating destination and budget, I’ll show
                  matching options.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {listings.length === 0 ? (
                    <div className="rounded-xl border border-stone-200 p-4 text-sm text-stone-600 md:col-span-2">
                      No matches found for those constraints. Try increasing
                      budget, changing bedrooms, or commute limit.
                    </div>
                  ) : (
                    listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="rounded-xl border border-stone-200 p-4"
                      >
                        <h4 className="font-semibold">{listing.name}</h4>
                        <p className="mt-2 text-sm text-stone-600">
                          ${listing.price} / month
                        </p>
                        <p className="text-sm text-stone-500">
                          {listing.distanceMin} min from base
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {listing.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                            {listing.beds === 0
                              ? "Studio"
                              : `${listing.beds} Bed`}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedListingId(listing.id)}
                          className="mt-4 rounded-lg border border-stone-900 px-3 py-2 text-sm font-medium text-stone-900"
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            {selected && (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-lg font-semibold">
                  Selected housing details
                </h3>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="font-medium">{selected.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Mock Address, Columbus, GA
                    </p>
                    <p className="text-sm text-stone-600">
                      ${selected.price} / month
                    </p>
                    <p className="text-sm text-stone-600">
                      {selected.distanceMin} min from base
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Steps to secure this housing</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                      <li>Contact leasing office</li>
                      <li>Schedule a tour (virtual/in-person)</li>
                      <li>Submit rental application</li>
                      <li>Provide military orders + ID</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="font-medium">Documents typically required</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                    <li>Military orders</li>
                    <li>Government-issued ID</li>
                    <li>Proof of income</li>
                    <li>Pet records (if applicable)</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Right panel */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                What I understand about your move
              </h3>
              <div className="mt-4 space-y-3">
                {mode !== "HOUSING" ? (
                  <p className="text-sm text-stone-500">
                    Describe your situation. I’ll identify your primary goal and
                    summarize key details here.
                  </p>
                ) : understandingRows.length === 0 ? (
                  <p className="text-sm text-stone-500">
                    Share a bit about your move to get started.
                  </p>
                ) : (
                  understandingRows.map((row) => (
                    <div key={row.label}>
                      <p className="text-xs uppercase tracking-wide text-stone-400">
                        {row.label}
                      </p>
                      <p className="text-sm font-medium">{row.value}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
