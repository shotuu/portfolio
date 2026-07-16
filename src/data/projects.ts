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
];
