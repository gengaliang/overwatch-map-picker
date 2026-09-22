const socket=io();
const $=id=>document.getElementById(id);

let myVote=null;
let timer=null;
let state=null;

// 맵별 이미지
const mapImages={
  "파라이수":"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "서킷 로얄":"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
  "도라도":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "66번 국도":"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "감시 기지: 지브롤터":"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
  "쓰레기촌":"https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80",
  "왕의 길":"https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1200&q=80",
  "할리우드":"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  "블리자드 월드":"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  "아이헨발데":"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "눔바니":"https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1200&q=80",
  "미드타운":"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
  "리장 타워":"https://images.unsplash.com/photo-1538485399081-7c8971d0e7b8?auto=format&fit=crop&w=1200&q=80",
  "부산":"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "일리오스":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "오아시스":"https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80",
  "네팔":"https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "남극 반도":"https://images.unsplash.com/photo-1517783991061-6f2e4b1f1e15?auto=format&fit=crop&w=1200&q=80",
  "뉴 퀸 스트리트":"https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
  "콜로세오":"https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
  "이스페란사":"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
  "루나사피":"https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80",
  "수라바사":"https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  "뉴 정크 시티":"https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
};

const fallbackImage=
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80";

function getMapImage(map){
  return mapImages[map?.name]||fallbackImage;
}

function show(id){
  ["home","lobby","vote","result"]
    .forEach(x=>$(x).classList.add("hidden"));

  $(id).classList.remove("hidden");
}

function error(s){
  $("error").textContent=s||"";
}

$("showJoin").onclick=()=>{
  $("joinBox").classList.toggle("hidden");
  $("code").focus();
};

$("create").onclick=()=>{
  error("");

  socket.emit("createRoom",{
    name:$("name").value.trim()||"플레이어"
  });
};

$("join").onclick=()=>{
  error("");

  socket.emit("joinRoom",{
    code:$("code").value.trim().toUpperCase(),
    name:$("name").value.trim()||"플레이어"
  });
};

$("start").onclick=()=>{
  socket.emit("startVote");
};

$("again").onclick=()=>{
  myVote=null;
  socket.emit("rematch");
};

$("copy").onclick=async()=>{
  await navigator.clipboard?.writeText(
    $("codeText").textContent
  );

  $("copy").textContent="복사됨!";

  setTimeout(()=>{
    $("copy").textContent="복사";
  },1200);
};

socket.on("joined",({code})=>{
  $("roomBadge").textContent="ROOM "+code;
  $("roomBadge").classList.remove("hidden");
  $("codeText").textContent=code;

  show("lobby");
});

socket.on("errorMessage",error);

socket.on("state",s=>{
  state=s;

  $("count").textContent=s.players.length;

  if(s.phase==="lobby"){

    show("lobby");

    $("players").innerHTML=s.players.map(p=>`
      <div class="player ${p.id===s.host?"host":""}">
        ${esc(p.name)}
        ${p.id===s.host?"★":""}
      </div>
    `).join("");

    $("start").classList.toggle(
      "hidden",
      socket.id!==s.host
    );

  }else if(s.phase==="voting"){

    show("vote");

    render(s);

    clock(s.remainingMs);

  }else{

    show("result");

    const map=s.result.map;

    $("winner").textContent=map.name;

    $("winnerMode").textContent=
      (map.mode||"무작위 전장")+
      (map.side?" · "+map.side:"");

    // 결과 화면 이미지
    const resultCard=document.querySelector(".result-card");

    if(resultCard){
      resultCard.style.backgroundImage=
        `url("${getMapImage(map)}")`;
      resultCard.style.backgroundSize="cover";
      resultCard.style.backgroundPosition="center";
    }

    $("reason").innerHTML=
      reason(s.result.reason);

    $("again").classList.toggle(
      "hidden",
      socket.id!==s.host
    );
  }
});

function render(s){

  $("cards").innerHTML=

    s.candidates
      .map((m,i)=>
        card(m,i,s.votes[i]||0)
      )
      .join("")+

    `
    <div
      class="map-card random-card
      ${myVote==="random"?"selected":""}"
      onclick="vote('random')"
    >

      <div
        class="map-art"
        style="
          background-image:
          url('${fallbackImage}');
        "
      ></div>

      <div class="vote-count">
        ${s.votes.random||0}표
      </div>

      <div class="map-content">

        <div class="map-mode">
          SPECIAL
        </div>

        <div class="map-name">
          🎲 무작위 전장
        </div>

        <div class="map-side">
          후보에 없는 전장 중 추첨
        </div>

      </div>
    </div>
    `;

  $("voteStatus").textContent=
    myVote===null
      ?"아직 투표하지 않았습니다."
      :"투표 완료 · 다른 선택으로 변경 가능";
}

function card(m,i,v){

  return `
    <div
      class="map-card ${myVote===i?"selected":""}"
      onclick="vote(${i})"
    >

      <div
        class="map-art"
        style="
          background-image:
          url('${getMapImage(m)}');
        "
      ></div>

      <div class="vote-count">
        ${v}표
      </div>

      <div class="map-content">

        <div class="map-mode">
          ${esc(m.mode)}
        </div>

        <div class="map-name">
          ${esc(m.name)}
        </div>

        <div class="map-side">
          ${m.side?esc(m.side):"전장 후보"}
        </div>

      </div>

    </div>
  `;
}

function vote(c){

  myVote=c;

  socket.emit("vote",c);

  if(state){
    render(state);
  }
}

function clock(ms){

  clearInterval(timer);

  const end=Date.now()+ms;

  const tick=()=>{

    const left=
      Math.max(0,end-Date.now());

    $("timer").textContent=
      (left/1000).toFixed(1);

    if(left<=0){
      clearInterval(timer);
    }
  };

  tick();

  timer=setInterval(tick,50);
}

function reason(r){

  if(r==="majority")
    return "득표수 차이가 <b>6표 이상</b> 발생해 다수결로 결정되었습니다.";

  if(r==="unanimous")
    return "모든 플레이어의 선택이 같아 <b>즉시 결정</b>되었습니다.";

  if(r==="none")
    return "아무도 투표하지 않아 후보 중 <b>무작위</b>로 결정되었습니다.";

  return "득표수에 비례한 <b>추첨</b>으로 결정되었습니다.";
}

function esc(s){

  return String(s??"").replace(
    /[&<>"']/g,
    c=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[c])
  );
}
