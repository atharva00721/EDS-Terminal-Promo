"use client";
import { useEffect, useState, KeyboardEvent, useRef } from "react";
import { motion } from "framer-motion";

const calculateTimeLeft = () => {
  const difference =
    new Date("2025-02-14T00:00:00").getTime() - new Date().getTime();
  return {
    days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((difference / 1000 / 60) % 60)),
    seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
  };
};

const ASCII_ART = `
███████╗██████╗  ███████╗
██╔════╝██╔══██╗ ██╔════╝
█████╗  ██║  ██║ ███████╗
██╔══╝  ██║  ██║ ╚════██║
███████╗██████╔╝ ███████║
╚══════╝╚═════╝  ╚══════╝
Echelon Dev Society Terminal Edition
`;

const CODE_SNIPPET = `
def X(x, y): 
    return chr(x ^ y)

msg1 = [
    X(100, 0), X(101, 0), X(118, 0), " ",  
    X(104, 0), X(97, 0), X(99, 0), X(107, 0), X(115, 0)  
]  
print("".join(msg1))

`;

const SOLUTION = "dev hacks";

export default function EDSTerminalAppRefined() {
  // phases: "loading", "join", "guest", "admin"
  const [phase, setPhase] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<
    { text: string; type: "input" | "output" | "error" | "success" }[]
  >([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  // Update countdown every second (when in guest phase)
  useEffect(() => {
    if (phase === "guest") {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Simulate loading then show join screen
  useEffect(() => {
    if (phase === "loading") {
      setTimeout(() => {
        setPhase("join");
      }, 2000);
    }
  }, [phase]);

  // Boot sequence when guest phase starts
  useEffect(() => {
    if (phase === "guest") {
      simulateBootSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const simulateBootSequence = async () => {
    const bootMessages = [
      { text: "Initializing EDS Terminal...", delay: 500 },
      { text: "Loading core modules...", delay: 400 },
      { text: "Establishing secure connection...", delay: 400 },
      { text: ASCII_ART, delay: 200 },
      {
        text: "Terminal ready. Type 'help' to view available options.",
        delay: 300,
      },
      {
        text: "Options include: countdown, matrix, about, history, solve <answer>",
        delay: 300,
      },
      {
        text: "Puzzle: Review the following code snippet and solve it.",
        delay: 400,
      },
      { text: "Code Snippet:", delay: 200 },
      { text: CODE_SNIPPET, delay: 400 },
      { text: "Submit your answer with: solve <your answer>", delay: 300 },
    ];

    for (const msg of bootMessages) {
      await new Promise((resolve) => setTimeout(resolve, msg.delay));
      addLog(msg.text, "output");
    }
  };

  const addLog = (
    text: string,
    type: "input" | "output" | "error" | "success"
  ) => {
    setLogs((prev) => [...prev, { text, type }]);
    // Auto scroll
    setTimeout(() => {
      terminalRef.current?.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const handleCommand = async () => {
    const trimmedCommand = command.trim();
    const lowerCommand = trimmedCommand.toLowerCase();
    setCommandHistory((prev) => [...prev, trimmedCommand]);
    addLog(`root@eds:~$ ${command}`, "input");

    if (phase === "guest") {
      if (lowerCommand === "help") {
        addLog(
          `Available commands:
help         - Show help message
clear        - Clear terminal
countdown    - Show time until February 14, 2025
matrix       - Toggle Matrix effect
about        - About EDS
history      - Show command history
solve <ans>  - Submit solution for the puzzle`,
          "output"
        );
      } else if (lowerCommand === "clear") {
        setLogs([]);
      } else if (lowerCommand === "countdown") {
        addLog(
          `Time remaining until February 14, 2025:
${timeLeft.days} days
${timeLeft.hours} hours
${timeLeft.minutes} minutes
${timeLeft.seconds} seconds`,
          "success"
        );
      } else if (lowerCommand === "matrix") {
        setShowMatrix(!showMatrix);
        addLog("Toggling Matrix effect...", "output");
      } else if (lowerCommand === "about") {
        addLog(
          `Echelon Dev Society (EDS)
A premium interactive console experience.
Join our community for cutting-edge developments.`,
          "output"
        );
      } else if (lowerCommand === "history") {
        addLog(commandHistory.join("\n"), "output");
      } else if (lowerCommand.startsWith("solve")) {
        const userAnswer = trimmedCommand.slice(6).trim().toLowerCase();
        if (userAnswer === SOLUTION) {
          addLog(
            "🎉 Congratulations! You've solved the puzzle and unlocked the easter egg!",
            "success"
          );
        } else {
          addLog("Incorrect solution. Try again.", "error");
        }
      } else if (lowerCommand === "") {
        // Do nothing for empty command
      } else {
        addLog(`Command not found: ${command}`, "error");
      }
    }

    setCommand("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col justify-center items-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl">Loading EDS Terminal...</h1>
          <p className="mt-2">Please wait.</p>
        </motion.div>
      </div>
    );
  }

  if (phase === "join") {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col justify-center items-center">
        <motion.div
          className="text-center p-6 border border-green-500 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl mb-4">Welcome to EDS Terminal</h1>
          <p className="mb-6">Select your access level:</p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition"
              onClick={() => setPhase("guest")}
            >
              Join as Guest
            </button>
            <button
              className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition"
              onClick={() => setPhase("admin")}
            >
              Join as Admin
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "admin") {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col justify-center items-center">
        <motion.div
          className="text-center p-6 border border-green-500 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl mb-4">Admin Panel</h1>
          <p className="mb-6">Admin access coming soon!</p>
          <button
            className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition"
            onClick={() => setPhase("join")}
          >
            Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Phase === "guest"
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col justify-center items-center p-4">
      {showMatrix && <MatrixRain />}
      <motion.div
        className="w-full max-w-3xl border border-green-500 p-6 rounded-md bg-black/90 shadow-xl backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div
          ref={terminalRef}
          className="h-[70vh] overflow-y-auto mb-4 terminal-content"
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap ${
                log.type === "error"
                  ? "text-red-500"
                  : log.type === "success"
                  ? "text-green-400"
                  : log.type === "input"
                  ? "text-blue-400"
                  : "text-green-500"
              }`}
            >
              {log.text}
            </div>
          ))}
        </div>
        <div className="flex items-center border-t border-green-500/30 pt-4">
          <span className="pr-2 text-green-400">root@eds:~$</span>
          <input
            type="text"
            className="w-full bg-transparent text-green-500 outline-none"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="mt-6 text-sm">
          <p>Live Countdown to February 14, 2025:</p>
          <p>
            {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m :{" "}
            {timeLeft.seconds}s
          </p>
        </div>
      </motion.div>
      {/* <style jsx>{`
        .terminal-content::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-content::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        .terminal-content::-webkit-scrollbar-thumb {
          background: #238636;
          border-radius: 4px;
        }
      \`}</style> */}
    </div>
  );
}

const MatrixRain = () => {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-20">
      <div className="w-full h-full animate-spin-slow bg-gradient-to-b from-transparent to-green-600" />
    </div>
  );
};
