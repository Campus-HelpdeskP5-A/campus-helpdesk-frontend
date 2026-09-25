import { useEffect, useState } from 'react'
import {
  getCategories, addCategory, toggleCategory,
  getSupportTeams, createSupportTeam, updateSupportTeam,
  getBusinessHours, createBusinessHours, updateBusinessHours,
  getSlaProfiles, createSlaProfile, updateSlaProfile,
  getPriorityMatrix, createPriorityMatrix, updatePriorityMatrix,
} from '../../api/config'
import { LoadingState, Tag } from '../../components/UI'

const TABS = ['Categories', 'Support teams', 'SLA profiles', 'Business hours', 'Priority matrix']

export default function Configuration() {
  const [tab, setTab] = useState('Categories')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    setData(null)
    const loaders = {
      Categories: getCategories,
      'Support teams': getSupportTeams,
      'SLA profiles': getSlaProfiles,
      'Business hours': getBusinessHours,
      'Priority matrix': getPriorityMatrix,
    }
    loaders[tab]().then(setData).catch((e) => setError(e?.message || 'Failed to load configuration'))
  }, [tab])

  if (!data) return <div><h2 style={{ marginBottom: 18 }}>System configuration</h2><div className="btn-row" style={{ marginBottom: 16 }}>{TABS.map((t) => <button key={t} className={`btn sm${tab === t ? ' primary' : ' ghost'}`} onClick={() => setTab(t)}>{t}</button>)}</div>{error ? <p>{error}</p> : <LoadingState />}</div>

  const refresh = () => {
    setData(null)
    setError('')
    const loaders = { Categories: getCategories, 'Support teams': getSupportTeams, 'SLA profiles': getSlaProfiles, 'Business hours': getBusinessHours, 'Priority matrix': getPriorityMatrix }
    loaders[tab]().then(setData).catch((e) => setError(e?.message || 'Failed to load configuration'))
  }

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>System configuration</h2>
      <div className="btn-row" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <button key={t} className={`btn sm${tab === t ? ' primary' : ' ghost'}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      {tab === 'Categories' && <Categories data={data} refresh={refresh} />}
      {tab === 'Support teams' && <Teams data={data} refresh={refresh} />}
      {tab === 'SLA profiles' && <SlaProfiles data={data} refresh={refresh} />}
      {tab === 'Business hours' && <BusinessHours data={data} refresh={refresh} />}
      {tab === 'Priority matrix' && <PriorityMatrix data={data} refresh={refresh} />}
    </div>
  )
}

function Categories({ data, refresh }) {
  const [name, setName] = useState('')
  async function add() { if (!name.trim()) return; await addCategory({ name: name.trim(), team: 'Unassigned' }); setName(''); refresh() }
  async function toggle(c) { await toggleCategory(c.id, !c.active); refresh() }
  return <><table className="mini"><thead><tr><th>Category</th><th>Support team</th><th>Status</th><th /></tr></thead><tbody>{data.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.team || 'Unassigned'}</td><td><Tag variant={c.active ? 'done' : 'progress'}>{c.active ? 'Active' : 'Inactive'}</Tag></td><td><button className="btn sm ghost" onClick={() => toggle(c)}>{c.active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table><FormRow value={name} onChange={setName} placeholder="New category" onSubmit={add} /></>
}

function Teams({ data, refresh }) {
  const [name, setName] = useState(''); const [description, setDescription] = useState('')
  async function add() { if (!name.trim()) return; await createSupportTeam({ team_name: name.trim(), description }); setName(''); setDescription(''); refresh() }
  async function toggle(t) { await updateSupportTeam(t.support_team_id || t.id, { is_active: !t.is_active }); refresh() }
  return <><table className="mini"><thead><tr><th>Team</th><th>Description</th><th>Status</th><th /></tr></thead><tbody>{data.map(t => <tr key={t.support_team_id || t.id}><td>{t.team_name || t.name}</td><td>{t.description || '—'}</td><td><Tag variant={t.is_active ? 'done' : 'progress'}>{t.is_active ? 'Active' : 'Inactive'}</Tag></td><td><button className="btn sm ghost" onClick={() => toggle(t)}>{t.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table><div className="btn-row" style={{ marginTop: 14 }}><input placeholder="Team name" value={name} onChange={e => setName(e.target.value)} /><input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /><button className="btn primary sm" onClick={add}>+ Add team</button></div></>
}

function SlaProfiles({ data, refresh }) {
  const [form, setForm] = useState({ name:'', response_target_minutes:60, resolution_target_minutes:240, business_hours_id:'' })
  const [hours, setHours] = useState([])
  useEffect(() => { getBusinessHours().then(setHours).catch(() => {}) }, [])
  async function add() { if (!form.name || !form.business_hours_id) return; await createSlaProfile({ ...form, response_target_minutes:Number(form.response_target_minutes), resolution_target_minutes:Number(form.resolution_target_minutes) }); setForm({ name:'', response_target_minutes:60, resolution_target_minutes:240, business_hours_id:'' }); refresh() }
  return <><table className="mini"><thead><tr><th>Name</th><th>Response</th><th>Resolution</th><th>Business hours</th><th>Status</th></tr></thead><tbody>{data.map(s => <tr key={s.sla_profile_id}><td>{s.name}</td><td>{s.response_target_minutes}m</td><td>{s.resolution_target_minutes}m</td><td>{s.business_hours_name || '—'}</td><td><Tag variant={s.is_active ? 'done' : 'progress'}>{s.is_active ? 'Active' : 'Inactive'}</Tag></td></tr>)}</tbody></table><div className="btn-row" style={{ marginTop: 14 }}><input placeholder="Profile name" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/><input type="number" placeholder="Response min" value={form.response_target_minutes} onChange={e => setForm({...form,response_target_minutes:e.target.value})}/><input type="number" placeholder="Resolution min" value={form.resolution_target_minutes} onChange={e => setForm({...form,resolution_target_minutes:e.target.value})}/><select value={form.business_hours_id} onChange={e => setForm({...form,business_hours_id:e.target.value})}><option value="">Business hours</option>{hours.map(h => <option key={h.business_hours_id} value={h.business_hours_id}>{h.name}</option>)}</select><button className="btn primary sm" onClick={add}>+ Add SLA</button></div></>
}

function BusinessHours({ data, refresh }) {
  const [name, setName] = useState(''); const [timezone, setTimezone] = useState('Africa/Cairo')
  async function add() {
    if (!name.trim()) return
    const days = Array.from({length:7}, (_,i) => ({ day_of_week:i, start_time:'09:00', end_time:'17:00', is_working_day:i < 5 }))
    await createBusinessHours({ name:name.trim(), timezone, days }); setName(''); refresh()
  }
  return <><table className="mini"><thead><tr><th>Name</th><th>Timezone</th><th>Status</th><th>Working days</th></tr></thead><tbody>{data.map(h => <tr key={h.business_hours_id}><td>{h.name}</td><td>{h.timezone}</td><td><Tag variant={h.is_active ? 'done' : 'progress'}>{h.is_active ? 'Active' : 'Inactive'}</Tag></td><td>{(h.days || []).filter(d => d.is_working_day).length}/7</td></tr>)}</tbody></table><div className="btn-row" style={{ marginTop: 14 }}><input placeholder="Business hours name" value={name} onChange={e => setName(e.target.value)} /><input placeholder="Timezone" value={timezone} onChange={e => setTimezone(e.target.value)} /><button className="btn primary sm" onClick={add}>+ Add hours</button></div></>
}

function PriorityMatrix({ data, refresh }) {
  const [sla, setSla] = useState([]); const [form, setForm] = useState({impact:'LOW',urgency:'LOW',priority:'LOW',sla_profile_id:''})
  useEffect(() => { getSlaProfiles().then(setSla).catch(() => {}) }, [])
  async function add() { if (!form.sla_profile_id) return; await createPriorityMatrix(form); setForm({...form,sla_profile_id:''}); refresh() }
  return <><table className="mini"><thead><tr><th>Impact</th><th>Urgency</th><th>Priority</th><th>SLA</th><th>Status</th></tr></thead><tbody>{data.map(p => <tr key={p.priority_matrix_id}><td>{p.impact}</td><td>{p.urgency}</td><td>{p.priority}</td><td>{p.sla_profile_name || '—'}</td><td><Tag variant={p.is_active ? 'done' : 'progress'}>{p.is_active ? 'Active' : 'Inactive'}</Tag></td></tr>)}</tbody></table><div className="btn-row" style={{ marginTop: 14 }}><select value={form.impact} onChange={e => setForm({...form,impact:e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select><select value={form.urgency} onChange={e => setForm({...form,urgency:e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select><select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select><select value={form.sla_profile_id} onChange={e => setForm({...form,sla_profile_id:e.target.value})}><option value="">SLA profile</option>{sla.map(s => <option key={s.sla_profile_id} value={s.sla_profile_id}>{s.name}</option>)}</select><button className="btn primary sm" onClick={add}>+ Add rule</button></div></>
}

function FormRow({ value, onChange, placeholder, onSubmit }) { return <div className="btn-row" style={{ marginTop: 14 }}><input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /><button className="btn primary sm" onClick={onSubmit}>+ Add</button></div> }
