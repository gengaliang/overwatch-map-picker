const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const maps = [
  { name:"파라이수", mode:"호위", side:"공격", color:"파라이수" },
  { name:"서킷 로얄", mode:"호위", side:"공격", color:"서킷 로얄" },
  { name:"도라도", mode:"호위", side:"공격", color:"도라도" },
  { name:"66번 국도", mode:"호위", side:"공격", color:"66번 국도" },
  { name:"감시 기지: 지브롤터", mode:"호위", side:"공격", color:"지브롤터" },
  { name:"쓰레기촌", mode:"호위", side:"공격", color:"쓰레기촌" },
  { name:"샴발리 수도원", mode:"호위", side:"공격", color:"샴발리" },
  { name:"왕의 길", mode:"혼합", side:"공격", color:"왕의 길" },
  { name:"할리우드", mode:"혼합", side:"공격", color:"할리우드" },
  { name:"블리자드 월드", mode:"혼합", side:"공격", color:"블리자드 월드" },
  { name:"아이헨발데", mode:"혼합", side:"공격", color:"아이헨발데" },
  { name:"눔바니", mode:"혼합", side:"공격", color:"눔바니" },
  { name:"미드타운", mode:"혼합", side:"공격", color:"미드타운" },
  { name:"파라다이스", mode:"혼합", side:"공격", color:"파라다이스" },
  { name:"하나오카", mode:"점령", color:"하나오카" },
  { name:"아누비스의 신전", mode:"점령", color:"아누비스" },
  { name:"네크로폴리스", mode:"점령", color:"네크로폴리스" },
  { name:"리장 타워", mode:"쟁탈", color:"리장 타워" },
  { name:"부산", mode:"쟁탈", color:"부산" },
  { name:"일리오스", mode:"쟁탈", color:"일리오스" },
  { name:"오아시스", mode:"쟁탈", color:"오아시스" },
  { name:"네팔", mode:"쟁탈", color:"네팔" },
  { name:"남극 반도", mode:"쟁탈", color:"남극 반도" },
  { name:"뉴 퀸 스트리트", mode:"밀기", color:"뉴 퀸 스트리트" },
  { name:"콜로세오", mode:"밀기", color:"콜로세오" },
  { name:"이스페란사", mode:"밀기", color:"이스페란사" },
  { name:"루나사피", mode:"밀기", color:"루나사피" },
  { name:"수라바사", mode:"플래시포인트", color:"수라바사" },
  { name:"뉴 정크 시티", mode:"플래시포인트", color:"뉴 정크 시티" }
];

const rooms = new Map();

function roomCode() {
  let code;
  do code = crypto.randomBytes(3).toString("hex").toUpperCase();
  while (rooms.has(code));
  return code;
}

function pickCandidates() {
  // 후보 3개가 모두 같은 모드가 되지 않도록 최대 100회 재추첨
  for (let i = 0; i < 100; i++) {
    const shuffled = [...maps].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3);
    if (new Set(chosen.map(m => m.mode)).size >= 2) return chosen;
  }
  return [...maps].sort(() => Math.random() - 0.5).slice(0, 3);
}

function randomOutsideCandidates(candidates) {
  const excluded = new Set(candidates.map(m => m.name));
  const pool = maps.filter(m => !excluded.has(m.name));
  return pool[Math.floor(Math.random() * pool.length)];
}

function publicRoom(room) {
  return {
    code: room.code,
    host: room.host,
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, vote: p.vote
    })),
    candidates: room.candidates,
    votes: room.votes,
    remainingMs: Math.max(0, room.endsAt - Date.now()),
    phase: room.phase,
    result: room.result
  };
}

function broadcast(room) {
  io.to(room.code).emit("state", publicRoom(room));
}

function finish(room, reason = "timer") {
  if (!rooms.has(room.code) || room.phase !== "voting") return;

  room.phase = "result";
  clearTimeout(room.timer);

  const counts = room.candidates.map((_, i) => room.votes[i] || 0);
  const randomVotes = room.votes.random || 0;
  const totalNormal = counts.reduce((a,b) => a+b, 0);

  let winner;
  if (totalNormal + randomVotes === 0) {
    winner = room.candidates[Math.floor(Math.random() * room.candidates.length)];
  } else {
    const max = Math.max(...counts, randomVotes);
    const sorted = [...counts, randomVotes].sort((a,b) => b-a);
    // 1위와 2위의 표 차이가 6표 이상이면 다수결
    if (sorted[0] - sorted[1] >= 6) {
      const idx = [counts[0], counts[1], counts[2], randomVotes].indexOf(max);
      winner = idx === 3 ? randomOutsideCandidates(room.candidates) : room.candidates[idx];
    } else {
      const tickets = [];
      counts.forEach((n, i) => {
        for (let j = 0; j < n; j++) tickets.push(i);
      });
      for (let j = 0; j < randomVotes; j++) tickets.push(3);

      const pick = tickets[Math.floor(Math.random() * tickets.length)];
      winner = pick === 3 ? randomOutsideCandidates(room.candidates) : room.candidates[pick];
    }
  }

  room.result = {
    map: winner,
    reason,
    at: Date.now()
  };
  broadcast(room);
}

