import { useEffect, useState } from 'react'
import TodoApp from './TodoApp.jsx'

function App() {
  const [health, setHealth] = useState('loading...')

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`)
      .then(r => r.json())
      .then(d => setHealth(d.status))
      .catch(() => setHealth('error'))
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>React 17 + Express + Mongo Sample</h1>
      <p>Backend health: {health}</p>

      <hr style={{ margin: '16px 0' }} />

      {/* ✅ Todo CRUD 영역 */}
      <h2>Todo List</h2>
      <TodoApp />
    </div>
  )
}

export default App