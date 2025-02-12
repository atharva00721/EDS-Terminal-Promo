"use client";
import { useEffect, useState, KeyboardEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNode } from "./utils/fileSystem";
import { runCitronicSequence } from "./utils/citronicSequence";
import { Button } from "@/components/ui/button";

const ASCII_ART = `
╔═══════════════════════════════╗
║ Echelon Dev Society Terminal  ║
╚═══════════════════════════════╝`;

const calculateTimeLeft = () => {
  const difference =
    new Date("2025-02-14T13:00:00").getTime() - new Date().getTime();
  return {
    days: Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((difference / 1000 / 60) % 60)),
    seconds: Math.max(0, Math.floor((difference / 1000) % 60)),
  };
};

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
const BINARY_SEQUENCE = "11100 11 11111101001";
const COMMANDS = [
  "help",
  "clear",
  "countdown",
  "about",
  "history",
  "whoami",
  "solve",
  "ls",
  "cd",
  "cat",
  "citronics",
];

const loadingTexts = [
  "Initializing system...",
  "Loading modules...",
  "Establishing connection...",
  "Scanning ports...",
  "Running security checks...",
  "Starting terminal...",
];

const glitchText = `
01001000 01100101 01101100 01101100 01101111
10110100 10010101 10110011 10101010 10011100
11001100 11000011 11001001 11000101 11010010`;

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
  const [username, setUsername] = useState("guest");
  const [adminAttempts, setAdminAttempts] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [currentPath, setCurrentPath] = useState("/home");
  const [loadingStep, setLoadingStep] = useState(0);

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
      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingTexts.length - 1) {
            clearInterval(interval);
            setTimeout(() => setPhase("join"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Boot sequence when guest phase starts
  useEffect(() => {
    if (phase === "guest") {
      simulateBootSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, username]);

  const simulateBootSequence = async () => {
    const bootMessages = [
      { text: "Initializing EDS Terminal...", delay: 500 },
      { text: "Loading core modules...", delay: 400 },
      { text: "Establishing secure connection...", delay: 400 },
      { text: ASCII_ART, delay: 200 },
      { text: `Welcome, ${username}!`, delay: 300 },
      {
        text: "Terminal ready. Type 'help' to view available options.",
        delay: 300,
      },
      {
        text: "Options include: countdown, about, history, solve <answer>",
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
    const logText = type === "input" ? `${username}@eds:~$ ${text}` : text;
    setLogs((prev) => [...prev, { text: logText, type }]);
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
    addLog(command, "input");

    if (phase === "guest") {
      if (lowerCommand === "help") {
        addLog(
          `Available commands:
help         - Show help message
clear        - Clear terminal
countdown    - time until the reveal
about        - About EDS
history      - Show command history
whoami       - Display current user
solve <ans>  - Submit solution for the puzzle
ls           - List directory contents
cd <dir>     - Change directory
cat <file>   - Display file contents
citro    - Show Citronics information`,
          "output"
        );
      } else if (lowerCommand === "clear") {
        setLogs([]);
      } else if (lowerCommand === "countdown") {
        addLog(
          `are you ready?
${timeLeft.days} days
${timeLeft.hours} hours
${timeLeft.minutes} minutes
${timeLeft.seconds} seconds`,
          "success"
        );
      } else if (lowerCommand === "about") {
        addLog(
          `Echelon Dev Society (EDS)
A premium interactive console experience.
Join our community for cutting-edge developments.`,
          "output"
        );
      } else if (lowerCommand === "history") {
        const maskedHistory = commandHistory.map((cmd) => {
          if (
            cmd.toLowerCase().startsWith("solve") &&
            cmd.toLowerCase().includes(SOLUTION)
          ) {
            return "solve [REDACTED]";
          }
          return cmd;
        });
        addLog(maskedHistory.join("\n"), "output");
      } else if (lowerCommand === "whoami") {
        addLog(`Current user: ${username}`, "success");
      } else if (lowerCommand.startsWith("solve")) {
        const userAnswer = trimmedCommand.slice(6).trim().toLowerCase();
        if (userAnswer === SOLUTION) {
          addLog(
            `🎉 Congratulations! You've solved the puzzle!

Dev Hacks is coming soon stay tuned for more updates.

Binary sequence unlocked: ${BINARY_SEQUENCE}

This sequence might be useful later... 
Keep it somewhere safe.

Try converting it to other formats, it might reveal something interesting...`,
            "success"
          );
        } else {
          addLog(
            `Incorrect solution. Try again.
Hint: Look carefully at the XOR operation in the code.
Each character is XORed with 0, which means...`,
            "error"
          );
        }
      } else if (lowerCommand === "ls") {
        const node = getNode(currentPath);
        if (node?.children) {
          const files = Object.values(node.children)
            .map(
              (f) =>
                `${f.type === "directory" ? "d" : "-"}${
                  f.permissions || "rw-r--r--"
                } ${f.name}${f.type === "directory" ? "/" : ""}`
            )
            .join("\n");
          addLog(files, "output");
        }
      } else if (lowerCommand.startsWith("cd ")) {
        const newPath = command.slice(3).trim();
        const targetNode = getNode(
          newPath.startsWith("/") ? newPath : `${currentPath}/${newPath}`
        );
        if (targetNode?.type === "directory") {
          setCurrentPath(newPath);
          addLog(`Changed directory to: ${newPath}`, "success");
        } else {
          addLog("Directory not found", "error");
        }
      } else if (lowerCommand.startsWith("cat ")) {
        const filePath = command.slice(4).trim();
        const node = getNode(
          filePath.startsWith("/") ? filePath : `${currentPath}/${filePath}`
        );
        if (node?.type === "file") {
          addLog(node.content || "", "output");
        } else {
          addLog("File not found", "error");
        }
      } else if (lowerCommand === "citro") {
        await runCitronicSequence(addLog);
      } else if (lowerCommand === "") {
        // Do nothing for empty command
      } else if (!COMMANDS.includes(lowerCommand.split(" ")[0])) {
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
      <div className="h-screen bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="animate-slide-down whitespace-pre font-mono text-xs">
            {glitchText}
          </div>
        </div>

        <motion.div
          className="w-full max-w-sm md:max-w-md text-center bg-black/40 p-6 md:p-8 rounded-lg backdrop-blur-sm border border-green-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-2xl md:text-3xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            EDS Terminal
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm md:text-base"
              >
                {loadingTexts[loadingStep]}
              </motion.div>
            </AnimatePresence>

            <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(loadingStep + 1) * (100 / loadingTexts.length)}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "join") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center px-4 py-8">
        <motion.div
          className="w-full max-w-sm md:max-w-md text-center p-4 md:p-6 border border-green-500 rounded-md bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-2xl md:text-3xl mb-4">Welcome to EDS Terminal</h1>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <label htmlFor="username" className="text-sm">
                Enter your username:
              </label>
              <input
                type="text"
                id="username"
                className="w-full max-w-[200px] px-4 py-2 bg-black/50 border border-green-500 rounded text-center focus:outline-none focus:border-green-400 text-sm md:text-base"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="username"
                maxLength={15}
              />
            </div>
            <p className="text-sm text-green-400/70">
              Select your access level:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition text-sm md:text-base"
                onClick={() => {
                  if (username.trim()) {
                    setPhase("guest");
                  }
                }}
              >
                Join as Guest
              </button>
              <button
                className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition text-sm md:text-base"
                onClick={() => {
                  if (username.trim()) {
                    setPhase("admin");
                  }
                }}
              >
                Join as Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "admin") {
    const handleAuth = () => {
      setIsAuthenticating(true);
      setSecurityMessage("Validating security credentials...");

      setTimeout(() => {
        setSecurityMessage("Checking access permissions...");
      }, 1000);

      setTimeout(() => {
        setSecurityMessage("Access denied: Invalid security clearance");
        setAdminAttempts((prev) => prev + 1);
        setAdminPassword("");
        setIsAuthenticating(false);

        if (adminAttempts >= 2) {
          setTimeout(() => {
            // addLog(
            //   "SECURITY BREACH DETECTED: System locked. Access denied.",
            //   "error"
            // );
            setPhase("join");
            setAdminAttempts(0);
          }, 1000);
        }
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background Matrix Effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="animate-slide-down whitespace-pre font-mono text-xs">
            {glitchText.repeat(20)}
          </div>
        </div>

        {/* Scanner Line Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-green-500/0 via-green-500/10 to-green-500/0"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear",
          }}
        />

        <motion.div
          className="w-full max-w-lg lg:max-w-xl relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Security Banner */}
          <motion.div
            className="absolute -top-6 left-0 right-0 text-center text-xs sm:text-sm text-red-500 font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            SECURITY LEVEL: MAXIMUM
          </motion.div>

          <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <motion.div
                className="text-xl sm:text-2xl font-bold text-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Administrator Access Required
              </motion.div>
              <motion.div
                className="text-sm text-green-500/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Restricted Terminal • Level 5 Clearance
              </motion.div>
            </div>

            {/* Security Alert Box */}
            <motion.div
              className="border border-red-500/30 bg-red-500/5 rounded-md p-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-red-500 mt-1.5"
                />
                <div className="space-y-2">
                  <div className="text-red-500 font-bold text-sm sm:text-base">
                    SECURITY ALERT
                    <ul className="text-red-400/80 text-xs sm:text-sm space-y-1">
                      <li>• Access attempts are logged and monitored</li>
                      <li>
                        • Unauthorized access will trigger security protocols
                      </li>
                      <li>
                        • Multiple failed attempts will result in lockdown
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Login Form */}
            <div className="space-y-4">
              {isAuthenticating ? (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      ⟳
                    </motion.span>
                    <span>Authenticating...</span>
                  </div>
                  <motion.div
                    className="h-1 bg-green-500/20 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  >
                    <motion.div
                      className="h-full bg-green-500"
                      animate={{ x: ["0%", "100%"] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="text-sm whitespace-nowrap">
                      Administrator Password:
                    </label>
                    <input
                      type="password"
                      className="w-full bg-black/50 border-b border-green-500 px-3 py-2 outline-none focus:border-green-400 transition-colors"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && adminPassword) {
                          handleAuth();
                        }
                      }}
                      autoFocus
                      disabled={isAuthenticating}
                      placeholder="Enter security clearance code..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Security Message */}
              <AnimatePresence mode="wait">
                {securityMessage && (
                  <motion.div
                    key={securityMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-yellow-500 text-sm text-center"
                  >
                    {securityMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <motion.div
              className="flex justify-between items-center pt-4 border-t border-green-500/20 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Connection Secure</span>
              </div>
              <Button
                onClick={() => {
                  setAdminPassword("");
                  setAdminAttempts(0);
                  setPhase("join");
                }}
                className="text-green-500 hover:text-green-400 transition-colors"
              >
                Exit Terminal
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Phase === "guest"
  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center p-2 sm:p-4">
      <motion.div
        className="w-full max-w-sm md:max-w-xl lg:max-w-2xl border border-green-500 p-3 sm:p-4 md:p-6 rounded-md bg-black/20 shadow-xl backdrop-blur-sm relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div
          ref={terminalRef}
          className="h-[60vh] md:h-[70vh] overflow-y-auto mb-4 terminal-content terminal-scrollbar"
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap text-sm md:text-base ${
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
        <div className="flex items-center border-t border-green-500/30 pt-3 md:pt-4">
          <span className="pr-2 text-green-400 text-sm md:text-base">
            {username}@eds:{currentPath}$
          </span>
          <input
            type="text"
            className="w-full bg-transparent text-green-500 outline-none text-sm md:text-base"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="mt-6 text-sm">
          <p>coming soon</p>
          <p>
            {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m :{" "}
            {timeLeft.seconds}s
          </p>
        </div>
      </motion.div>
    </div>
  );
}
