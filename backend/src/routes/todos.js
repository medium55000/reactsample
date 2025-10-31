import { Router } from 'express';
import Todo from '../models/Todo.js';

const r = Router();

/** 목록 조회 (쿼리: page, limit, q) */
r.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const q     = (req.query.q || '').trim();

  const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
  const [items, total] = await Promise.all([
    Todo.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Todo.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total });
});

/** 단건 조회 */
r.get('/:id', async (req, res) => {
  const t = await Todo.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

/** 생성 */
r.post('/', async (req, res) => {
  const { title, done } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'title is required (string)' });
  }
  const created = await Todo.create({ title: title.trim(), done: !!done });
  res.status(201).json(created);
});

/** 수정(부분) */
r.patch('/:id', async (req, res) => {
  const payload = {};
  if ('title' in req.body) {
    if (!req.body.title || typeof req.body.title !== 'string') {
      return res.status(400).json({ message: 'title must be string' });
    }
    payload.title = req.body.title.trim();
  }
  if ('done' in req.body) payload.done = !!req.body.done;

  const updated = await Todo.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

/** 삭제 */
r.delete('/:id', async (req, res) => {
  const del = await Todo.findByIdAndDelete(req.params.id);
  if (!del) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

export default r;