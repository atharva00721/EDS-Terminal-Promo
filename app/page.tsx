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
██████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██║   ██║██║  ██║██╔══██╗██╔════╝██║ ██╔╝
██║  ██║█████╗  ██║   ██║███████║███████║██║     █████╔╝ 
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██║██╔══██║██║     ██╔═██╗ 
██████╔╝███████╗ ╚████╔╝ ██║  ██║██║  ██║╚██████╗██║  ██╗
╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
`;

export default function TerminalCountdownInteractive() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<
    { text: string; type: "input" | "output" | "error" | "success" }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Matrix rain effect state
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial boot sequence
    simulateBootSequence();

    return () => clearInterval(timer);
  }, []);

  const simulateBootSequence = async () => {
    const bootMessages = [
      { text: "Initializing system...", delay: 500 },
      { text: "Loading kernel modules...", delay: 300 },
      { text: "Establishing secure connection...", delay: 400 },
      { text: ASCII_ART, delay: 100 },
      {
        text: "Terminal ready. Type 'help' for available commands.",
        delay: 200,
      },
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
    setTimeout(() => {
      terminalRef.current?.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleCommand = async () => {
    const trimmedCommand = command.trim().toLowerCase();

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmedCommand]);
    addLog(`root@devhack:~$ ${command}`, "input");

    // Command processing
    switch (trimmedCommand) {
      case "help":
        addLog(
          `Available commands:
          help        - Show this help message
          clear      - Clear terminal
          countdown  - Show time until event
          matrix     - Toggle matrix effect
          about      - About DevHack
          easteregg  - ???
          history    - Show command history`,
          "output"
        );
        break;

      case "clear":
        setLogs([]);
        break;

      case "countdown":
        addLog(
          `Time remaining until DevHack 2025:
          ${timeLeft.days} days
          ${timeLeft.hours} hours
          ${timeLeft.minutes} minutes
          ${timeLeft.seconds} seconds`,
          "success"
        );
        break;

      case "matrix":
        setShowMatrix(!showMatrix);
        addLog("Toggling Matrix effect...", "output");
        break;

      case "about":
        addLog(
          `DevHack 2025
          A revolutionary hackathon experience.
          Date: February 14, 2025
          Location: [Classified]
          Prize Pool: $$$`,
          "output"
        );
        break;

      case "history":
        addLog(commandHistory.join("\n"), "output");
        break;

      case "easteregg":
        addLog("Initiating secret sequence...", "success");
        // Add your creative easter egg here
        setTimeout(() => {
          addLog("🎉 Congratulations! You found the easter egg!", "success");
          // Add more creative responses
        }, 1000);
        break;

      case "":
        break;

      default:
        addLog(`Command not found: ${command}`, "error");
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
          <span className="pr-2 text-green-400">root@devhack:~$</span>
          <input
            type="text"
            className="w-full bg-transparent text-green-500 outline-none"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </motion.div>

      <style jsx>{`
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
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Matrix rain component
const MatrixRain = () => {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-20">
      {/* Add matrix rain effect here */}
    </div>
  );
};
