export interface SeedLesson {
  title: string;
  durationMin: number;
  videoUrl: string;
  notes: string;
}
export interface SeedModule {
  title: string;
  lessons: SeedLesson[];
}
export interface SeedCourse {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  instructor: string;
  price: number;
  originalPrice: number;
  features: string[];
  modules: SeedModule[];
  published: boolean;
  enrolledCount: number;
}

function mod(title: string, lessons: Array<[string, number]>): SeedModule {
  return {
    title,
    lessons: lessons.map(([t, d]) => ({
      title: t,
      durationMin: d,
      videoUrl: "",
      notes: "Add a YouTube or Vimeo link for this lesson from the admin panel (Courses > Edit).",
    })),
  };
}

export const seedCourses: SeedCourse[] = [
  {
    title: "Full-Stack MERN Development",
    slug: "full-stack-mern-development",
    shortDescription: "Build and deploy production-grade apps with MongoDB, Express, React and Node.js.",
    description:
      "A project-driven programme that takes you from JavaScript fundamentals to shipping complete MERN applications. You will design REST APIs, model data in MongoDB, build responsive React interfaces, add authentication and payments, and deploy to the cloud with CI/CD.",
    category: "Web Development",
    level: "Intermediate",
    durationWeeks: 16,
    instructor: "Team Algovita",
    price: 14999,
    originalPrice: 24999,
    features: ["6 real-world capstone projects", "Live doubt-clearing sessions", "Git, CI/CD and cloud deployment", "Placement-oriented portfolio reviews", "Lifetime access to recordings"],
    modules: [
      mod("Modern JavaScript & Tooling", [["ES2024 essentials", 38], ["Async patterns & the event loop", 42], ["npm, Git and project workflow", 30]]),
      mod("Backend with Node & Express", [["REST API design", 45], ["Authentication with JWT", 52], ["Validation and error handling", 36]]),
      mod("MongoDB & Mongoose", [["Schema design", 40], ["Indexes and aggregation", 48], ["Transactions and data integrity", 34]]),
      mod("React Frontend", [["Components and hooks", 50], ["State management", 44], ["Forms, routing and data fetching", 46]]),
      mod("Deploy & Scale", [["Docker basics", 35], ["CI/CD pipelines", 40], ["Monitoring and logging", 28]]),
    ],
    published: true,
    enrolledCount: 412,
  },
  {
    title: "Next.js & TypeScript Mastery",
    slug: "nextjs-typescript-mastery",
    shortDescription: "Ship fast, SEO-friendly apps with the Next.js App Router and strict TypeScript.",
    description:
      "Learn the App Router, server components, route handlers, streaming and caching. Build a full SaaS-style product with type-safe APIs, authentication, a database and payments, while mastering the TypeScript patterns used in professional teams.",
    category: "Web Development",
    level: "Intermediate",
    durationWeeks: 8,
    instructor: "Team Algovita",
    price: 8999,
    originalPrice: 13999,
    features: ["Server & client components in depth", "Type-safe API patterns", "Authentication and middleware", "Performance and Core Web Vitals", "Deployment on Vercel and VPS"],
    modules: [
      mod("TypeScript for Real Projects", [["Types, generics and narrowing", 44], ["Utility types and inference", 38], ["Typing APIs and forms", 32]]),
      mod("App Router Fundamentals", [["Layouts, routing and metadata", 40], ["Server vs client components", 46], ["Data fetching and caching", 42]]),
      mod("Full-Stack Features", [["Route handlers", 36], ["Auth and protected routes", 50], ["Payments integration", 48]]),
    ],
    published: true,
    enrolledCount: 286,
  },
  {
    title: "AI Automation with LLMs",
    slug: "ai-automation-with-llms",
    shortDescription: "Design AI agents and workflows that automate real business processes.",
    description:
      "Go beyond prompting. Learn to build reliable LLM-powered workflows: structured outputs, tool use, retrieval-augmented generation, agents, evaluation and cost control. Finish with a deployable automation for a real business use case.",
    category: "AI & Automation",
    level: "Intermediate",
    durationWeeks: 8,
    instructor: "Team Algovita",
    price: 11999,
    originalPrice: 17999,
    features: ["Agents, tools and RAG pipelines", "Evaluation and guardrails", "No-code and code-first workflows", "Cost and latency optimisation", "Client-ready automation project"],
    modules: [
      mod("LLM Foundations", [["How language models work", 36], ["Prompting that scales", 40], ["Structured outputs", 34]]),
      mod("Tools & Retrieval", [["Function calling", 42], ["Embeddings and vector search", 48], ["Building a RAG pipeline", 52]]),
      mod("Agents in Production", [["Agent design patterns", 44], ["Evaluation and monitoring", 38], ["Deploying automations", 36]]),
    ],
    published: true,
    enrolledCount: 358,
  },
  {
    title: "Python & Data Science Bootcamp",
    slug: "python-data-science-bootcamp",
    shortDescription: "From Python basics to analysis, visualisation and machine learning models.",
    description:
      "Start with Python and finish with machine learning. Work with real datasets using NumPy, Pandas and Matplotlib, learn statistics that matter, and train, evaluate and deploy your first predictive models.",
    category: "Data & AI",
    level: "Beginner",
    durationWeeks: 12,
    instructor: "Team Algovita",
    price: 9999,
    originalPrice: 15999,
    features: ["Hands-on with real datasets", "Statistics made practical", "Scikit-learn model building", "Dashboards and storytelling", "Kaggle-style capstone"],
    modules: [
      mod("Python Foundations", [["Syntax, data types and control flow", 45], ["Functions and modules", 38], ["Working with files and APIs", 34]]),
      mod("Data Analysis", [["NumPy essentials", 40], ["Pandas for analysis", 52], ["Visualisation with Matplotlib", 36]]),
      mod("Machine Learning", [["Regression and classification", 54], ["Model evaluation", 42], ["Shipping a model", 40]]),
    ],
    published: true,
    enrolledCount: 519,
  },
  {
    title: "UI/UX Design with Figma",
    slug: "ui-ux-design-with-figma",
    shortDescription: "Research, wireframe, prototype and hand off interfaces developers love.",
    description:
      "Learn the full product design process: user research, information architecture, wireframes, design systems, interactive prototypes and developer hand-off. Build a case-study portfolio you can show employers and clients.",
    category: "Design",
    level: "Beginner",
    durationWeeks: 6,
    instructor: "Team Algovita",
    price: 6999,
    originalPrice: 10999,
    features: ["Design systems and components", "Auto-layout and prototyping", "Usability testing methods", "3 portfolio case studies", "Developer hand-off workflow"],
    modules: [
      mod("Design Thinking", [["User research basics", 34], ["Personas and journeys", 30], ["Information architecture", 32]]),
      mod("Figma in Practice", [["Frames, auto-layout and components", 46], ["Building a design system", 50], ["Interactive prototypes", 38]]),
    ],
    published: true,
    enrolledCount: 233,
  },
  {
    title: "DevOps & Cloud Engineering",
    slug: "devops-cloud-engineering",
    shortDescription: "Containers, CI/CD, infrastructure as code and monitoring on AWS.",
    description:
      "Automate everything from commit to production. Learn Linux, Docker, Kubernetes basics, GitHub Actions, Terraform and AWS core services, then set up observability and reliability practices used by modern engineering teams.",
    category: "Cloud & DevOps",
    level: "Advanced",
    durationWeeks: 10,
    instructor: "Team Algovita",
    price: 12999,
    originalPrice: 19999,
    features: ["Docker and Kubernetes essentials", "Terraform infrastructure as code", "GitHub Actions pipelines", "AWS core services", "Monitoring and incident response"],
    modules: [
      mod("Linux & Containers", [["Linux for engineers", 42], ["Docker deep dive", 48], ["Compose and networking", 34]]),
      mod("CI/CD & IaC", [["GitHub Actions pipelines", 44], ["Terraform fundamentals", 50], ["Environments and secrets", 30]]),
      mod("Cloud & Reliability", [["AWS core services", 52], ["Observability stack", 40], ["SRE practices", 36]]),
    ],
    published: true,
    enrolledCount: 174,
  },
  {
    title: "Web Development Foundations",
    slug: "web-development-foundations",
    shortDescription: "A free starter course covering HTML, CSS and JavaScript basics.",
    description:
      "New to coding? Start here. Build your first responsive web page with HTML and CSS, then add interactivity with JavaScript. A free, no-pressure introduction that prepares you for our full programmes.",
    category: "Web Development",
    level: "Beginner",
    durationWeeks: 2,
    instructor: "Team Algovita",
    price: 0,
    originalPrice: 0,
    features: ["No prior experience needed", "Build 3 mini projects", "Certificate of completion", "Pathway to full programmes"],
    modules: [
      mod("HTML & CSS Basics", [["Your first web page", 24], ["Layout with Flexbox", 28], ["Responsive design", 26]]),
      mod("JavaScript Basics", [["Variables and functions", 30], ["The DOM", 32], ["Mini project: to-do app", 40]]),
    ],
    published: true,
    enrolledCount: 1204,
  },
];
