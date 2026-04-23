export const careerStats = [
  { label: "Career Score", value: 87, change: "+12", icon: "trophy" },
  { label: "Skills Mastered", value: 24, change: "+3", icon: "brain" },
  { label: "Interview Ready", value: 94, change: "+8%", icon: "mic" },
  { label: "Applications", value: 12, change: "+4", icon: "briefcase" },
];

export const progressData = [
  { week: "W1", score: 52 },
  { week: "W2", score: 58 },
  { week: "W3", score: 61 },
  { week: "W4", score: 65 },
  { week: "W5", score: 70 },
  { week: "W6", score: 76 },
  { week: "W7", score: 82 },
  { week: "W8", score: 87 },
];

export const skillData = [
  { skill: "System Design", value: 78 },
  { skill: "Algorithms", value: 85 },
  { skill: "Communication", value: 92 },
  { skill: "Leadership", value: 68 },
  { skill: "Product", value: 74 },
  { skill: "Negotiation", value: 81 },
];

export const activityData = [
  { day: "Mon", lessons: 4, mocks: 1 },
  { day: "Tue", lessons: 6, mocks: 2 },
  { day: "Wed", lessons: 3, mocks: 0 },
  { day: "Thu", lessons: 8, mocks: 3 },
  { day: "Fri", lessons: 5, mocks: 1 },
  { day: "Sat", lessons: 2, mocks: 1 },
  { day: "Sun", lessons: 4, mocks: 2 },
];

export const roadmapMilestones = [
  {
    id: 1,
    title: "Foundations",
    status: "done" as const,
    progress: 100,
    items: ["Audit current resume", "Define 90-day goals", "Identify 3 target companies"],
  },
  {
    id: 2,
    title: "Skill Sprint",
    status: "active" as const,
    progress: 64,
    items: ["Master system design basics", "Complete 30 LeetCode mediums", "Refactor portfolio"],
  },
  {
    id: 3,
    title: "Application Phase",
    status: "upcoming" as const,
    progress: 0,
    items: ["Apply to 25 roles", "Network with 10 senior engineers", "Tailor cover letters"],
  },
  {
    id: 4,
    title: "Interview Prep",
    status: "upcoming" as const,
    progress: 0,
    items: ["10 mock interviews", "Behavioral story bank", "Salary negotiation playbook"],
  },
  {
    id: 5,
    title: "Offer & Negotiation",
    status: "upcoming" as const,
    progress: 0,
    items: ["Compare offers", "Negotiate base + equity", "Sign and announce"],
  },
];

export const jobs = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Linear",
    logo: "L",
    location: "Remote · Worldwide",
    salary: "$160k–$210k",
    match: 96,
    tags: ["React", "TypeScript", "Design Systems"],
    posted: "2d ago",
  },
  {
    id: 2,
    title: "Staff Product Designer",
    company: "Vercel",
    logo: "V",
    location: "San Francisco · Hybrid",
    salary: "$190k–$240k",
    match: 91,
    tags: ["Figma", "Systems", "Brand"],
    posted: "1d ago",
  },
  {
    id: 3,
    title: "AI Product Manager",
    company: "Notion",
    logo: "N",
    location: "Remote · US",
    salary: "$170k–$220k",
    match: 88,
    tags: ["LLM", "Strategy", "B2B SaaS"],
    posted: "5h ago",
  },
  {
    id: 4,
    title: "Full-Stack Engineer",
    company: "Stripe",
    logo: "S",
    location: "Remote · EU",
    salary: "$140k–$190k",
    match: 84,
    tags: ["Node", "React", "Payments"],
    posted: "3d ago",
  },
  {
    id: 5,
    title: "Engineering Manager",
    company: "Figma",
    logo: "F",
    location: "New York · Onsite",
    salary: "$220k–$290k",
    match: 79,
    tags: ["Leadership", "Hiring", "Frontend"],
    posted: "1w ago",
  },
  {
    id: 6,
    title: "Growth Engineer",
    company: "Cal.com",
    logo: "C",
    location: "Remote · Worldwide",
    salary: "$120k–$170k",
    match: 86,
    tags: ["A/B", "Analytics", "Next.js"],
    posted: "4d ago",
  },
];

export const interviewQuestions = [
  {
    id: 1,
    type: "Behavioral",
    question: "Tell me about a time you disagreed with your manager.",
    difficulty: "Medium",
  },
  {
    id: 2,
    type: "System Design",
    question: "Design a real-time collaborative document editor.",
    difficulty: "Hard",
  },
  {
    id: 3,
    type: "Coding",
    question: "Implement an LRU cache with O(1) get and put.",
    difficulty: "Medium",
  },
  {
    id: 4,
    type: "Behavioral",
    question: "Describe your most ambitious project and what you learned.",
    difficulty: "Easy",
  },
  {
    id: 5,
    type: "Product",
    question: "How would you improve Spotify's discovery experience?",
    difficulty: "Hard",
  },
];

export const initialChatMessages = [
  {
    id: "1",
    role: "assistant" as const,
    content:
      "Hey Alex 👋 I've reviewed your week. You shipped 3 milestones — well above your average. Want to talk about your Linear interview prep or the offer you're weighing?",
    time: "Just now",
  },
];
