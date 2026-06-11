import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_URL = API_BASE_URL.startsWith("https://")
  ? API_BASE_URL.replace("https://", "wss://")
  : API_BASE_URL.replace("http://", "ws://");
const DRAW_WELCOME_MESSAGE = "Welcome to the University of Glasgow FEEFA World Cup 2026 SweepstakeDraw. I'm your host Ciara Lightboty.";
const DRAW_SEB_MESSAGE = "And I'm your host Sebotstian Owen. Lets find out which players will be representing each country in this exciting tournament";
const FEMALE_VOICE_NAME = (import.meta.env.VITE_FEMALE_VOICE_NAME || "").toLowerCase();

const GROUPS = {
  A: ["Mexico 🇲🇽", "South Africa 🇿🇦", "Korea Rep 🇰🇷", "Czechia 🇨🇿"],
  B: ["Canada 🇨🇦", "Bosnia & Herz 🇧🇦", "Qatar 🇶🇦", "Switzerland 🇨🇭"],
  C: ["Brazil 🇧🇷", "Morocco 🇲🇦", "Haiti 🇭🇹", "Scotland 🏴"],
  D: ["USA 🇺🇸", "Paraguay 🇵🇾", "Australia 🇦🇺", "Türkiye 🇹🇷"],
  E: ["Germany 🇩🇪", "Curaçao 🇨🇼", "Côte d'Ivoire 🇨🇮", "Ecuador 🇪🇨"],
  F: ["Netherlands 🇳🇱", "Japan 🇯🇵", "Sweden 🇸🇪", "Tunisia 🇹🇳"],
  G: ["Belgium 🇧🇪", "Egypt 🇪🇬", "Iran 🇮🇷", "New Zealand 🇳🇿"],
  H: ["Spain 🇪🇸", "Cabo Verde 🇨🇻", "Saudi Arabia 🇸🇦", "Uruguay 🇺🇾"],
  I: ["France 🇫🇷", "Senegal 🇸🇳", "Iraq 🇮🇶", "Norway 🇳🇴"],
  J: ["Argentina 🇦🇷", "Algeria 🇩🇿", "Austria 🇦🇹", "Jordan 🇯🇴"],
  K: ["Portugal 🇵🇹", "Congo DR 🇨🇩", "Côte d'Ivoire 🇨🇮", "Colombia 🇨🇴"],
  L: ["England 🏴", "Croatia 🇭🇷", "Ghana 🇬🇭", "Panama 🇵🇦"]
};

const GROUP_COLORS = {
  A: "#27de06",
  B: "#ff1493",
  C: "#ffa500",
  D: "#0066ff",
  E: "#9900ff",
  F: "#ffff00",
  G: "#ffb3d9",
  H: "#1a8a2c",
  I: "#d9b3ff",
  J: "#ffff99",
  K: "#ff6633",
  L: "#33ccff"
};

const TEAM_COLORS = {
  "Mexico 🇲🇽": "#ff6b6b",
  "South Africa 🇿🇦": "#4ecdc4",
  "Korea Republic 🇰🇷": "#ffe66d",
  "Czechia 🇨🇿": "#95e1d3",
  "Canada 🇨🇦": "#f38181",
  "Bosnia and Herzegovina 🇧🇦": "#aa96da",
  "Qatar 🇶🇦": "#fcbad3",
  "Switzerland 🇨🇭": "#a8d8ea",
  "Brazil 🇧🇷": "#ffd89b",
  "Morocco 🇲🇦": "#ffaaa5",
  "Haiti 🇭🇹": "#ff8b94",
  "Scotland 🏴": "#c7ceea",
  "USA 🇺🇸": "#b5ead7",
  "Paraguay 🇵🇾": "#ffddc1",
  "Australia 🇦🇺": "#e0bbe4",
  "Türkiye 🇹🇷": "#f0d9ff",
  "Germany 🇩🇪": "#bae1ff",
  "Curaçao 🇨🇼": "#caffbf",
  "Côte d'Ivoire 🇨🇮": "#ffffba",
  "Ecuador 🇪🇨": "#ffd6ba",
  "Netherlands 🇳🇱": "#fbb4ae",
  "Japan 🇯🇵": "#b3cde3",
  "Sweden 🇸🇪": "#ccebc5",
  "Tunisia 🇹🇳": "#decbe4",
  "Belgium 🇧🇪": "#fbb4ae",
  "Egypt 🇪🇬": "#fed9a6",
  "Iran 🇮🇷": "#ffffcc",
  "New Zealand 🇳🇿": "#e5d4ff",
  "Spain 🇪🇸": "#fccde5",
  "Cabo Verde 🇨🇻": "#d9d9d9",
  "Saudi Arabia 🇸🇦": "#bc80bd",
  "Uruguay 🇺🇾": "#80b1d3",
  "France 🇫🇷": "#fb8072",
  "Senegal 🇸🇳": "#bebada",
  "Iraq 🇮🇶": "#fdb462",
  "Norway 🇳🇴": "#b3de69",
  "Argentina 🇦🇷": "#8dd3c7",
  "Algeria 🇩🇿": "#ffffb3",
  "Austria 🇦🇹": "#fb8072",
  "Jordan 🇯🇴": "#80b1d3",
  "Portugal 🇵🇹": "#fdb462",
  "Congo DR 🇨🇩": "#b3de69",
  "Colombia 🇨🇴": "#fccde5",
  "England 🏴": "#d9d9d9",
  "Croatia 🇭🇷": "#bc80bd",
  "Ghana 🇬🇭": "#80b1d3",
  "Panama 🇵🇦": "#fb8072"
};

