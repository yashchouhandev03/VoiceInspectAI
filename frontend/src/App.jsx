
import { useEffect, useState } from 'react'
import {
  Plane, LayoutDashboard, ClipboardList, Wrench, Activity,
  Plus, RefreshCw, AlertTriangle, Clock, Radio, X, Mic, MicOff,
  Search, Download
} from 'lucide-react'
import './App.css'

const API = 'https://voiceinspectai.onrender.com/api'

function App() {
  const [inspections, setInspections] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [ticketFilter, setTicketFilter] = useState('ALL')
  const [ticketSearch, setTicketSearch] = useState('')
  const [inspectionSearch, setInspectionSearch] = useState('')
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedInspection, setSelectedInspection] = useState(null)

  const [form, setForm] = useState({
    location: 'Terminal 1',
    equipment: 'Escalator',
    issue: '',
    condition: 'FAULTY'
  })

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [i, t] = await Promise.all([
        fetch(`${API}/inspections`),
        fetch(`${API}/tickets`)
      ])

      if (!i.ok || !t.ok) throw new Error()

      setInspections(await i.json())
      setTickets(await t.json())
    } catch {
      setError('Backend connection failed. Check Spring Boot on port 8080.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function ticketAction(url, method = 'PATCH', body = null) {
    try {
      const response = await fetch(`${API}/tickets/${url}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json '} : undefined,
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        throw new Error(response.status === 404
          ? 'Ticket nahi mila.'
          : 'Ticket update failed. Backend check karo.')
      }

      await loadData()
    } catch (err) {
      setError(err.message || 'Ticket update failed.')
    }
  }

  async function assignTechnician(ticketId) {
    const technician = window.prompt('Technician ka naam enter karo:')
    if (!technician?.trim()) return

    await ticketAction(`${ticketId}/technician`, 'PATCH', {
      technician: technician.trim()
    })
  }

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition supported nahi hai. Chrome browser use karo.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setListening(true)
        setError('')
        setVoiceText('Listening... Speak now')
      }

      recognition.onresult = event => {
        let transcript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }

        transcript = transcript.trim()
        if (!transcript) return

        const text = transcript.toLowerCase()
        setVoiceText(transcript)

        let condition = 'FAULTY'
        if (text.includes('good') || text.includes('normal')) condition = 'GOOD'
        else if (text.includes('warning')) condition = 'WARNING'
        else if (text.includes('repair')) condition = 'NEEDS_REPAIR'
        else if (text.includes('fault') || text.includes('broken')) condition = 'FAULTY'

        let equipment = 'Escalator'
        if (text.includes('lift') || text.includes('elevator')) equipment = 'Lift'
        else if (text.includes('conveyor')) equipment = 'Conveyor Belt'
        else if (text.includes('generator')) equipment = 'Generator'
        else if (text.includes('air conditioning') || text.includes('ac')) equipment = 'Air Conditioning'

        let location = 'Terminal 1'
        const terminalMatch = text.match(/terminal\s*(\d+)/)

        if (terminalMatch) location = `Terminal ${terminalMatch[1]}`
        else if (text.includes('terminal two')) location = 'Terminal 2'
        else if (text.includes('terminal three')) location = 'Terminal 3'

        const issue = transcript
          .replace(/terminal\s*\d+/i, '')
          .replace(/terminal (two|three)/i, '')
          .replace(/escalator|lift|elevator|conveyor belt|conveyor|generator|air conditioning|ac/ig, '')
          .replace(/faulty|fault|broken|needs repair|repair|warning|good|normal/ig, '')
          .trim()

        setForm({
          location,
          equipment,
          condition,
          issue: issue || transcript
        })

        setShowForm(true)
      }

      recognition.onerror = event => {
        setError(`Voice error: ${event.error}. Microphone permission check karo.`)
        setListening(false)
      }

      recognition.onend = () => setListening(false)
      recognition.start()
    } catch {
      setListening(false)
      setError('Microphone start nahi hua. Browser permission check karo.')
    }
  }

  function exportInspectionsCSV() {
    const columns = ['id', 'location', 'equipment', 'issue', 'condition', 'priority']

    const rows = inspections.map(item =>
      columns.map(key =>
        `"${String(item[key] ?? '').replace(/"/g, '""')}"`
      ).join(',')
    )

    const csv = [columns.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'voiceinspect-inspections.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  async function submitInspection(e) {
    e.preventDefault()

    try {
      const response = await fetch(`${API}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!response.ok) throw new Error()

      setForm({ ...form, issue: '' })
      setShowForm(false)
      setVoiceText('')
      await loadData()
    } catch {
      setError('Inspection save nahi hui. Backend check karo.')
    }
  }

  const critical = inspections.filter(x => x.priority === 'CRITICAL').length

  const openTickets = tickets.filter(
    x => x.status !== 'CLOSED' && x.status !== 'RESOLVED'
  ).length

  const overdue = tickets.filter(x => x.status === 'OVERDUE').length

  const priorityClass = p => (p || 'MEDIUM').toLowerCase()

  const priorityRank = {
    CRITICAL: 1, ESCALATED: 1, HIGH: 2, MEDIUM: 3, LOW: 4
  }

  const visibleTickets = [...tickets]
    .filter(ticket =>
      ticketFilter === 'ALL' || ticket.status === ticketFilter
    )
    .filter(ticket => {
      const query = ticketSearch.trim().toLowerCase()

      return !query || [
        ticket.equipment,
        ticket.location,
        ticket.issue,
        ticket.assignedTechnician,
        String(ticket.id)
      ].some(value => String(value || '').toLowerCase().includes(query))
    })
    .sort((a, b) =>
      (priorityRank[a.priority] || 5) - (priorityRank[b.priority] || 5)
    )

  const visibleInspections = [...inspections]
    .reverse()
    .filter(item => {
      const query = inspectionSearch.trim().toLowerCase()

      return !query || [
        item.equipment,
        item.location,
        item.issue,
        item.condition,
        String(item.id)
      ].some(value => String(value || '').toLowerCase().includes(query))
    })

  const priorityCounts = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(label => ({
    label,
    count: inspections.filter(item => item.priority === label).length
  }))

  const statusCounts = ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'RESOLVED', 'CLOSED'].map(label => ({
    label,
    count: tickets.filter(ticket => ticket.status === label).length
  }))

  const equipmentCounts = Object.entries(
    inspections.reduce((acc, item) => {
      const name = item.equipment || 'Other'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const maxPriority = Math.max(1, ...priorityCounts.map(x => x.count))
  const maxStatus = Math.max(1, ...statusCounts.map(x => x.count))
  const maxEquipment = Math.max(1, ...equipmentCounts.map(x => x[1]))

  const recentActivity = [
    ...inspections.map(item => ({
      key: `inspection-${item.id}`,
      type: 'inspection',
      title: `Inspection #${item.id} recorded`,
      detail: `${item.equipment || 'Equipment'} · ${item.location || 'Location'} · ${item.condition || 'Condition'}`,
      priority: item.priority || 'MEDIUM',
      order: Number(item.id) || 0
    })),
    ...tickets.map(item => ({
      key: `ticket-${item.id}`,
      type: 'ticket',
      title: `Ticket #${item.id} · ${(item.status || 'OPEN').replace('_', ' ')}`,
      detail: `${item.equipment || 'Equipment'} · ${item.location || 'Location'} · ${item.assignedTechnician || 'Unassigned'}`,
      priority: item.priority || 'MEDIUM',
      order: (Number(item.id) || 0) + 0.5
    }))
  ].sort((a, b) => b.order - a.order).slice(0, 8)

  const pageInfo = {
    dashboard: {
      title: 'Airport Operations Dashboard',
      description: 'Monitor inspections and maintenance activities.'
    },
    inspections: {
      title: 'Inspection Records',
      description: 'View, record and manage equipment inspections.'
    },
    tickets: {
      title: 'Maintenance Tickets',
      description: 'Manage maintenance work and technician assignments.'
    }
  }[activePage]

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Plane size={23}/></div>
          <div>
            <strong>VoiceInspect</strong>
            <small>AI MAINTENANCE</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <LayoutDashboard size={18}/> Dashboard
        </button>

        <button
          className={`nav-item ${activePage === 'inspections' ? 'active' : ''}`}
          onClick={() => setActivePage('inspections')}
        >
          <ClipboardList size={18}/> Inspections
        </button>

        <button
          className={`nav-item ${activePage === 'tickets' ? 'active' : ''}`}
          onClick={() => setActivePage('tickets')}
        >
          <Wrench size={18}/> Maintenance Tickets
        </button>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="live-dot"/> System Online
          </div>
          <small>VoiceInspect AI · MVP</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              WORKSPACE / {activePage.toUpperCase()}
            </div>
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.description}</p>
          </div>

          <div className="top-actions">
            <span className="live-badge"><Radio size={14}/> LIVE</span>
            <button className="refresh-btn" onClick={loadData} title="Refresh">
              <RefreshCw size={17} className={loading ? 'spin' : ''}/>
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* DASHBOARD PAGE */}
        {activePage === 'dashboard' && (
          <>
            <section className="stats">
              <div className="stat-card">
                <div className="stat-top">
                  <span>Total Inspections</span><ClipboardList/>
                </div>
                <strong>{inspections.length}</strong>
                <small>All recorded inspections</small>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Critical Issues</span><AlertTriangle/>
                </div>
                <strong className="red">{critical}</strong>
                <small>Require urgent attention</small>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Open Tickets</span><Wrench/>
                </div>
                <strong className="blue">{openTickets}</strong>
                <small>Pending maintenance</small>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Overdue Tickets</span><Clock/>
                </div>
                <strong className="orange">{overdue}</strong>
                <small>Past deadline</small>
              </div>
            </section>

            {/* DASHBOARD ACTIONS */}
            <section className="section-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Record and manage airport equipment</p>
              </div>

              <div className="action-group">
                <button
                  className={`voice-btn ${listening ? 'listening' : ''}`}
                  onClick={startVoice}
                >
                  {listening ? <MicOff size={17}/> : <Mic size={17}/>}
                  {listening ? 'Listening...' : 'Voice Inspection'}
                </button>

                <button className="primary-btn" onClick={() => setShowForm(true)}>
                  <Plus size={17}/> New Inspection
                </button>
              </div>
            </section>

            {voiceText && (
              <div className="voice-result">
                <Mic size={16}/>
                <div>
                  <small>VOICE TRANSCRIPTION</small>
                  <p>{voiceText}</p>
                </div>
                <button className="icon-btn" onClick={() => setVoiceText('')}>
                  <X size={16}/>
                </button>
              </div>
            )}

            {/* ANALYTICS */}
            <section className="analytics-grid">
              <div className="panel analytics-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Inspection Priority</h3>
                    <p>Priority distribution of inspections</p>
                  </div>
                </div>

                <div className="analytics-bars">
                  {priorityCounts.map(item => (
                    <div className="analytics-row" key={item.label}>
                      <span className={`analytics-label ${priorityClass(item.label)}`}>
                        {item.label}
                      </span>
                      <div className="analytics-track">
                        <div
                          className={`analytics-fill ${priorityClass(item.label)}`}
                          style={{ width: `${item.count / maxPriority * 100}%` }}
                        />
                      </div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel analytics-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Ticket Status</h3>
                    <p>Maintenance workflow breakdown</p>
                  </div>
                </div>

                <div className="analytics-bars">
                  {statusCounts.map(item => (
                    <div className="analytics-row" key={item.label}>
                      <span className="analytics-label">
                        {item.label.replace('_', ' ')}
                      </span>
                      <div className="analytics-track">
                        <div
                          className={`analytics-fill status-fill ${priorityClass(item.label)}`}
                          style={{ width: `${item.count / maxStatus * 100}%` }}
                        />
                      </div>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel analytics-panel equipment-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Equipment Breakdown</h3>
                    <p>Most inspected equipment</p>
                  </div>
                </div>

                {equipmentCounts.length === 0 ? (
                  <p className="empty">No inspection data available yet.</p>
                ) : (
                  <div className="analytics-bars">
                    {equipmentCounts.map(([name, count]) => (
                      <div className="analytics-row" key={name}>
                        <span className="analytics-label">{name}</span>
                        <div className="analytics-track">
                          <div
                            className="analytics-fill equipment-fill"
                            style={{ width: `${count / maxEquipment * 100}%` }}
                          />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Activity</h3>
                  <p>Latest inspection and ticket snapshots</p>
                </div>
                <span className="count">{recentActivity.length} EVENTS</span>
              </div>

              {recentActivity.length === 0 ? (
                <p className="empty">No activity yet. Record an inspection to get started.</p>
              ) : (
                <div className="activity-list">
                  {recentActivity.map(item => (
                    <div className="activity-item" key={item.key}>
                      <span className={`activity-dot ${item.type}`}/>
                      <div className="activity-copy">
                        <strong>{item.title}</strong>
                        <small>{item.detail}</small>
                      </div>
                      <span className={`priority ${priorityClass(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="activity-note">
                This feed reflects current records, not a historical audit trail.
              </p>
            </section>
          </>
        )}

        {/* INSPECTIONS PAGE */}
        {activePage === 'inspections' && (
          <>
            <section className="section-heading">
              <div>
                <h2>Inspection Management</h2>
                <p>Complete equipment inspection history</p>
              </div>

              <div className="action-group">
                <button className="voice-btn" onClick={startVoice}>
                  <Mic size={17}/> Voice Inspection
                </button>
                <button className="primary-btn" onClick={() => setShowForm(true)}>
                  <Plus size={17}/> New Inspection
                </button>
              </div>
            </section>

            {voiceText && (
              <div className="voice-result">
                <Mic size={16}/>
                <div>
                  <small>VOICE TRANSCRIPTION</small>
                  <p>{voiceText}</p>
                </div>
                <button className="icon-btn" onClick={() => setVoiceText('')}>
                  <X size={16}/>
                </button>
              </div>
            )}

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h3>All Inspections</h3>
                  <p>Search, review and export inspection records</p>
                </div>
                <span className="count">{visibleInspections.length} RECORDS</span>
              </div>

              <div className="ticket-toolbar">
                <div className="search-wrap">
                  <Search size={16}/>
                  <input
                    className="ticket-search"
                    placeholder="Search equipment, location, issue, ID..."
                    value={inspectionSearch}
                    onChange={e => setInspectionSearch(e.target.value)}
                  />
                </div>

                <button className="ticket-action assign" onClick={exportInspectionsCSV}>
                  <Download size={15}/> Export CSV
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>LOCATION</th>
                      <th>EQUIPMENT</th>
                      <th>ISSUE</th>
                      <th>CONDITION</th>
                      <th>PRIORITY</th>
                      <th>DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleInspections.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty">No inspections found.</td>
                      </tr>
                    ) : visibleInspections.map(item => (
                      <tr key={item.id}>
                        <td className="id">#{item.id}</td>
                        <td>{item.location}</td>
                        <td>{item.equipment}</td>
                        <td>{item.issue}</td>
                        <td>{item.condition}</td>
                        <td>
                          <span className={`priority ${priorityClass(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <button
                            className="ticket-action assign"
                            onClick={() => setSelectedInspection(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* MAINTENANCE TICKETS PAGE */}
        {activePage === 'tickets' && (
          <>
            <section className="section-heading">
              <div>
                <h2>Maintenance Management</h2>
                <p>Track repairs and technician assignments</p>
              </div>
              <button className="refresh-btn" onClick={loadData} title="Refresh tickets">
                <RefreshCw size={17}/>
              </button>
            </section>

            <section className="stats">
              <div className="stat-card">
                <div className="stat-top"><span>Total Tickets</span><Wrench/></div>
                <strong>{tickets.length}</strong>
                <small>All maintenance records</small>
              </div>

              <div className="stat-card">
                <div className="stat-top"><span>Open</span><Clock/></div>
                <strong className="blue">{openTickets}</strong>
                <small>Awaiting completion</small>
              </div>

              <div className="stat-card">
                <div className="stat-top"><span>Overdue</span><AlertTriangle/></div>
                <strong className="orange">{overdue}</strong>
                <small>Past deadline</small>
              </div>

              <div className="stat-card">
                <div className="stat-top"><span>Resolved</span><Activity/></div>
                <strong>{tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</strong>
                <small>Completed tickets</small>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h3>All Maintenance Tickets</h3>
                  <p>Prioritized maintenance workflow</p>
                </div>
                <span className="count">{visibleTickets.length} / {tickets.length} TICKETS</span>
              </div>

              <div className="ticket-toolbar">
                <div className="search-wrap">
                  <Search size={16}/>
                  <input
                    className="ticket-search"
                    placeholder="Search equipment, location, technician, ID..."
                    value={ticketSearch}
                    onChange={e => setTicketSearch(e.target.value)}
                  />
                </div>

                <select
                  className="ticket-filter"
                  value={ticketFilter}
                  onChange={e => setTicketFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>EQUIPMENT</th>
                      <th>LOCATION</th>
                      <th>TECHNICIAN</th>
                      <th>DEADLINE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty">No tickets match this filter/search.</td>
                      </tr>
                    ) : visibleTickets.map(t => (
                      <tr key={t.id}>
                        <td className="id">#{t.id}</td>
                        <td>{t.equipment}</td>
                        <td>{t.location}</td>
                        <td>{t.assignedTechnician || 'Unassigned'}</td>
                        <td>{t.deadline ? new Date(t.deadline).toLocaleString() : '—'}</td>
                        <td>
                          <span className={`status ${priorityClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <div className="ticket-actions">
                            {t.status !== 'IN_PROGRESS' &&
                             t.status !== 'RESOLVED' &&
                             t.status !== 'CLOSED' && (
                              <button
                                className="ticket-action start"
                                onClick={() => ticketAction(`${t.id}/status`, 'PATCH', { status: 'IN_PROGRESS' })}
                              >
                                Start Repair
                              </button>
                            )}

                            <button
                              className="ticket-action assign"
                              onClick={() => assignTechnician(t.id)}
                            >
                              Assign
                            </button>

                            {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                              <button
                                className="ticket-action resolve"
                                onClick={() => ticketAction(`${t.id}/close`)}
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* INSPECTION FORM */}
        {showForm && activePage !== 'tickets' && (
          <div className="form-card">
            <div className="form-heading">
              <h3>Record New Inspection</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}>
                <X/>
              </button>
            </div>

            <form onSubmit={submitInspection}>
              <div className="form-grid">
                <label>
                  Location
                  <input
                    value={form.location}
                    required
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </label>

                <label>
                  Equipment
                  <select
                    value={form.equipment}
                    onChange={e => setForm({ ...form, equipment: e.target.value })}
                  >
                    <option>Escalator</option>
                    <option>Lift</option>
                    <option>Conveyor Belt</option>
                    <option>Air Conditioning</option>
                    <option>Generator</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Condition
                  <select
                    value={form.condition}
                    onChange={e => setForm({ ...form, condition: e.target.value })}
                  >
                    <option>FAULTY</option>
                    <option>NEEDS_REPAIR</option>
                    <option>WARNING</option>
                    <option>GOOD</option>
                  </select>
                </label>

                <label>
                  Issue Description
                  <input
                    placeholder="e.g. Unusual noise"
                    required
                    value={form.issue}
                    onChange={e => setForm({ ...form, issue: e.target.value })}
                  />
                </label>
              </div>

              <button className="primary-btn" type="submit">
                <Plus size={16}/> Save Inspection
              </button>
            </form>
          </div>
        )}

        {/* INSPECTION DETAILS MODAL */}
        {selectedInspection && (
          <div
            className="inspection-modal-backdrop"
            onClick={() => setSelectedInspection(null)}
          >
            <section
              className="inspection-detail panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="panel-heading">
                <div>
                  <h3>Inspection #{selectedInspection.id}</h3>
                  <p>Equipment inspection details</p>
                </div>
                <button className="icon-btn" onClick={() => setSelectedInspection(null)}>
                  <X size={18}/>
                </button>
              </div>

              <div className="inspection-detail-grid">
                <div>
                  <small>LOCATION</small>
                  <strong>{selectedInspection.location || '—'}</strong>
                </div>
                <div>
                  <small>EQUIPMENT</small>
                  <strong>{selectedInspection.equipment || '—'}</strong>
                </div>
                <div>
                  <small>CONDITION</small>
                  <strong>{selectedInspection.condition || '—'}</strong>
                </div>
                <div>
                  <small>PRIORITY</small>
                  <strong>{selectedInspection.priority || '—'}</strong>
                </div>
                <div className="detail-wide">
                  <small>ISSUE DESCRIPTION</small>
                  <p>{selectedInspection.issue || 'No description provided.'}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        <footer>
          <Activity size={14}/> VoiceInspect AI
          <span>Airport Maintenance Automation · Demo MVP</span>
        </footer>
      </main>
    </div>
  )
}

export default App
