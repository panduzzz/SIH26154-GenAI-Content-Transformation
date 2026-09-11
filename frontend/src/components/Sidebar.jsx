import {
  LayoutDashboard,
  WandSparkles,
  History,
  Settings,
  CircleHelp,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <WandSparkles size={24} />
        <span>GenAI<br /><b>Transform</b></span>
      </div>

      <div className="sidebar-caption">A quieter way to<br />work with information.</div>

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

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <History size={20} />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note"><CircleHelp size={16} /><span>Need a hand?</span></div>
        <div className="sidebar-version">SIH26154 / 2026</div>
      </div>
    </aside>
  )
}

export default Sidebar