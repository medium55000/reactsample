// backend/src/index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

/**
 * ✅ ENV 로딩 전략
 * - Cloud Run(환경변수 K_SERVICE가 존재)에서는 .env 파일을 읽지 않음
 * - 로컬 개발 시에만 .env.development 기본 로딩 (또는 ENV_PATH 지정)
 */
const isCloudRun = !!process.env.K_SERVICE;
if (!isCloudRun) {
  dotenv.config({ path: process.env.ENV_PATH || '.env.development' });
}

// ───────────────────────────────────────────────────────────────
// 기본 설정
// ───────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', true); // Cloud Run/프록시 환경에서 client IP 등 신뢰
app.use(express.json());

/**
 * ✅ CORS 설정
 * - CORS_ALLOWED_ORIGINS="https://front-prod,...,http://localhost:5173" 처럼 콤마 구분
 * - 값이 비어 있으면(미설정) 전체 허용 (내부 API 등에서 쓰는 경우 편의)
 */
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (allowedOrigins.length === 0) return cb(null, true);       // 미설정이면 전부 허용
    if (!origin) return cb(null, true);                            // 서버간 호출/포스트맨 등 Origin 없음 허용
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight

// ───────────────────────────────────────────────────────────────
// Mongo 연결
// ───────────────────────────────────────────────────────────────
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/sampledb';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set');
  process.exit(1);
}

// 쿼리 엄격 모드(권장)
mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000, // 10s 안에 클러스터 못 찾으면 실패
      socketTimeoutMS: 45_000,          // 긴 쿼리 타임아웃
      maxPoolSize: 10,                  // 기본 커넥션 풀
    });
    console.log('✅ Mongo connected');
  } catch (err) {
    console.error('❌ Mongo connect error:', err?.message || err);
    process.exit(1);
  }
}

// ───────────────────────────────────────────────────────────────
// 스키마/모델
// ───────────────────────────────────────────────────────────────
const TodoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    done:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);

// ───────────────────────────────────────────────────────────────
// 라우트
// ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ ok: true, service: process.env.K_SERVICE || 'local' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: process.env.K_SERVICE || 'local',
    revision: process.env.K_REVISION || null,
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: process.env.K_SERVICE || 'local',
    revision: process.env.K_REVISION || null,
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/todos', async (_req, res, next) => {
  try {
    const items = await Todo.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const { title, done } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required (string)' });
    }
    const todo = await Todo.create({ title, done: !!done });
    res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
});

// ───────────────────────────────────────────────────────────────
// 에러 핸들러(최후)
// ───────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err?.message || err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ───────────────────────────────────────────────────────────────
// 서버 시작 (Cloud Run: PORT는 시스템이 주입 — 직접 세팅 금지)
// ───────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 8080;

async function start() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API listening on :${PORT}`);
  });
}
start();

// ───────────────────────────────────────────────────────────────
// 종료 신호 처리
// ───────────────────────────────────────────────────────────────
async function shutdown() {
  console.log('⏳ Graceful shutdown...');
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// (테스트용) 앱 export
export default app;