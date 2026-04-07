import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('profile')
      if (raw) {
        const p = JSON.parse(raw)
        setProfile(p)
        setFullName(p.full_name || p.user_metadata?.name || '')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName })
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Save failed')
      // update local profile copy
      const updated = { ...(profile || {}), full_name: fullName }
      localStorage.setItem('profile', JSON.stringify(updated))
      setProfile(updated)
      setMsg('Saved')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-slate-300">No profile loaded.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Go Home</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300 block">Email</label>
          <div className="mt-1 text-white">{profile.email || profile.identities?.[0]?.email || '—'}</div>
        </div>

        <div>
          <label className="text-sm text-slate-300 block">Full name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
          {msg && <div className="text-sm text-slate-300">{msg}</div>}
        </div>
      </form>
    </div>
  )
}
