import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: process.env.ENV_PATH || '.env' }) // ENV_PATH로 env 파일 제어
const app = express()
app.use(cors())
app.use(express.json())

// Mongo 연결
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sampledb'
mongoose.connect(mongoUri).then(()=>console.log('Mongo connected')).catch(console.error)

// 샘플 스키마/모델
const TodoSchema = new mongoose.Schema({ title: String, done: Boolean }, { timestamps: true })
const Todo = mongoose.model('Todo', TodoSchema)

// 헬스체크
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// 간단 CRUD
app.get('/api/todos', async (_req,res)=> res.json(await Todo.find()))
app.post('/api/todos', async (req,res)=> res.json(await Todo.create(req.body)))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`API on :${port}`))