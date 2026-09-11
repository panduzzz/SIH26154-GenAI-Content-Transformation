import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transform from './pages/Transform'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transform" element={<Transform />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App