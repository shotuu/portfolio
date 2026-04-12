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
    title: 'Whales Chat',
    description: 'A real-time chat platform built with Flask and Socket.IO. Features user authentication, persistent message history in SQLite, an admin dashboard, and CSV export of chat logs.',
    tags: ['Python', 'Flask', 'Socket.IO', 'SQLite'],
    github: 'https://github.com/shotuu/whales-chat',
    featured: true,
  },
  {
    title: 'SAFTI-Update',
    description: 'A Telegram automation bot that monitors source channels for WBGT and CAT status alerts, parses them with Singapore-timezone awareness, and forwards formatted updates to a destination channel.',
    tags: ['Python', 'Telethon', 'Automation'],
    github: 'https://github.com/shotuu/SAFTI-Update',
    featured: true,
  },
];
