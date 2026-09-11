import { Clock3, FileText, ArrowUpRight } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

function History() {
  return (
    <DashboardLayout>
      <section className="dashboard-header page-intro">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Transformation history.</h1>
        <p className="subtitle">
          A record of the content you have shaped. Saved history will appear here when persistence is connected.
        </p>
      </section>

      <section className="empty-state-panel">
        <div className="empty-state-icon"><Clock3 size={28} strokeWidth={1.5} /></div>
        <span className="panel-kicker">NOTHING SAVED YET</span>
        <h2>Your next transformation<br />will start the archive.</h2>
        <p>Results currently live in your active session. Database-backed history is planned for the next release.</p>
        <a className="outline-button" href="/transform">Start a transformation <ArrowUpRight size={15} /></a>
      </section>

      <section className="history-preview">
        <div className="panel-heading"><div><span className="panel-index">ROADMAP</span><h2>What history will hold</h2></div></div>
        <div className="history-preview-grid">
          <div><FileText size={18} /><span>Source and output versions</span></div>
          <div><Clock3 size={18} /><span>Processing time and status</span></div>
          <div><span className="history-symbol">↗</span><span>Exportable results</span></div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default History
