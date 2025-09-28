// 필수 모듈 불러오기
const express = require('express');               // 웹 서버 프레임워크
const bodyParser = require('body-parser');        // 요청 본문(body) 해석용
const admin = require('firebase-admin');          // FCM 알림 전송

// Firebase Admin SDK 키 불러오기 (아래에서 설정할 예정)
const serviceAccount = require('./serviceKey.json');

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 앱 객체 생성
const app = express();
app.use(bodyParser.json());  // JSON 형태 요청 처리

// 사용자 토큰 저장소 (메모리 방식 - 테스트용)
let userTokens = [];

// 사용자 등록용 엔드포인트
app.post('/register', (req, res) => {
  const token = req.body.token;

  if (!userTokens.includes(token)) {
    userTokens.push(token);  // 중복 제거 후 저장
  }

  res.send({ success: true });
});

// 경고 버튼 클릭 시 알림 전송
app.post('/alert', async (req, res) => {
  const message = {
    notification: {
      title: "🚨 경고 버튼이 눌렸어요!",
      body: "다른 사용자의 도움이 필요합니다.",
    },
    tokens: userTokens,  // 저장된 모든 사용자에게 전송
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.send({ success: true, response });
  } catch (error) {
    console.error("알림 전송 실패:", error);
    res.status(500).send({ success: false, error });
  }
});

// 서버 실행
app.listen(3000, () => {
  console.log("서버가 3000번 포트에서 실행 중입니다.");
});
