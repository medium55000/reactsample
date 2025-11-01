import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import todosRouter from './routes/todos.js';

dotenv.config({ path: process.env.ENV_PATH || '.env.development' })

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI || ''
if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is empty. API will run but DB endpoints will fail until set.')
}

mongoose.set('strictQuery', true)

// ① 재시도 로직.
async function connectWithRetry(retry = 0) {
  const maxDelay = 30000
  const baseDelay = 1000
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    console.log('✅ Mongo connected')
  } catch (err) {
    const delay = Math.min(baseDelay * (2 ** retry), maxDelay)
    console.error(`❌ Mongo connect error: ${err?.message || err}. Retry in ${delay}ms`)
    setTimeout(() => connectWithRetry(retry + 1), delay).unref()
  }
}

// --- 라우트 ---
app.get('/', (_req, res) => res.status(200).send('OK'))         // 루트 헬스(Cloud Run 초기 체크용)
// CORS/JSON 미들웨어는 이미 있으니 그대로 사용
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
// ✅ 여기 추가
app.use('/api/todos', todosRouter);

// 간단한 Todo 모델/라우트 (있던 코드 유지)
const TodoSchema = new mongoose.Schema(
  { title: { type: String, required: true }, done: { type: Boolean, default: false } },
  { timestamps: true }
)
const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema)

app.get('/api/todos', async (_req, res) => {
  try {
    const items = await Todo.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (e) {
    res.status(500).json({ message: 'DB not connected yet' })
  }
})

app.post('/api/todos', async (req, res) => {
  const { title, done } = req.body || {}
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title is required (string)' })
  }
  try {
    const todo = await Todo.create({ title, done: !!done })
    res.status(201).json(todo)
  } catch (e) {
    res.status(500).json({ message: 'DB not connected yet' })
  }
})

const PORT = Number(process.env.PORT) || 8080

async function start() {
  // ② 서버를 먼저 리슨
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API listening on :${PORT}`)
  })
  // ③ DB 연결은 백그라운드 재시작
  if (MONGODB_URI) connectWithRetry()
}
start()

async function shutdown() {
  console.log('⏳ Graceful shutdown...')
  await mongoose.connection.close().catch(() => {})
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)