import {
  LayoutDashboard,
  WandSparkles,
  History,
  Settings,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <WandSparkles size={24} />
        <span>GenAI Transform</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/transform"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <WandSparkles size={20} />
          <span>Transform</span>
        </NavLink>

        <a href="#" className="nav-item">
          <History size={20} />
          <span>History</span>
        </a>

        <a href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>
    </aside>
  )
}

export default Sidebar