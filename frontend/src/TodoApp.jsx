import { useEffect, useState } from 'react';
// import { listTodos, createTodo, patchTodo, deleteTodo } from './src/lib/api'; // 경로 맞춰주세요
//import { listTodos, getTodo, createTodo, patchTodo, deleteTodo } from './lib/api';
import { listTodos, createTodo, patchTodo, deleteTodo } from './lib/api';

export default function TodoApp() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await listTodos({ q, limit: 100 });
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // 초기 로드

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTodo({ title: title.trim() });
    setTitle('');
    await load();
  }

  async function onToggle(t) {
    await patchTodo(t._id, { done: !t.done });
    await load();
  }

  async function onDelete(id) {
    await deleteTodo(id);
    await load();
  }

  async function onSearch(e) {
    e.preventDefault();
    await load();
  }

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', fontFamily: 'sans-serif' }}>
      <h1>Todos</h1>

      <form onSubmit={onCreate} style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      <form onSubmit={onSearch} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <input
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Search</button>
      </form>

      <div style={{ marginTop: 16 }}>
        {loading ? 'Loading…' : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(t => (
              <li key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                <input type="checkbox" checked={!!t.done} onChange={() => onToggle(t)} />
                <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
                <button onClick={() => onDelete(t._id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}