export default function App() {
  const [playerInput, setPlayerInput] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [players, setPlayers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawStarting, setIsDrawStarting] = useState(false);
  const [currentDrawPair, setCurrentDrawPair] = useState({ player: "", team: "" });
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const lastSpokenPairRef = useRef("");
  const backgroundMusicRef = useRef(null);

  const totalTeams = Object.values(GROUPS).flat().length;
  const leftGroups = Object.entries(GROUPS).filter(([g]) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(g));
  const rightGroups = Object.entries(GROUPS).filter(([g]) => ['G', 'H', 'I', 'J', 'K', 'L'].includes(g));
  const canStartDraw = players.length === totalTeams && Object.keys(assignments).length < totalTeams;

  const pickVoice = (preferredGender) => {
    if (!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const femaleHints = ["female", "woman", "zira", "susan", "sara", "aria", "jenny", "siri"];
    const maleHints = ["male", "man", "david", "mark", "guy", "george", "daniel"];
    const hints = preferredGender === "female" ? femaleHints : maleHints;

    if (preferredGender === "female" && FEMALE_VOICE_NAME) {
      const configuredVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes(FEMALE_VOICE_NAME)
      );
      if (configuredVoice) {
        return configuredVoice;
      }
    }

    const matchedVoice = voices.find((voice) => {
      const voiceName = `${voice.name} ${voice.voiceURI}`.toLowerCase();
      return hints.some((hint) => voiceName.includes(hint));
    });

    if (matchedVoice) {
      return matchedVoice;
    }

    if (preferredGender === "female") {
      // Avoid obvious male voices when a female hint did not match.
      const nonMaleVoice = voices.find((voice) => {
        const voiceName = `${voice.name} ${voice.voiceURI}`.toLowerCase();
        return !maleHints.some((hint) => voiceName.includes(hint));
      });
      return nonMaleVoice || null;
    }

    return matchedVoice || voices[0] || null;
  };

  const getSpokenTeamName = (team) => {
    const hasFlagEmoji = /[\u{1F1E6}-\u{1F1FF}]{2}/u.test(team);
    let cleaned = team
      .normalize("NFKD")
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
      .replace(/[\p{Extended_Pictographic}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

    if (hasFlagEmoji) {
      cleaned = cleaned.replace(/\s+[A-Z]{2}$/, "").trim();
    }

    return cleaned.replace(/&/g, "and");
  };

  const applyServerState = (state) => {
    if (!state || typeof state !== "object") return;
    setPlayers(Array.isArray(state.players) ? state.players : []);
    setAssignments(state.assignments && typeof state.assignments === "object" ? state.assignments : {});
    setIsDrawing(Boolean(state.isDrawing));
    if (state.currentDrawPair && typeof state.currentDrawPair === "object") {
      setCurrentDrawPair({
        player: typeof state.currentDrawPair.player === "string" ? state.currentDrawPair.player : "",
        team: typeof state.currentDrawPair.team === "string" ? state.currentDrawPair.team : ""
      });
    }
  };

  useEffect(() => {
    const player = currentDrawPair.player.trim();
    const team = currentDrawPair.team.trim();
    if (!audioEnabled || !player || !team) return;

    const spokenKey = `${player}::${team}`;
    if (lastSpokenPairRef.current === spokenKey) return;
    lastSpokenPairRef.current = spokenKey;

    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") return;

    const playerVoice = pickVoice("male");
    const teamVoice = pickVoice("female");
    const spokenTeam = getSpokenTeamName(team);

    window.speechSynthesis.cancel();

    const playerUtterance = new window.SpeechSynthesisUtterance(`Player selected: ${player}`);
    playerUtterance.rate = 0.95;
    playerUtterance.pitch = 0.95;
    if (playerVoice) {
      playerUtterance.voice = playerVoice;
    }

    const teamUtterance = new window.SpeechSynthesisUtterance(`Team selected: ${spokenTeam}`);
    teamUtterance.rate = 0.95;
    teamUtterance.pitch = 1.15;
    if (teamVoice) {
      teamUtterance.voice = teamVoice;
    }

    playerUtterance.onend = () => {
      window.speechSynthesis.speak(teamUtterance);
    };

    window.speechSynthesis.speak(playerUtterance);
  }, [audioEnabled, currentDrawPair]);

  useEffect(() => {
    const music = new Audio("/BackgroundMusic.mp3");
    music.loop = true;
    music.volume = 0.25;
    backgroundMusicRef.current = music;

    return () => {
      music.pause();
      backgroundMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const music = backgroundMusicRef.current;
    if (!music) return;

    if (audioEnabled && !isDrawing && !isDrawStarting) {
      music.play().catch(() => {
        // Playback can fail until user interaction is granted by the browser.
      });
      return;
    }

    music.pause();
  }, [audioEnabled, isDrawing, isDrawStarting]);

  const enableAudio = () => {
    setAudioEnabled(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playAudioFile = (src) => new Promise((resolve, reject) => {
    const audio = new Audio(src);

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error(`Failed to play ${src}`));
    };

    audio.play().catch((error) => {
      cleanup();
      reject(error);
    });
  });

  const speakText = (text, preferredGender) => new Promise((resolve) => {
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      resolve();
      return;
    }

    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = pickVoice(preferredGender);
    utterance.rate = 0.95;
    utterance.pitch = preferredGender === "female" ? 1.15 : 0.95;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });

  const playDrawIntro = async () => {
    if (!audioEnabled) return;

    // Try requested file first, then fall back if only mp3 exists.
    const kazooSources = ["/Kazoo.mp4", "/Kazoo.mp3"];
    for (const source of kazooSources) {
      try {
        await playAudioFile(source);
        break;
      } catch {
        // Try next source.
      }
    }

    await speakText(DRAW_WELCOME_MESSAGE, "female");
    await speakText(DRAW_SEB_MESSAGE, "male");
  };

  const callApi = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data?.detail || data?.error || "Request failed";
      throw new Error(message);
    }

    return data;
  };

  useEffect(() => {
    let isMounted = true;
    let socket;

    const syncInitialState = async () => {
      try {
        const state = await callApi("/state", { method: "GET" });
        if (isMounted) {
          applyServerState(state);
        }
      } catch {
        if (isMounted) {
          setConnectionStatus("Backend unavailable");
        }
      }
    };

    const connectWebSocket = () => {
      socket = new WebSocket(`${WS_URL}/ws`);

      socket.onopen = () => {
        if (isMounted) {
          setConnectionStatus("Live sync connected");
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type === "state") {
            applyServerState(message.payload);
          }
        } catch {
          // Ignore malformed messages.
        }
      };

      socket.onclose = () => {
        if (isMounted) {
          setConnectionStatus("Live sync disconnected");
        }
      };

      socket.onerror = () => {
        if (isMounted) {
          setConnectionStatus("Live sync error");
        }
      };
    };

    syncInitialState();
    connectWebSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const addPlayer = async () => {
    if (!playerInput.trim()) return;

    try {
      const state = await callApi("/players", {
        method: "POST",
        body: JSON.stringify({
          name: playerInput.trim(),
          email: playerEmail.trim()
        })
      });
      applyServerState(state);
      setPlayerInput("");
      setPlayerEmail("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result;
      if (typeof csv !== 'string') return;

      const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');

      if (nameIndex === -1) {
        alert('CSV must have a "name" column');
        return;
      }

      const newPlayers = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values[nameIndex]) {
          newPlayers.push({
            name: values[nameIndex],
            email: emailIndex !== -1 ? values[emailIndex] : ''
          });
        }
      }

      callApi("/players/replace", {
        method: "POST",
        body: JSON.stringify({ players: newPlayers })
      })
        .then((state) => {
          applyServerState(state);
        })
        .catch((error) => {
          alert(error.message);
        });

      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleAssignment = async (group, team, player) => {
    void group;
    try {
      const state = await callApi("/assignments", {
        method: "POST",
        body: JSON.stringify({ team, player })
      });
      applyServerState(state);
    } catch (error) {
      alert(error.message);
    }
  };

  const clearPlayers = async () => {
    try {
      const state = await callApi("/reset", { method: "POST", body: JSON.stringify({}) });
      applyServerState(state);
      setPlayerInput("");
      setPlayerEmail("");
    } catch (error) {
      alert(error.message);
    }
  };

  const exportResults = (drawPairs) => {
    let csv = "Team,Country,Player,Email\n";

    drawPairs.forEach((pair, idx) => {
      csv += `${idx + 1},${pair.team},${pair.player.name},"${pair.player.email}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "WorldCup_Draw_Results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const startDraw = async () => {
    if (!canStartDraw || isDrawing || isDrawStarting) return;

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
    setIsDrawStarting(true);

    const allTeams = Object.values(GROUPS).flat();

    try {
      // Run full intro before starting the draw.
      try {
        await playDrawIntro();
      } catch {
        // If intro media fails, continue to draw startup.
      }

      const state = await callApi("/draw/start", {
        method: "POST",
        body: JSON.stringify({ teams: allTeams })
      });

      applyServerState(state);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDrawStarting(false);
    }
  };

  return (
    <div className="fifa-root">
      <button
        className="export-button"
        onClick={() => exportResults(
          Object.entries(assignments).map(([team, playerName]) => {
            const playerObj = players.find((p) => p.name === playerName) || { name: playerName, email: "" };
            return { team, player: playerObj };
          })
        )}
      >
        Export Results
      </button>

      <img
        src="/glasgow-logo.png"
        alt="University of Glasgow logo"
        className="uofg-logo"
      />
      <h1 className="fifa-title">FIFA WORLD CUP 2026 – SWEEPSTAKE DRAW</h1>
      <p className="sync-status">{connectionStatus}</p>
      <button
        type="button"
        className="enable-audio-button"
        onClick={enableAudio}
        disabled={audioEnabled}
      >
        {audioEnabled ? "Audio Enabled" : "Enable Audio"}
      </button>

      <div className="input-section">
        <div className="input-row">
          <input
            value={playerInput}
            onChange={e => setPlayerInput(e.target.value)}
            placeholder="Player name"
          />
          <input
            value={playerEmail}
            onChange={e => setPlayerEmail(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={addPlayer}>Add</button>
          <button
            type="button"
            className="clear-players-button"
            onClick={clearPlayers}
            disabled={players.length === 0}
          >
            Clear Players
          </button>
          <button
            onClick={startDraw}
            disabled={!canStartDraw || isDrawing || isDrawStarting}
            className={`draw-button ${isDrawing || isDrawStarting ? "drawing" : ""}`}
          >
            {isDrawing || isDrawStarting ? "Drawing..." : "Start Draw"}
          </button>
        </div>
        <div className="csv-upload-row">
          <label htmlFor="csv-upload">Or upload CSV:</label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
          />
        </div>
        <p className="player-counter">Players: {players.length} / {totalTeams}</p>
      </div>

      <div className="groups-wrapper">
        <div className="groups-container">
            {leftGroups.map(([group, teams]) => (
              <div key={group} className="group-section" style={{ borderColor: GROUP_COLORS[group] }}>
                <div className="group-header" style={{ backgroundColor: GROUP_COLORS[group] }}>
                  <span className="group-label">{group}</span>
                </div>
                <div className="group-teams">
                  {teams.map((team, idx) => (
                    <div key={idx} className="team-row">
                      <span className="team-name">{team}</span>
                      <input
                        type="text"
                        className="player-assignment"
                        style={{ borderColor: TEAM_COLORS[team] || "#fff" }}
                        value={assignments[team] || ""}
                        onChange={e => handleAssignment(group, team, e.target.value)}
                        placeholder="Player"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="center-pot-section">
          <div className="announcer-section">
            <div className="speech-bubble speech-bubble-left">
              <span className="bubble-label">Player</span>
              <span className="bubble-value">{currentDrawPair.player || "Waiting..."}</span>
            </div>
            <img
              src="/announcer.webp"
              alt="Announcer"
              className="announcer-image"
            />
            <img
              src="/seb.png"
              alt="Seb"
              className="seb-image"
            />
            <div className="speech-bubble speech-bubble-right">
              <span className="bubble-label">Team</span>
              <span className="bubble-value">{currentDrawPair.team || "Waiting..."}</span>
            </div>
          </div>
          <img
            src="/podium.webp"
            alt="Draw podium"
            className="pot-image"
          />
        </div>

        <div className="groups-container">
            {rightGroups.map(([group, teams]) => (
              <div key={group} className="group-section" style={{ borderColor: GROUP_COLORS[group] }}>
                <div className="group-header" style={{ backgroundColor: GROUP_COLORS[group] }}>
                  <span className="group-label">{group}</span>
                </div>
                <div className="group-teams">
                  {teams.map((team, idx) => (
                    <div key={idx} className="team-row">
                      <span className="team-name">{team}</span>
                      <input
                        type="text"
                        className="player-assignment"
                        style={{ borderColor: TEAM_COLORS[team] || "#fff" }}
                        value={assignments[team] || ""}
                        onChange={e => handleAssignment(group, team, e.target.value)}
                        placeholder="Player"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
