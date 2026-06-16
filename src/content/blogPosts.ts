export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  publishedAt: string;
  readMinutes: number;
  category: string;
  excerpt: string;
  // Body is an array of blocks for clean rendering and great semantic HTML
  body: Array<
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "quote"; text: string; cite?: string }
  >;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-stop-overthinking-decisions",
    title: "How to Stop Overthinking Decisions: A 5-Step Framework That Actually Works",
    description:
      "Overthinking kills more good decisions than bad data ever will. Use this 5-step decision-making framework to break analysis paralysis and choose with clarity.",
    keywords:
      "how to stop overthinking, overthinking decisions, analysis paralysis, decision making framework, decision fatigue, how to make decisions faster",
    publishedAt: "2026-06-10",
    readMinutes: 7,
    category: "Decision Frameworks",
    excerpt:
      "Analysis paralysis is rarely about the decision in front of you — it is about the fear underneath it. Here is the exact 5-step framework we use inside Clair to help people move from spiraling to deciding in under 10 minutes.",
    body: [
      {
        type: "p",
        text: "If you have ever spent two weeks deciding whether to take a job, send an email, or end a relationship, you already know: overthinking is not careful thinking. It is the same thought running on a loop, dressed up as diligence. The cost is not just time — it is the slow erosion of self-trust that happens every time you delay a decision you already know the answer to.",
      },
      { type: "h2", text: "Why we overthink (and why willpower will not fix it)" },
      {
        type: "p",
        text: "Overthinking is almost always a regulation problem, not an information problem. The brain loops because looping feels safer than committing. More research, more pros-and-cons lists, more advice — none of it lowers the underlying fear of being wrong. To stop overthinking, you need a structure that makes the fear visible and then makes the next step obvious.",
      },
      { type: "h2", text: "The 5-step framework to stop overthinking any decision" },
      { type: "h3", text: "Step 1. Name the actual decision in one sentence" },
      {
        type: "p",
        text: "Most overthinking happens because the decision is fuzzy. \"Should I change careers?\" is not a decision — it is a topic. \"Should I accept the offer from Company X by Friday?\" is a decision. Force yourself to write it in one sentence with a deadline. If you cannot, you are not ready to decide; you are ready to research.",
      },
      { type: "h3", text: "Step 2. Identify the fear underneath" },
      {
        type: "p",
        text: "Ask: if I knew this would work out, would I still be struggling? Almost always the answer is no. The struggle is not the decision — it is the fear of regret, judgment, or loss. Write the fear in plain language. Naming it strips it of about half its power.",
      },
      { type: "h3", text: "Step 3. Run the reversibility test" },
      {
        type: "p",
        text: "Jeff Bezos calls these one-way and two-way doors. If the decision is reversible (a two-way door), you are allowed to decide in minutes, not weeks. Most decisions people overthink are two-way doors being treated like one-way doors. Ask: if this is wrong, what does it cost me to undo it?",
      },
      { type: "h3", text: "Step 4. Imagine the worst, best, and likely case" },
      {
        type: "p",
        text: "Spend two minutes on each. Not vaguely — write the actual sentence you would say to a friend describing each outcome. The worst case is almost always survivable. The best case is almost always under-imagined. The likely case is what you should actually plan around.",
      },
      { type: "h3", text: "Step 5. Lock the decision and define the review date" },
      {
        type: "p",
        text: "Overthinking thrives on infinite re-litigation. When you decide, write down the decision, the reasons, and a date 30 or 90 days out when you will review the outcome. Until that date, the decision is closed. This is the single highest-leverage habit you can build.",
      },
      { type: "h2", text: "What changes when you stop overthinking" },
      {
        type: "ul",
        items: [
          "You reclaim hours of mental bandwidth per week.",
          "You build a track record of decisions you can learn from, instead of a graveyard of unmade ones.",
          "You stop confusing rumination with responsibility.",
          "You start trusting yourself again, which is the real prize.",
        ],
      },
      {
        type: "quote",
        text: "A good decision made today beats a perfect decision made next month — because the perfect one usually never comes.",
      },
      {
        type: "p",
        text: "This is the exact loop Clair walks you through, step by step, in about ten minutes. If you would rather not run the framework alone, that is what the app is for.",
      },
    ],
  },
  {
    slug: "best-decision-making-frameworks-2026",
    title: "The 7 Best Decision-Making Frameworks in 2026 (With Examples)",
    description:
      "From WRAP and Eisenhower to second-order thinking and pre-mortems — the 7 decision-making frameworks high-performers actually use in 2026, with real examples.",
    keywords:
      "decision making frameworks, best decision making models, WRAP framework, Eisenhower matrix, second order thinking, pre-mortem, decision matrix, how to make better decisions",
    publishedAt: "2026-06-12",
    readMinutes: 9,
    category: "Decision Frameworks",
    excerpt:
      "Frameworks do not make decisions for you. They force you to think in a structure that bias cannot easily hijack. These seven are the ones that consistently hold up under pressure.",
    body: [
      {
        type: "p",
        text: "There are hundreds of decision-making frameworks. Most are reskins of the same three or four ideas. Below are the seven that genuinely change the quality of your thinking — chosen because they each correct a specific, common failure mode of the human brain.",
      },
      { type: "h2", text: "1. WRAP (Chip and Dan Heath)" },
      {
        type: "p",
        text: "Widen options, Reality-test assumptions, Attain distance, Prepare to be wrong. WRAP is the strongest single framework for everyday decisions because it directly attacks the four biggest decision sins: narrow framing, confirmation bias, short-term emotion, and overconfidence.",
      },
      { type: "h2", text: "2. The Eisenhower Matrix" },
      {
        type: "p",
        text: "Urgent vs important. Used for prioritization rather than single decisions, but indispensable when you are deciding what to even spend decision energy on. Most overwhelm is a prioritization problem masquerading as a decision problem.",
      },
      { type: "h2", text: "3. Second-Order Thinking" },
      {
        type: "p",
        text: "Popularized by Howard Marks and Ray Dalio. Ask: \"and then what?\" three times. Most bad decisions look great at the first order and disastrous at the third. If you only learn one framework from this list, learn this one.",
      },
      { type: "h2", text: "4. The Pre-Mortem (Gary Klein)" },
      {
        type: "p",
        text: "Imagine it is one year from now and the decision failed catastrophically. Write the story of how it failed. This works because the brain is far better at generating reasons for a known outcome than at predicting risk in the abstract.",
      },
      { type: "h2", text: "5. The 10/10/10 Rule (Suzy Welch)" },
      {
        type: "p",
        text: "How will I feel about this in 10 minutes, 10 months, and 10 years? Forces temporal distance, which is the single most effective antidote to short-term emotional bias.",
      },
      { type: "h2", text: "6. Expected Value / Decision Matrix" },
      {
        type: "p",
        text: "List options, weight criteria, score each. The output is less important than the process — the act of being forced to name your criteria reveals what you actually care about, which is usually different from what you said you cared about.",
      },
      { type: "h2", text: "7. The Regret Minimization Framework (Jeff Bezos)" },
      {
        type: "p",
        text: "At 80, looking back, which choice will you regret less? Brutally effective for asymmetric, life-shaping decisions where the downside of inaction is invisible but enormous.",
      },
      { type: "h2", text: "How to pick the right framework" },
      {
        type: "ul",
        items: [
          "Reversible, low-stakes: just decide. No framework needed.",
          "Reversible, high-stakes: WRAP or a decision matrix.",
          "Irreversible, high-stakes: pre-mortem plus regret minimization plus second-order thinking.",
          "Emotionally charged: 10/10/10 first, then any of the above.",
        ],
      },
      {
        type: "p",
        text: "Clair stitches the strongest pieces of these frameworks into a single guided flow — deconstruction, scenarios, bias check, second-order, lock — so you do not have to remember which one to reach for.",
      },
    ],
  },
  {
    slug: "cognitive-biases-ruining-your-decisions",
    title: "9 Cognitive Biases Quietly Ruining Your Decisions (And How to Beat Them)",
    description:
      "The 9 cognitive biases that distort everyday decisions the most — confirmation, sunk cost, anchoring, availability and more — with practical counter-moves for each.",
    keywords:
      "cognitive biases, confirmation bias, sunk cost fallacy, anchoring bias, availability heuristic, decision biases, how to overcome bias, behavioral economics",
    publishedAt: "2026-06-14",
    readMinutes: 8,
    category: "Behavioral Science",
    excerpt:
      "You do not have a thinking problem. You have a bias problem — and so does everyone else. Knowing the bias by name is the first half of the cure.",
    body: [
      {
        type: "p",
        text: "Cognitive biases are not rare glitches. They are the default settings of the human mind, optimized for survival on the savanna and dangerously miscalibrated for modern decisions about money, careers, and relationships. The nine below show up in almost every difficult decision we have walked users through inside Clair.",
      },
      { type: "h2", text: "1. Confirmation bias" },
      { type: "p", text: "You seek out evidence that supports what you already believe. Counter-move: before researching, write down what evidence would change your mind. Then go look for that specifically." },
      { type: "h2", text: "2. Sunk cost fallacy" },
      { type: "p", text: "You keep going because of what you have already spent. Counter-move: ask, \"If I were deciding fresh today, with no history, would I start this?\" If no, the cost is sunk; walk." },
      { type: "h2", text: "3. Anchoring" },
      { type: "p", text: "The first number you hear sets your reference point. Counter-move: generate your own estimate before seeing any external number." },
      { type: "h2", text: "4. Availability heuristic" },
      { type: "p", text: "You overweight what comes to mind easily — usually recent or vivid examples. Counter-move: actively look for base rates instead of stories." },
      { type: "h2", text: "5. Loss aversion" },
      { type: "p", text: "Losses feel roughly twice as bad as equivalent gains feel good, so we avoid risk irrationally. Counter-move: reframe the choice as \"what am I giving up by not acting?\"" },
      { type: "h2", text: "6. Status quo bias" },
      { type: "p", text: "Whatever currently exists feels safer than change, even when staying is the riskier option. Counter-move: imagine the status quo was the new option. Would you choose it?" },
      { type: "h2", text: "7. Overconfidence bias" },
      { type: "p", text: "You believe your forecast is more accurate than it is. Counter-move: give every prediction a confidence interval, not a point estimate." },
      { type: "h2", text: "8. Hindsight bias" },
      { type: "p", text: "After the fact, you believe you knew it all along — which destroys your ability to learn. Counter-move: write down your prediction and reasoning before the outcome, every time." },
      { type: "h2", text: "9. The planning fallacy" },
      { type: "p", text: "You consistently underestimate how long things will take. Counter-move: use the outside view — look at how long similar things took other people, not how long you think yours will take." },
      { type: "h2", text: "The meta-move" },
      {
        type: "p",
        text: "You will never debias yourself in the moment by sheer willpower. The trick is to install a checklist that runs automatically when stakes are high. That is exactly what the bias-check step in Clair does — and why every decision you run through it tends to come out cleaner than the one you would have made alone.",
      },
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);
