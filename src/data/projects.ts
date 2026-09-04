export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    title: 'Telos',
    description: 'A precision protocol tracker for people who take their regimens seriously. Telos builds dosing stacks from a 43+ compound reference library, handles reconstitution and syringe-draw math automatically, and pairs it with an AI research assistant that answers questions with cited sources. Offline-first PWA — your data lives on-device first and syncs when you sign in.',
    tags: ['React', 'Vite', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Claude API', 'PWA'],
    link: 'https://telostrack.com',
    featured: true,
  },
  {
    title: 'Synth',
    description: 'A privacy-first, context-aware meeting and note-taking assistant (a fork of Meetily). Synth transcribes meetings, lectures, and conversations fully on-device with real speaker diarization, then generates AI summaries shaped to what you were doing — a meeting, a lecture, or a study group — with no audio or transcript ever leaving your machine unless you opt into a cloud provider.',
    tags: ['Rust', 'Tauri 2', 'Next.js', 'TypeScript', 'Whisper.cpp', 'ONNX', 'SQLite'],
    github: 'https://github.com/shotuu/synth',
    featured: true,
  },
  {
    title: 'Hatch',
    description: 'A group-chat planning prototype built at LA Hacks 2026. Hatch gives a friend group\'s chat a living "nest" that cools during silence and warms up when the group books a plan together — synthesizing event suggestions, running group approval, and writing confirmed plans to everyone\'s Google Calendar.',
    tags: ['Python', 'FastAPI', 'LangGraph', 'Fetch.ai uAgents', 'React', 'TypeScript', 'LA Hacks 2026'],
    github: 'https://github.com/shotuu/hatch',
    featured: true,
  },
  {
    title: 'Meadow',
    description: 'A personal finance app that answers where the money actually goes. Syncs transactions automatically from US/EU banks via Plaid, Singapore banks via Finverse, and brokerage holdings via IBKR Flex Query, then categorizes them with rule-based matching that learns from corrections plus a Gemini AI fallback. Three budgeting modes (monthly reset, rollover envelopes, sinking funds) run on one shared engine, with net worth, recurring-charge detection, and a real installable PWA.',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Plaid', 'Tailwind CSS', 'PWA'],
    github: 'https://github.com/shotuu/meadow',
    featured: true,
  },
  {
    title: 'Whales Chat',
    description: 'A real-time chat platform built with Flask and Socket.IO. Features user authentication, persistent message history in SQLite, an admin dashboard, and CSV export of chat logs.',
    tags: ['Python', 'Flask', 'Socket.IO', 'SQLite'],
    github: 'https://github.com/shotuu/whales-chat',
    featured: false,
  },
  {
    title: 'SAFTI-Update',
    description: 'A Telegram automation bot that monitors source channels for WBGT and CAT status alerts, parses them with Singapore-timezone awareness, and forwards formatted updates to a destination channel.',
    tags: ['Python', 'Telethon', 'Automation'],
    github: 'https://github.com/shotuu/SAFTI-Update',
    featured: false,
  },
  {
    title: 'shotu-dotfiles',
    description: 'A cross-platform terminal and Neovim setup for macOS, Linux, and Windows (native + WSL): WezTerm, tmux, Neovim, and Starship under a consistent Rosé Pine Moon theme, with platform-adaptive installer scripts that detect the OS and wire up Homebrew/zsh or winget/PowerShell accordingly.',
    tags: ['Lua', 'Shell', 'PowerShell', 'WezTerm', 'Neovim', 'tmux', 'Homebrew'],
    github: 'https://github.com/shotuu/dotfiles',
    featured: false,
  },
  {
    title: 'Pulse',
    description: 'A live file tree for watching a repo change in real time — every add, edit, delete, and rename since your last commit, rendered the instant it happens. Built for watching AI coding agents work through a codebase, with a scrollable, syntax-highlighted diff view and a one-command installer.',
    tags: ['Node.js', 'React', 'Ink', 'Chokidar', 'CLI'],
    github: 'https://github.com/shotuu/pulse',
    featured: false,
  },
];
