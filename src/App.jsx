export default function CareerCorpsHousingPrototype() {
  const chips = ["Find Housing", "Find a Job", "Childcare", "New to the Area"];
  const followUps = [
    {
      q: "Where are you relocating to?",
      a: "Fort Moore, GA",
    },
    {
      q: "What monthly budget feels realistic for you?",
      a: "$1,400 / month",
    },
    {
      q: "Any must-haves like pets, commute, or number of bedrooms?",
      a: "Pet-friendly, 2 bedrooms, under 15 minutes from base",
    },
  ];

  const listings = [
    {
      name: "Pine Ridge Apartments",
      price: "$1,350 / month",
      distance: "8 min from Fort Moore",
      tags: ["Apartment", "Pet Friendly", "2 Bed"],
    },
    {
      name: "Liberty Oaks Townhomes",
      price: "$1,480 / month",
      distance: "12 min from Fort Moore",
      tags: ["Townhome", "Washer/Dryer", "2 Bed"],
    },
    {
      name: "Riverwalk Homes",
      price: "$1,525 / month",
      distance: "14 min from Fort Moore",
      tags: ["House", "Yard", "Pet Friendly"],
    },
  ];

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
                  className={`rounded-lg border px-3 py-2 ${item === "Housing" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600"}`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-sm font-medium text-stone-500">
              Start here
            </p>
            <h2 className="text-2xl font-semibold">Tell us what you need.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Describe your situation naturally. The system will infer your
              goal, ask a few follow-up questions, and build a personalized
              plan.
            </p>

            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-400">
                Your message
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-700">
                I’m currently in Atlanta and relocating to Fort Moore. I need
                pet-friendly housing near the base, ideally a 2-bedroom place
                around $1400 a month.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-sm text-stone-700"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Follow-up questions</h3>
              <p className="mt-1 text-sm text-stone-500">
                Conversational prompts based on missing information.
              </p>

              <div className="mt-4 space-y-4">
                {followUps.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <p className="text-sm font-medium text-stone-800">
                      {item.q}
                    </p>
                    <div className="mt-3 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-600">
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Suggested housing options
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {listings.map((listing) => (
                  <div
                    key={listing.name}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <h4 className="font-semibold">{listing.name}</h4>
                    <p className="mt-2 text-sm text-stone-600">
                      {listing.price}
                    </p>
                    <p className="text-sm text-stone-500">{listing.distance}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {listing.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="mt-4 rounded-lg border border-stone-900 px-3 py-2 text-sm font-medium text-stone-900">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-lg font-semibold">
                Selected housing details
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="font-medium">Pine Ridge Apartments</p>
                  <p className="mt-1 text-sm text-stone-600">
                    1234 Victory Lane, Columbus, GA
                  </p>
                  <p className="text-sm text-stone-600">$1,350 / month</p>
                  <p className="text-sm text-stone-600">
                    8 min from Fort Moore
                  </p>
                </div>
                <div>
                  <p className="font-medium">Steps to secure this housing</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                    <li>Contact the leasing office</li>
                    <li>Schedule a tour or virtual walkthrough</li>
                    <li>Submit the rental application</li>
                    <li>Upload military orders and ID</li>
                  </ul>
                </div>
              </div>
              <div className="mt-5">
                <p className="font-medium">Documents typically required</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                  <li>Military orders</li>
                  <li>Government-issued ID</li>
                  <li>Proof of income</li>
                  <li>Pet records if applicable</li>
                </ul>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                What I understand about your move
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    Currently in
                  </p>
                  <p className="text-sm font-medium">Atlanta, GA</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    Relocating to
                  </p>
                  <p className="text-sm font-medium">
                    Fort Moore / Columbus, GA
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    Goal
                  </p>
                  <p className="text-sm font-medium">Find Housing</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    Budget
                  </p>
                  <p className="text-sm font-medium">Around $1,400 / month</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    Must-haves
                  </p>
                  <p className="text-sm font-medium">
                    Pet friendly, 2 bedrooms, near base
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5">
              <h3 className="text-lg font-semibold">Community insights</h3>
              <p className="mt-2 text-sm text-stone-500">
                Placeholder for spouse comments, mentor notes, and shared tips
                about housing options.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5">
              <h3 className="text-lg font-semibold">Chatbot</h3>
              <p className="mt-2 text-sm text-stone-500">
                Placeholder for the existing chatbot from last semester.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
