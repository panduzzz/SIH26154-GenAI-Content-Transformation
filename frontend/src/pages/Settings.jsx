import { useState } from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

function Settings() {
  const [language, setLanguage] = useState(() => localStorage.getItem('preferred-language') || 'English')
  const [rememberChoice, setRememberChoice] = useState(() => localStorage.getItem('remember-choice') !== 'false')
  const [saved, setSaved] = useState(false)

  const saveSettings = () => {
    localStorage.setItem('preferred-language', language)
    localStorage.setItem('remember-choice', String(rememberChoice))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <DashboardLayout>
      <section className="dashboard-header page-intro">
        <p className="eyebrow">WORKSPACE PREFERENCES</p>
        <h1>Make it yours.</h1>
        <p className="subtitle">Small choices that keep your transformation workspace feeling familiar.</p>
      </section>

      <section className="settings-layout">
        <div className="settings-card">
          <div className="panel-heading"><div><span className="panel-index">01</span><h2>Content preferences</h2></div><SlidersHorizontal size={19} /></div>
          <label className="settings-field">
            <span>Preferred output language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <label className="toggle-row">
            <span><strong>Remember my last choice</strong><small>Keep the selected transformation ready next time.</small></span>
            <input type="checkbox" checked={rememberChoice} onChange={(event) => setRememberChoice(event.target.checked)} />
          </label>
          <button className="primary-button settings-save" type="button" onClick={saveSettings}>{saved ? <><Check size={17} /> Saved</> : 'Save preferences'}</button>
        </div>

        <aside className="settings-note">
          <span className="panel-kicker">MVP NOTE</span>
          <h2>Private by default.</h2>
          <p>These preferences are stored only in this browser. Account settings and server-side privacy controls will arrive with the persistence layer.</p>
        </aside>
      </section>
    </DashboardLayout>
  )
}

export default Settings
