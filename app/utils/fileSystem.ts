import { FileSystemNode } from "../types/system";

export const virtualFileSystem: FileSystemNode = {
  name: "/",
  type: "directory",
  children: {
    home: {
      name: "home",
      type: "directory",
      children: {
        "readme.txt": {
          name: "readme.txt",
          type: "file",
          content:
            'Welcome to EDS Terminal.\nType "help" for available commands.',
          created: new Date("2024-01-01"),
          modified: new Date("2024-01-01"),
          permissions: "rw-r--r--",
        },
        "eds-info.txt": {
          name: "eds-info.txt",
          type: "file",
          content: `Echelon Dev Society (EDS)
━━━━━━━━━━━━━━━━━━━━━━━━

About Us:
EDS is Chameli Devi Group of Institutions hackathon community fostering innovation through code. We're a collective of passionate problem-solvers dedicated to turning ideas into impactful solutions.

Our Mission:
To create an ecosystem where innovation thrives, technical skills flourish, and students transform into creators through hands-on problem-solving experience.

Join Our Tech Universe:
→ LinkedIn: @echelondevsociety
→ Instagram: @echelondevsociety

What We Offer:
- Campus & National Hackathons
- Technical Skill Workshops
- Industry Expert Sessions
- Project Collaborations
- Mentorship Programs

Where passion meets potential, and every challenge is an opportunity to innovate!
Get involved and be part of something extraordinary!`,
          created: new Date("2024-01-01"),
          modified: new Date("2024-01-01"),
          permissions: "r--r--r--",
        },
        "contact.txt": {
          name: "contact.txt",
          type: "file",
          content: `Contact Information
━━━━━━━━━━━━━━━━

For partnership inquiries:
Email: eds@cdgi.edu.in


`,
          created: new Date("2024-01-01"),
          modified: new Date("2024-01-01"),
          permissions: "r--r--r--",
        },
      },
    },
  },
};

export const parsePath = (path: string) => {
  return path.split("/").filter(Boolean);
};

export const getNode = (path: string): FileSystemNode | null => {
  const parts = parsePath(path);
  let current = virtualFileSystem;

  for (const part of parts) {
    if (current.children?.[part]) {
      current = current.children[part];
    } else {
      return null;
    }
  }

  return current;
};
