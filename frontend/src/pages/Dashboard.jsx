import DashboardLayout from '../layouts/DashboardLayout'

function Dashboard() {
  return (
    <DashboardLayout>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">SIH26154</p>

          <h1>Welcome to the GenAI Content Transformation Platform</h1>

          <p className="subtitle">
            Transform your content into intelligent, structured formats using
            Generative AI.
          </p>
        </div>
      </section>

      <section className="transformation-options">
        <div className="option-card">
          <h2>Document Transformation</h2>
          <p>
            Convert and restructure documents into useful formats with AI.
          </p>
          <button>Start Transforming</button>
        </div>

        <div className="option-card">
          <h2>Content Generation</h2>
          <p>
            Generate new content from existing documents and information.
          </p>
          <button>Generate Content</button>
        </div>

        <div className="option-card">
          <h2>Content Analysis</h2>
          <p>
            Extract, summarize and analyze information from uploaded content.
          </p>
          <button>Analyze Content</button>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Dashboard