import { useEffect, useState } from "react";
import "./App.css";

const PLAYERS_STORAGE_KEY = "worldcup-sweepstake-players";
const ASSIGNMENTS_STORAGE_KEY = "worldcup-sweepstake-assignments";
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
  const [players, setPlayers] = useState(() => {
    try {
      const savedPlayers = window.localStorage.getItem(PLAYERS_STORAGE_KEY);
      if (!savedPlayers) return [];

      const parsedPlayers = JSON.parse(savedPlayers);
      if (!Array.isArray(parsedPlayers)) return [];

      return parsedPlayers
        .filter(player => player && typeof player.name === "string")
        .map(player => ({
          name: player.name,
          email: typeof player.email === "string" ? player.email : ""
        }));
    } catch {
      return [];
    }
  });
  const [assignments, setAssignments] = useState(() => {
    try {
      const savedAssignments = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (!savedAssignments) return {};

      const parsedAssignments = JSON.parse(savedAssignments);
      if (!parsedAssignments || typeof parsedAssignments !== "object" || Array.isArray(parsedAssignments)) {
        return {};
      }

      return Object.fromEntries(
        Object.entries(parsedAssignments).filter(
          ([team, player]) => typeof team === "string" && typeof player === "string"
        )
      );
    } catch {
      return {};
    }
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPair, setCurrentDrawPair] = useState({ player: "", team: "" });

  const totalTeams = Object.values(GROUPS).flat().length;
  const leftGroups = Object.entries(GROUPS).filter(([g]) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(g));
  const rightGroups = Object.entries(GROUPS).filter(([g]) => ['G', 'H', 'I', 'J', 'K', 'L'].includes(g));
  const canStartDraw = players.length === totalTeams && Object.keys(assignments).length < totalTeams;

  useEffect(() => {
    window.localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    window.localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const addPlayer = () => {
    if (!playerInput.trim()) return;
    setPlayers([...players, { name: playerInput.trim(), email: playerEmail.trim() }]);
    setPlayerInput("");
    setPlayerEmail("");
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

      setPlayers(newPlayers);
      setAssignments({});
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleAssignment = (group, team, player) => {
    setAssignments(prev => ({
      ...prev,
      [team]: player
    }));
  };

  const clearPlayers = () => {
    setPlayers([]);
    setAssignments({});
    setPlayerInput("");
    setPlayerEmail("");
    setIsDrawing(false);
    setCurrentDrawPair({ player: "", team: "" });
    window.localStorage.removeItem(PLAYERS_STORAGE_KEY);
    window.localStorage.removeItem(ASSIGNMENTS_STORAGE_KEY);
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

  const startDraw = () => {
    if (!canStartDraw || isDrawing) return;

    setIsDrawing(true);

    const allTeams = Object.values(GROUPS).flat();
    const assignedTeams = new Set(Object.keys(assignments));
    const assignedPlayers = new Set(Object.values(assignments));

    const remainingTeams = allTeams.filter(team => !assignedTeams.has(team));
    const remainingPlayers = players.filter(player => !assignedPlayers.has(player.name));

    if (remainingTeams.length === 0 || remainingPlayers.length === 0) {
      setIsDrawing(false);
      return;
    }

    const team = remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
    const player = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];

    const nextAssignments = {
      ...assignments,
      [team]: player.name
    };

    setCurrentDrawPair({ player: player.name, team });
    setAssignments(nextAssignments);

    if (Object.keys(nextAssignments).length === totalTeams) {
      const drawPairs = Object.entries(nextAssignments).map(([assignedTeam, playerName]) => ({
        team: assignedTeam,
        player: players.find(p => p.name === playerName) || { name: playerName, email: "" }
      }));

      exportResults(drawPairs);
    }

    window.setTimeout(() => {
      setIsDrawing(false);
    }, 250);
  };

  return (
    <div className="fifa-root">
      <img
        src="/glasgow-logo.png"
        alt="University of Glasgow logo"
        className="uofg-logo"
      />
      <h1 className="fifa-title">FIFA WORLD CUP 2026 – SWEEPSTAKE DRAW</h1>

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
            disabled={!canStartDraw || isDrawing}
            className={`draw-button ${isDrawing ? "drawing" : ""}`}
          >
            Start Draw
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
            alt="Draw Podium"
            className="pot-image"
          />

          {players.length > 0 && (
            <div className="players-table-section">
              <h2>Player List</h2>
              <table className="players-table">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={idx}>
                      <td>{player.name}</td>
                      <td>{player.email || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
