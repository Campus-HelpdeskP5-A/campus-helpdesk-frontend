import { useEffect, useState } from 'react'
import { getCategories, addCategory, toggleCategory } from '../../api/config'
import { LoadingState, Tag } from '../../components/UI'

const TABS = ['Categories', 'Support teams', 'SLA profiles', 'Business hours', 'Priority matrix']

export default function Configuration() {
  const [tab, setTab] = useState('Categories')
  const [categories, setCategories] = useState(null)
  const [newCat, setNewCat] = useState('')

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  async function handleAdd() {
    if (!newCat.trim()) return
    const cat = await addCategory({ name: newCat, team: 'Unassigned' })
    setCategories((c) => [...c, cat])
    setNewCat('')
  }

  async function handleToggle(id, active) {
    await toggleCategory(id, !active)
    setCategories((c) => c.map((cat) => (cat.id === id ? { ...cat, active: !active } : cat)))
  }

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>System configuration</h2>
      <div className="btn-row" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t} className={`btn sm${tab === t ? ' primary' : ' ghost'}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Categories' ? (
        <>
          {!categories && <LoadingState />}
          {categories && (
            <table className="mini">
              <thead><tr><th>Category</th><th>Support team</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.team}</td>
                    <td><Tag variant={c.active ? 'done' : 'progress'}>{c.active ? 'Active' : 'Inactive'}</Tag></td>
                    <td className="btn-row">
                      <button className="btn sm ghost" onClick={() => handleToggle(c.id, c.active)}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="btn-row" style={{ marginTop: 14 }}>
            <input
              placeholder="اسم فئة جديدة"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              style={{ height: 32, borderRadius: 8, border: '1.5px solid var(--cream-dark)', background: 'var(--cream)', color: 'var(--text-primary)', padding: '0 10px', fontSize: 12.5 }}
            />
            <button className="btn primary sm" onClick={handleAdd}>+ Add category</button>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          هذا القسم ({tab}) هيتوصل بنفس نمط الـ Categories فور ما الـ backend يجهّز الـ endpoints بتاعته.
        </p>
      )}
    </div>
  )
}
