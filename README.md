# Overwatch Map Roulette

GitHub → Render에서 바로 배포할 수 있는 Node.js + Socket.IO 실시간 전장 투표 사이트입니다.

## Render
- Runtime: Node
- Build: `npm install`
- Start: `npm start`
- Blueprint: `render.yaml`

## Local
```bash
npm install
npm start
```
http://localhost:3000

## 포함 기능
- 방 생성 / 방 코드 입장
- 실시간 플레이어 목록
- 10초 투표와 실시간 득표수
- 전장 3개 + 무작위 전장
- 전원 동일 선택 시 즉시 결정
- 1위와 2위의 표 차이가 6표 이상이면 다수결
- 그 외 득표수 비례 추첨
- 무투표 시 후보 중 무작위 결정
- 모바일 반응형 UI
