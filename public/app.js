const socket=io();
const $=id=>document.getElementById(id);

let myVote=null;
let timer=null;
let state=null;

// 맵별 이미지
const mapImages={
  "파라이수":"https://i.namu.wiki/i/3z1b0Iy_jWx4vrvqItIeuRRlbG6QWtBEz-0mj2ORiAzxDV0gp1zkynJensbhi0D8CVN16YygOJ6fOCaihe9CITEgErgRDCcB4lpLbJZWB-mCWd3rarCs1J43VdkONKcRo-BFnCDpYptJM5SuzBQocw.webp",
  "하바나":"https://i.namu.wiki/i/71WJeR85XXdt1kI9GRXfpU3nuJkgC-51doDU7eKiiHq-IdYUoRAjIQ9qru5noCwOdafnlyWB-c23jPpiCWTlFbVDJQh41atc5UPqAVz85_6_HTOmLXOoDp_yFzoXkmnRphKCzktfZ88MAL5UBsgWVw.webp",
  "샴발리 수도원":"https://i.namu.wiki/i/YqJwQZ1_zNX9ZOWQPSBCe_zAvVj7nrGKpu-EiKiEuWhxvFFmGQag08rBcQXOqPMDQpMIMYoyN3st_Tk4DLg3IP4NT7H1amAdjipewoMR6X6CKz8i4Y3Lw0G2_fwDYijsRhIc17yaPnQjLmNeySz1qA.webp",
  "서킷 로얄":"https://i.namu.wiki/i/RA5V9ovnWWekMth1_-vVi6f1Wt8YoaLwa1o11Zk2przLJtElWUyQ1ag9_nqdcw_QFsTqrvhh2oh7w6r989fPChj_RjMfNPI3NIApoyu5tz8FKH8Sj_HBRYVOQdxv0BCz2f4xDK7dkiYRtWwGSbwlrw.webp",
  "도라도":"https://i.namu.wiki/i/ECivUTf_epoaQvWzUuWjR4_ISEHgfUTYVsq8vvliYz0zASPdjcJrQEXUKSVyjcbfdZDjHM4XZMUft3b-lR_aictBTexf42m6n0vkEKoT_HKb4sAs9QFe5JoAShvGYEOb9JLc2b8tpQtpeXTJS5IyxA.webp",
  "66번 국도":"https://i.namu.wiki/i/WVrwr7wMDOZm3v4TE4XjO2qtfNQvzCVpPSiLTRPpQA_p2IkGCWxYo6gnCQ--TN2MFG4zgkPJHIOrrR746YG4UPfPYaxS_VArnyGa3i88YheP_ZXbHRQSj7hsfS-deOLUN_ThGgIzZdxjDpFO23oE1Q.webp",
  "리알토":"https://i.namu.wiki/i/xlmKEgUzi-lAMxF3Mv5HDFHEFY6R_ukf8DAaq_T5mJMnoC5d_yoj2Ih4t9LTi6dO0sXpF_nCTOB_ZUw5oW2E0UmDgC2MXupfxyp5-M6XxEI50dYwkP8HyRXk_qEicRa79cRoosk0y2CzzITvjqmphQ.webp",
  "감시 기지: 지브롤터":"https://i.namu.wiki/i/MU6z2QolqS14LBgGb6i_0tw_CcodwVeehkXlv4cUCa7Ns0BJ8IY19UtxznIoaJRENw1mAxhXvQs6cBfFeF3mcf6iTqcOSOr3sncz79VjZQDDSZcAPqbWNYmZWjYumyXt7P03ddwzkq1ZTLn83hpmEg.webp",
  "쓰레기촌":"https://i.namu.wiki/i/en18kXukctx93h3uNwpEUdqFOhlDosihwxbbVqKyZhm2Sz0e8T2Hz0fcplxmrxcfPhEGUP1zAl8N0zNnKOEYXZfuvMCH5Nc9BMqD27r-UCKXGaQMLD4W8MI7bDo7TtdEML_coH59qqmtu3fxLK1ZMg.webp",
  "왕의 길":"https://i.namu.wiki/i/e8zTCXQmtbLW8wiQrytLo7_eeM9Cxg-RmRf0VTHTSTt9or1X9Efe7ylxqZDGzvp7Ad_cnV5vCsMyAZEn_kW-vmMs3KP_FNsRv1Jqz293ubQYuZWwC3AnFRAlgbwlh5mlRPBWXJI7u_btTx0my8-SHw.webp",
  "할리우드":"https://i.namu.wiki/i/Qz1vi6RehOy9eaHYGYTeURH-IEHfsLCn8cxEeTz4k-Jb1fA6ZrBoKAHkfuG2Kt7Uh0-XOerMANDu5e6U0i_FllTjGlHZNXtKBvgpvgxAOVPRtU-mo4sjvhsLLYyijLYOEUHJ2HmWL4qtOD35B7fmdw.webp",
  "블리자드 월드":"https://i.namu.wiki/i/MarC8wiREzkn4qDiFdHi38AQlCMxLPC-azUFsbqKnnrn3xLvMdTr7wjXfwKjt9oC_HoGaxvcOmvPp_BCsQB5aE2AyET1BLou5XcKL1gXY2vds10aHNZ4Xh0MqTXGwkTBNw_NmK95OIAxlpMQDacCRA.webp",
  "네온 교차로":"https://i.namu.wiki/i/9uJHxPbYA4ERMV70k37uxH1rN_Xz8tDANA3yFNviXnRd2e3HBB6CwiA2O8vUAiipOhBig3bo3nNAq5iWxzeA2U1apoF4xlXHRh5IsBs_TbGKULn-sOrLpYeSMZhX4NRg0zOM6WXmabu8qNj8BRevqA.webp"
  "아이헨발데":"https://i.namu.wiki/i/-viicA7OQdEOlRphtC4YUdjxDx3stDv5FTmdHhiXrLgAVIMic-mHCV3kCkS7v8oPqTt3LC-AGO8KnYJmsp1zMCBmuX5qdyHdcNbJmMOUxwOguEZxtuqjbZyffi28Ny6U0NHeFQF1SZo1PZsj_a2j9A.webp",
  "눔바니":"https://i.namu.wiki/i/Jvq4g1LgqMDrMEymJLDvxoezwoJPvV90nvjBemSKSh16skjH5VIo3h_HhyzJOs_k9M2vHZwwqv1cU1UegoQYVtJ8Jr9eq3kP_Y-XzD8Dx_30EUe8sqWh2L0iDeo6BxvGn-C2zKuC-li03Xs2gOT6qQ.webp",
  "미드타운":"https://i.namu.wiki/i/EG79_N6lrqpQO3V0FoLpwtWl8SduJQEw1kseaXKxhgT80xD_lgAKuGCBwGkpRc6582YWczCUoWumcUI5IrfiC0GEyz78uWfCaS96UV_syjSi88VBBzQIvjltsKyhGziC3Mpw9y2XaSRVfwdptAmYCw.webp",
  "사모아":"https://i.namu.wiki/i/5oL02FcJtAzGHYFrmDluH22jnKNIxhm44DH6qo4hgJUGmhM8J4hakUrsVp5G2A0jGgC9aBj8B65i8SnB_kmE4hj7p83E1k2Z1keXg9DVPCR_5EXaSawDswWTy3CWGUSW4vw6bQhg1MPOwhXG1oubcA.webp",
  "리장 타워":"https://i.namu.wiki/i/CFBWITTbpm462TupQ2P1Hl3lHgJiVDUNX2vgSohOdNatCfqoQaklav-cfUo8IJFzWbg1wA5iKUgDykF9tIQby_kJ7RsKo6jB0r5vZ-A33WJuY41A_834cXeR1qKa7w4KUZq6ECLJnHEPkBZ1EZ1WUQ.webp",
  "부산":"https://i.namu.wiki/i/hdWjEHAKY94nw_KxqGuNZVPVMq7P6UL-GFpuRk7fpQA4o-LxHsU_eGEbAcwuSOs7ysPukjAEcxm5QhgkuiP5Dgry23yQLkZXQoATdX-ZIvOasP5ALinIoTloFT5PD1e1EMpJ2wRRZd0rRd3zmEX7Ew.webp",
  "일리오스":"https://i.namu.wiki/i/E9mwgJFbCAYTTkTMsfQFC-kdjkPJF_HX1KJqd0d4Rj0BDjhuPawbPzTmvW3-zQlEZwiVtWpdbjIpz06JqmCZC2Pggfq_PtExt7WLaDYF5SKHfA88YqqH5aT_a0CROeQvnzjSeT2qcXjpB4-BNfvrtg.webp",
  "오아시스":"https://i.namu.wiki/i/Ff17G-ShgvipcxQYC6hAf-6Infc6xjddwJmpOUnp-fpLm3uo4NdDVethMQ88hcKruD9oZcsomlZF5XeTl_RcZy2NxDddOl-MQx75CUNdBfeivcPeUN914L3LiT9fiTCEcCl0DOeVudHqL2l51fSBxg.webp",
  "네팔":"https://i.namu.wiki/i/ItaO3kpxCk1jLIY5mf3axUpipYU5cSONlH7uxRy2euImakOY30NutSIwSJECR4HX2I0_hpKH-JSb1pDud-APX45He5Vk09rRd3JgmV3k_Q4BFm7YReD2q3xTlMQ3nobgYfzmIupkbZHwTeujjqCvyA.webp",
  "남극 반도":"https://i.namu.wiki/i/CJ_azK5JFYnuwK-Z47XEonMvuwhhn3oZGpTsFGOGU4xowwYHl3zhjdRxuBfdZH1kS8GkSW9AP5iGciWoPvAyEreeAKvwel98LtyTG46qjK-HtPhjSzYUDlrEQKeY407bcprtQ1FZjQyhbeCDTZ7NBQ.webp",
  "뉴 퀸 스트리트":"https://i.namu.wiki/i/L46tU0BfZCxXLDKmLG9isWmMAuclClNaR_-Ll92cpTXokhspexFO19OU8oKOuQytfxyB7SDJWL7pFJGcvXZMAZZOiDWThx-jjNukoSLiJXnf8_rUjm41lws9p35HPdNRcizHnx68RS9Ut7RSQIZzNg.webp",
  "콜로세오":"https://i.namu.wiki/i/ckBeDa9fMop97yneCKwB0yZB5tRw9B8vW6Wk2geqypv9GLcWDoFubHgK4yQc5MmxnJ-bqC5IIBldPq_Y6O1iBpJ8uBVcIlTkmEJ2oiYW-rqsaGVom65i8aE9t64IlOjXlcY-nrt2g43GCyhIcPJvhQ.webp",
  "이스페란사":"https://i.namu.wiki/i/HNqDUxZe7J07qYljibBj6Vms-0vQIaokPC54S-KYT_fA9ARt44BT-pJMg-0Mh7mKF6cmqrTvxLxW5p5xn5strX9jZ6WfbuhdSFZN6T2JRkIzZoYOb4rHY8u18aJiWT5m7k0eBlznamvtDcbV1s1VOg.webp",
  "루나사피":"https://i.namu.wiki/i/bR19TrMnv8gpb8dIA6q3F0306E7pT5GH7gmmtK4PoH27E8D32s6oe9TvKryv_Swz7M1BQskPbXyFltP5-wYYHPzyCakZWAoV4NjSUC-tgwTLAXBDDsKBRUUijRgWf7cpSX0iuAx3IGmSuYZy-6q1_Q.webp",
  "수라바사":"https://i.namu.wiki/i/dwS5eXBW5b8PhSLGKiE3jux2dCijCuySsVzxXlJAd_0vRnrqIY9rFUfXd0z1wymbct0yFzk-P5v2zn7DztKtevqTRSDga5KuzDz7QZJPctVL63zpNDHrRuIU39WLrQ2nNEegm8SBMxaLu56F46NIuw.webp",
  "뉴 정크 시티":"https://i.namu.wiki/i/dgIMh4HWNPBM87dwSgzA24sgpRq9A3PmMnN7OYDQJvP9sLILR5QYKkfkN_qOl4039r13fKceTTDKo9l40IJj8v3zPloZcpv-j6OFEQLcZaS12IDtMuLiOHZuVoRsW1pLNAW5gJ0EbO3iLjxIL8oD1Q.webp",
  "아틀리스":"https://i.namu.wiki/i/0dttMM5VjuIfuhMGypLP3vfH3oOK9uQiKCBvcnK_y1qSdvCT7TF7sdotT41mJ3ii9WEzW1fSyTcFjv1sFTuXRjE6wLMrjz0rkSoMFY4_FMv_4aOo7cWau_OADUSdLBU3Dcb-HPtJBPwJoYXS0NRrBQ.webp",
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