function startVote(room) {
  room.candidates = pickCandidates();
  room.votes = { 0:0, 1:0, 2:0, random:0 };
  room.players.forEach(p => p.vote = null);
  room.phase = "voting";
  room.result = null;
  room.endsAt = Date.now() + 10000;
  room.timer = setTimeout(() => finish(room), 10000);
  broadcast(room);
}

io.on("connection", socket => {
  socket.on("createRoom", ({ name }) => {
    const code = roomCode();
    const room = {
      code, host: socket.id, players: new Map(),
      candidates: [], votes: {0:0,1:0,2:0,random:0},
      phase: "lobby", result:null, timer:null, endsAt:0
    };
    room.players.set(socket.id, { id:socket.id, name:(name || "플레이어").slice(0,16), vote:null });
    rooms.set(code, room);
    socket.join(code);
    socket.data.room = code;
    socket.emit("joined", { code });
    broadcast(room);
  });

  socket.on("joinRoom", ({ code, name }) => {
    const room = rooms.get(String(code || "").toUpperCase());
    if (!room) return socket.emit("errorMessage", "방을 찾을 수 없습니다.");
    if (room.phase === "voting") return socket.emit("errorMessage", "투표가 진행 중이라 지금은 입장할 수 없습니다.");
    room.players.set(socket.id, { id:socket.id, name:(name || "플레이어").slice(0,16), vote:null });
    socket.join(room.code);
    socket.data.room = room.code;
    socket.emit("joined", { code:room.code });
    broadcast(room);
  });

  socket.on("startVote", () => {
    const room = rooms.get(socket.data.room);
    if (!room || room.host !== socket.id || room.players.size < 1) return;
    startVote(room);
  });

  socket.on("vote", choice => {
    const room = rooms.get(socket.data.room);
    if (!room || room.phase !== "voting") return;
    const player = room.players.get(socket.id);
    if (!player) return;

    if (!(choice === 0 || choice === 1 || choice === 2 || choice === "random")) return;

    if (player.vote !== null) room.votes[player.vote]--;
    player.vote = choice;
    room.votes[choice]++;

    // 모든 참가자가 같은 일반 전장에 투표했다면 즉시 결정
    const votes = [...room.players.values()].map(p => p.vote);
    if (votes.length && votes.every(v => v !== null && v === votes[0]) && typeof votes[0] === "number") {
      room.phase = "result";
      clearTimeout(room.timer);
      room.result = { map: room.candidates[votes[0]], reason:"unanimous", at:Date.now() };
    }
    // 투표 차이가 6 이상이면 즉시 결정
    else {
      const counts = [room.votes[0],room.votes[1],room.votes[2],room.votes.random];
      const sorted = [...counts].sort((a,b)=>b-a);
      if (sorted[0] - sorted[1] >= 6) finish(room, "majority");
    }
    broadcast(room);
  });

  socket.on("rematch", () => {
    const room = rooms.get(socket.data.room);
    if (!room || room.host !== socket.id) return;
    startVote(room);
  });

  socket.on("disconnect", () => {
    const code = socket.data.room;
    const room = rooms.get(code);
    if (!room) return;
    room.players.delete(socket.id);
    if (room.players.size === 0) {
      clearTimeout(room.timer);
      rooms.delete(code);
      return;
    }
    if (room.host === socket.id) room.host = room.players.keys().next().value;
    if (room.phase === "voting") {
      const counts = [...room.players.values()].map(p=>p.vote);
      if (counts.length && counts.every(v=>v !== null && v === counts[0]) && typeof counts[0] === "number") {
        clearTimeout(room.timer);
        room.phase = "result";
        room.result = {map:room.candidates[counts[0]], reason:"unanimous", at:Date.now()};
      }
    }
    broadcast(room);
  });
});

server.listen(PORT, () => console.log(`Map Picker running on port ${PORT}`));
