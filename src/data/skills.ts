// Ordered strongest first. Each row lists only tools used in real work. `sources`
// is the "where" behind the row, revealed as a tree when the row is expanded, so every
// line is something I can back up in an interview.
export interface SkillSource {
  place: string;
  tools: string;
}

export interface SkillGroup {
  label: string;
  /** Directory-style name shown in the tree's `$ tree <dir>/` prompt line. */
  dir: string;
  items: string[];
  sources: SkillSource[];
}

export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    dir: 'languages',
    items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'Bash'],
    sources: [
      { place: 'DIS intel pipeline', tools: 'Python' },
      { place: 'Hatch', tools: 'Python, TypeScript' },
      { place: 'Meadow', tools: 'TypeScript, SQL' },
      { place: 'Synth', tools: 'TypeScript' },
      { place: 'Telos', tools: 'JavaScript, SQL' },
      { place: 'UCLA coursework', tools: 'C++, Bash' },
    ],
  },
  {
    label: 'Web & apps',
    dir: 'web',
    items: ['React', 'Next.js', 'Node.js', 'FastAPI', 'PostgreSQL', 'Prisma'],
    sources: [
      { place: 'Telos', tools: 'React, Node.js, PostgreSQL, Prisma' },
      { place: 'Meadow', tools: 'Next.js, PostgreSQL, Prisma' },
      { place: 'Hatch', tools: 'React, FastAPI' },
    ],
  },
  {
    label: 'Cloud & infra',
    dir: 'infra',
    items: ['GCP', 'Kubernetes', 'Docker', 'GitHub Actions', 'Linux'],
    sources: [
      { place: 'LA CTF', tools: 'GCP, Kubernetes, Docker, GitHub Actions' },
      { place: 'Officer cadet training', tools: 'Linux' },
    ],
  },
  {
    label: 'Security',
    dir: 'security',
    items: ['OSINT', 'MITRE ATT&CK', 'Wireshark', 'nmap', 'Scapy', 'Volatility'],
    sources: [
      { place: 'DIS threat intel', tools: 'OSINT, MITRE ATT&CK' },
      { place: 'Officer cadet training', tools: 'Wireshark, nmap, Scapy, Volatility' },
    ],
  },
  {
    label: 'AI & data',
    dir: 'ai',
    items: ['LLM APIs', 'Whisper', 'OpenCV', 'TensorFlow'],
    sources: [
      { place: 'DIS intel pipeline', tools: 'LLM parsing' },
      { place: 'Telos', tools: 'Claude API' },
      { place: 'Meadow', tools: 'Gemini API' },
      { place: 'Synth', tools: 'Whisper' },
      { place: 'NUS research', tools: 'OpenCV, TensorFlow' },
    ],
  },
];
