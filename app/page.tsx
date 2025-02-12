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
const BINARY_SEQUENCE = "11100 11 11111100101";

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
countdown    - Show time until February 14, 2025
about        - About EDS
history      - Show command history
whoami       - Display current user
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
      <div className="h-screen bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center px-4">
        <motion.div
          className="w-full max-w-sm md:max-w-md text-center bg-black/20 p-6 md:p-8 rounded-lg backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-2xl md:text-3xl">Loading EDS Terminal...</h1>
          <p className="mt-2 text-sm md:text-base">Please wait.</p>
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
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono flex flex-col justify-center items-center p-4">
        <motion.div
          className="w-full max-w-sm md:max-w-xl lg:max-w-2xl border border-green-500 p-4 md:p-6 rounded-md bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="text-sm border border-red-500/50 bg-red-500/10 p-3 rounded">
                <span className="text-red-500 font-bold">SECURITY ALERT:</span>
                <div className="mt-1 text-red-400/80">
                  • All access attempts are logged and monitored
                  <br />
                  • Unauthorized access is prohibited by law
                  <br />• Multiple failed attempts will trigger system lockdown
                </div>
              </div>

              <div className="text-xs md:text-sm flex flex-col md:flex-row items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Status: ACTIVE</span>
                <span className="text-xs text-green-500/50 hidden md:inline">
                  {new Date().toISOString()}
                </span>
              </div>

              <div className="border border-green-500/20 bg-black/40 p-4 rounded-md space-y-3">
                <div className="animate-pulse text-sm">
                  <span className="text-green-400">[SYS]</span> Secure
                  authentication required...
                </div>

                {isAuthenticating ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⠋</span>
                      <span>Authenticating...</span>
                    </div>
                    <div className="h-1 bg-green-500/20 rounded">
                      <div className="h-full w-1/2 bg-green-500 rounded animate-pulse" />
                    </div>
                    <div className="text-xs text-green-500/50">
                      Verifying credentials...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <span className="text-sm md:text-base whitespace-nowrap">
                      Administrator Password:
                    </span>
                    <input
                      type="password"
                      className="w-full bg-transparent border-b border-green-500 outline-none text-green-500 px-2 py-1 font-mono text-sm md:text-base"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && adminPassword) {
                          setIsAuthenticating(true);
                          setSecurityMessage(
                            "Validating security credentials..."
                          );

                          setTimeout(() => {
                            setSecurityMessage(
                              "Checking access permissions..."
                            );
                          }, 1000);

                          setTimeout(() => {
                            setSecurityMessage(
                              "Access denied: Invalid security clearance"
                            );
                            setAdminAttempts((prev) => prev + 1);
                            setAdminPassword("");
                            setIsAuthenticating(false);

                            if (adminAttempts >= 2) {
                              addLog(
                                "SECURITY BREACH DETECTED: System locked. Access denied.",
                                "error"
                              );
                              setPhase("join");
                              setAdminAttempts(0);
                            }
                          }, 2000);
                        } else if (e.key === "Escape") {
                          setAdminPassword("");
                          setAdminAttempts(0);
                          setPhase("join");
                        }
                      }}
                      autoFocus
                      disabled={isAuthenticating}
                    />
                  </div>
                )}

                {securityMessage && (
                  <div className="text-sm text-yellow-500 animate-pulse">
                    {securityMessage}
                  </div>
                )}

                {adminPassword && adminAttempts > 0 && !isAuthenticating && (
                  <div className="text-red-500 text-sm animate-pulse border border-red-500/20 bg-red-500/5 p-2 rounded">
                    SECURITY ALERT: Authentication failed. {3 - adminAttempts}{" "}
                    attempts remaining before lockout.
                  </div>
                )}

                <div className="text-xs text-green-500/50 border-t border-green-500/20 pt-2">
                  [ESC] Exit | [ENTER] Authenticate | Secure Connection: ENABLED
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 border border-green-500 rounded hover:bg-green-500 hover:text-black transition text-sm group relative"
                onClick={() => {
                  setAdminPassword("");
                  setAdminAttempts(0);
                  setPhase("join");
                }}
                disabled={isAuthenticating}
              >
                <span className="group-hover:animate-pulse">
                  Exit Secure Terminal
                </span>
              </button>
            </div>
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
            {username}@eds:~$
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
