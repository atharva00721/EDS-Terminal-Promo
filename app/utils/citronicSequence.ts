export const citronicMessages = [
  { text: "Initializing Citronics protocol...", delay: 500 },
  { text: "Establishing secure connection...", delay: 800 },
  { text: "Scanning available nodes...", delay: 600 },
  { text: "Accessing encrypted database...", delay: 1000 },
  { text: "Decrypting security protocols...", delay: 700 },
  { text: "Authenticating request...", delay: 900 },
  { text: "Access granted to Citronics network", delay: 500 },
  { text: "Loading core modules...", delay: 600 },
  { text: "⚠️ CITRONICS COMING SOON ⚠️", delay: 300 },
];

export const runCitronicSequence = async (
  addLog: (text: string, type: "input" | "output" | "error" | "success") => void
) => {
  for (const msg of citronicMessages) {
    await new Promise((resolve) => setTimeout(resolve, msg.delay));
    addLog(
      msg.text,
      msg === citronicMessages[citronicMessages.length - 1]
        ? "success"
        : "output"
    );
  }
};
