/* =====================================================================
   SITE CONTENT: every word, link and image on the site lives here.

   How to edit (for you or an AI tool):
   - Change the VALUES. Keep the KEYS and the overall shape.
   - Add or remove items in any list [ ... ]; the layout adapts.
   - Text is plain text (no HTML). Links: https://..., mailto:..., or #section.
   - Images go in /assets and are referenced relative to index.html.
   - Colours and fonts are NOT here; they live in theme.css.
   - After editing, open index.html (or run a local server) and check
     the browser console for errors.
   ===================================================================== */

window.SITE = {
  meta: {
    title: "Ahmad Farruk Towsif | Technical Project Coordinator",
    description:
      "Technical project coordinator in Dhaka. I turn messy briefs into software that ships on time. Python, MySQL, product management.",
    url: "https://twsf-strugg1es.github.io/",
  },

  person: {
    name: "Ahmad Farruk Towsif",
    shortName: "towsif",
    // The big ASCII word in the hero. 4 to 8 letters looks best.
    asciiWord: "TOWSIF",
    role: "Technical Project Coordinator",
    company: "NS Media",
    location: "Dhaka, Bangladesh",
    timezone: "Asia/Dhaka",
    email: "towsif2000@gmail.com",
    // Path or link to a CV. Leave "" to hide the CV button.
    cvUrl: "",
    status: "Open to conversations",
  },

  nav: [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Work", href: "#work" },
    { label: "Process", href: "#process" },
    { label: "Toolkit", href: "#toolkit" },
  ],

  hero: {
    line: "Technical project coordinator at NS Media. I turn messy briefs into software that ships on time.",
    primary: { label: "Get in touch", href: "#contact" },
    secondary: { label: "See the work", href: "#work" },
  },

  about: {
    heading: "Between the brief and the build",
    statement:
      "I sit where clients and engineers meet. I write the requirements, run the sprint, chase the blocker, and make sure what ships is what was asked for.",
    body:
      "Computer Science graduate from BRAC University. I can read the code, query the database and talk to the client in the same afternoon, which is why teams hand me the projects that have too many moving parts.",
    // Real, countable facts only. "value" animates up from 0.
    facts: [
      { value: 34, suffix: "", label: "public repositories on GitHub" },
      { value: 4, suffix: "", label: "team products shipped and documented" },
      { value: 50, suffix: "+", label: "club members coordinated at BRACU FC" },
      { value: 1, suffix: " yr", label: "running client projects at Forward Monkey" },
    ],
  },

  experience: {
    heading: "Where I've worked",
    // The timeline axis, in years. "to: null" means "now".
    axisFrom: 2022,
    axisTo: 2027,
    items: [
      {
        org: "NS Media",
        role: "Technical Project Coordinator",
        from: "2026-10",
        to: null,
        url: "",
        points: [
          "Run delivery between the content, design and engineering teams.",
          "Own timelines, requirements and release checklists for client projects.",
        ],
      },
      {
        org: "Forward Monkey",
        role: "Project Coordinator",
        from: "2025-10",
        to: "2026-10",
        url: "https://www.forwardmonkey.com/",
        points: [
          "Coordinated between clients and development teams to pin down requirements and keep deliverables aligned with user needs.",
          "Analysed project requirements and feedback to improve workflow and feature delivery.",
          "Built fm-bot-pm, a Discord bot that sets up and archives project spaces.",
        ],
      },
      {
        org: "BRAC University",
        role: "BSc, Computer Science",
        from: "2022-01",
        to: "2026-06",
        url: "",
        points: ["Graduated 2026. Coursework in databases, software engineering and AI."],
      },
      {
        org: "Football Club of BRAC University",
        role: "Executive Member",
        from: "2022-06",
        to: "2026-01",
        url: "",
        points: ["Ran event logistics and creative content for a club of 50+ members."],
      },
    ],
  },

  work: {
    heading: "Things I helped ship",
    projects: [
      {
        title: "Online Exam Management System",
        kind: "Web platform",
        year: "2025",
        summary:
          "A web exam platform built with FastAPI and React. Admins build question banks and schedule exams; students sit them in fullscreen with answers auto-saved and objective questions graded on submit.",
        role: "Product owner and backend: scoped the features, wrote the FastAPI services in Python.",
        stack: ["Python", "FastAPI", "React", "SQL"],
        links: [
          { label: "Source on GitHub", href: "https://github.com/twsf-strugg1es/Online-Exam-Management-System" },
        ],
        // Featured project: one large image plus a strip of smaller ones.
        media: {
          type: "images",
          main: { src: "assets/work/exam-dark.webp", alt: "Exam list for an admin, in dark mode, with scheduled, live and closed exams" },
          strip: [
            { src: "assets/work/exam-taking.webp", alt: "A student answering question 2 of 5 with a 27 minute timer" },
            { src: "assets/work/exam-student.webp", alt: "Student dashboard showing an exam in progress and an upcoming quiz" },
            { src: "assets/work/exam-light.webp", alt: "Admin exam list in light mode with protections per exam" },
          ],
        },
      },
      {
        title: "CourseKori",
        kind: "AI tutoring platform",
        year: "2024",
        summary:
          "An e-learning platform where learners pick up new skills with an AI tutor beside them. I built the analytics views that track engagement, quiz completion and progress, so the team could see which lessons worked.",
        role: "Coordinated developers and designers; built the analytics views.",
        stack: ["TypeScript", "AI tutor", "Analytics"],
        links: [
          { label: "Source on GitHub", href: "https://github.com/twsf-strugg1es/E-learning-Based-AI-Tutoring-System" },
        ],
        media: {
          type: "ascii",
          caption: "Lesson view with the AI tutor and progress tracking",
          art: String.raw`┌─ CourseKori ── Intro to SQL · lesson 4 ──────────┐
│                                                  │
│  progress   ████████████████░░░░░░░░░░   62%     │
│  streak     6 days            quiz  4/5 correct  │
│                                                  │
│  you    why does GROUP BY merge my NULL rows?    │
│                                                  │
│  tutor  every NULL in the key lands in one       │
│         group. Use COALESCE(city, 'unknown')     │
│         if you need them apart.                  │
│                                                  │
│  ▸ try it   ▸ next lesson   ▸ ask again          │
└──────────────────────────────────────────────────┘`,
        },
      },
      {
        title: "fm-bot-pm",
        kind: "Discord bot",
        year: "2025",
        summary:
          "A Discord bot for running projects at Forward Monkey. One command creates the project's channels and roles; another archives or deletes them when the work is done, so nobody sets up a project by hand.",
        role: "Designed the workflow and wrote the bot.",
        stack: ["JavaScript", "Discord API", "Automation"],
        links: [{ label: "Source on GitHub", href: "https://github.com/twsf-strugg1es/fm-bot-pm" }],
        media: {
          type: "ascii",
          caption: "Setting up and archiving a project from chat",
          art: String.raw`> /project create  client:acme  name:website-v2

  ✓ category   ACME · WEBSITE-V2
  ✓ channels   #brief  #design  #dev  #qa
  ✓ roles      @acme-pm  @acme-dev
  ✓ pinned     brief template, sprint board link

> /project archive  name:website-v1

  ✓ moved to   ARCHIVE
  ✓ channels   read-only
  ✓ roles      removed from 6 members

  done in 1.8s`,
        },
      },
      {
        title: "Blood Donation Camp",
        kind: "Database app",
        year: "2024",
        summary:
          "A donor and camp management system on MySQL and Django. Donors, camps and donations sit in a normalised schema, so the team can see who can give again and which camps need which blood groups.",
        role: "Team project: database design and queries.",
        stack: ["MySQL", "Django", "Python"],
        links: [{ label: "Source on GitHub", href: "https://github.com/twsf-strugg1es/Blood-Donation-Camp" }],
        media: {
          type: "ascii",
          caption: "The core of the MySQL schema",
          art: String.raw`+---------------+      +----------------+      +--------------+
| donor         |      | donation       |      | camp         |
+---------------+      +----------------+      +--------------+
| id         PK |──┐   | id          PK |   ┌──| id        PK |
| name          |  └──<| donor_id    FK |   │  | location     |
| blood_group   |      | camp_id     FK |>──┘  | held_on      |
| phone         |      | units          |      | capacity     |
| last_donated  |      | donated_on     |      +--------------+
+---------------+      +----------------+

mysql> SELECT blood_group, COUNT(*) FROM donor
    ->  WHERE last_donated < NOW() - INTERVAL 90 DAY
    ->  GROUP BY blood_group;`,
        },
      },
    ],
  },

  process: {
    heading: "How a ticket moves",
    intro: "Scroll to move one real ticket across my board.",
    ticket: { id: "EXAM-42", title: "Auto-save answers every 10s", owner: "@towsif" },
    // Short column names keep the board readable on phones.
    columns: ["Backlog", "Planned", "Building", "Review", "Shipped"],
    // Other tickets sitting on the board, one list per column (sample data).
    otherTickets: [
      ["EXAM-51 Bulk import", "EXAM-48 Dark mode"],
      ["EXAM-45 CSV export"],
      ["EXAM-44 Timer sync"],
      ["EXAM-40 Shuffle questions"],
      ["EXAM-31 Fullscreen lock", "EXAM-37 Student login"],
    ],
    // One stage per column, in the same order.
    stages: [
      {
        title: "Turn the ask into a problem",
        text: "A client says students lose answers when the wifi drops. Before anyone codes, I find out how often, on which screens, and what losing an answer costs them.",
      },
      {
        title: "Write it down",
        text: "A one-page PRD: save every 10 seconds and on every change, show a saved state, recover after reconnect. Acceptance criteria agreed with the devs, estimated, in the sprint.",
      },
      {
        title: "Clear the path",
        text: "Daily check-ins, blockers chased the same day, the client updated before they ask. Scope creep goes to the backlog, not into this ticket.",
      },
      {
        title: "Check it against the ask",
        text: "QA against each acceptance criterion, a pulled network cable included. Then a demo to the client on their own laptop.",
      },
      {
        title: "Close the loop",
        text: "Release notes in plain words, a look at the numbers a week later, and what we learned goes back into the backlog.",
      },
    ],
  },

  toolkit: {
    heading: "What's in the toolkit",
    query: "SELECT skill, area, used_for FROM toolkit;",
    rows: [
      { skill: "Python", area: "code", used_for: "FastAPI services, scripts" },
      { skill: "MySQL / SQL", area: "data", used_for: "Schemas, reporting queries" },
      { skill: "Product management", area: "product", used_for: "PRDs, roadmaps, sprints" },
      { skill: "Agile / SDLC", area: "process", used_for: "Sprint planning, reviews" },
      { skill: "Jira, ClickUp", area: "tools", used_for: "Boards, tickets, reports" },
      { skill: "Notion, Workspace", area: "tools", used_for: "Docs, specs, meeting notes" },
      { skill: "Figma", area: "design", used_for: "Wireframes, handoff" },
      { skill: "Power BI", area: "data", used_for: "Engagement dashboards" },
      { skill: "n8n, Claude", area: "automation", used_for: "Workflows, AI drafting" },
    ],
    certificationsHeading: "Certificates",
    certifications: [
      { name: "Product Management Career Bootcamp", issuer: "Human Development Network Bangladesh", year: "2026, in progress" },
      { name: "Introduction to User Experience Design", issuer: "Georgia Institute of Technology, Coursera", year: "2026" },
      { name: "Google AI Essentials", issuer: "Google Career Certificates", year: "2025" },
    ],
  },

  contact: {
    heading: "Let's ship the next one",
    line: "Hiring a coordinator, or have a project with too many moving parts? Write to me. I answer within a day.",
    links: [
      { label: "GitHub", href: "https://github.com/twsf-strugg1es" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmad-farruk-towsif/" },
    ],
  },

  footer: {
    note: "Made in Dhaka.",
  },
};
