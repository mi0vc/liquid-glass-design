import { useEffect, useState } from 'react';
import { Button, Card, Glass } from '../design/index.js';
import { getSession, signIn, clearSession, supabaseFetch, pullSync } from '../lib/supabaseAuth.js';
import './memory.css';

export default function Memory() {
  const [session, setSession] = useState(getSession); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [items, setItems] = useState([]); const [events, setEvents] = useState([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const load = async () => { setBusy(true); setError(''); try { const [m, e] = await Promise.all([supabaseFetch('/rest/v1/aion_shared_memories?select=id,content,status,revision,memory_type,updated_at&order=updated_at.desc&limit=50'), pullSync()]); setItems(m || []); setEvents(e?.events || []); } catch (x) { setError(x.message); } finally { setBusy(false); } };
  useEffect(() => { if (session) load(); }, [session]);
  const login = async (ev) => { ev.preventDefault(); setBusy(true); setError(''); try { setSession(await signIn(email, password)); } catch (x) { setError(x.message); } finally { setBusy(false); } };
  if (!session) return <main className="page memory-page"><Card><h1 className="cb-title">记忆库</h1><p className="muted">登录 Supabase 后查看云端记忆。</p><form className="memory-form" onSubmit={login}><input type="email" placeholder="邮箱" value={email} onChange={e=>setEmail(e.target.value)} required /><input type="password" placeholder="密码" value={password} onChange={e=>setPassword(e.target.value)} required /><Button type="submit" disabled={busy}>{busy?'登录中…':'登录'}</Button></form>{error&&<p className="memory-error">{error}</p>}</Card></main>;
  return <main className="page memory-page"><div className="memory-head"><div><h1 className="cb-title">记忆库</h1><p className="muted">云端记忆 {items.length} 条 · 同步事件 {events.length} 条</p></div><div className="memory-actions"><Button onClick={load} disabled={busy}>{busy?'读取中…':'刷新'}</Button><Button onClick={()=>{clearSession();setSession(null)}}>退出</Button></div></div>{error&&<p className="memory-error">{error}</p>}<div className="memory-list">{items.map(x=><Glass as="article" className="memory-item" key={x.id}><div className="memory-meta">{x.memory_type} · 修订 {x.revision} · {x.status}</div><div>{x.content}</div></Glass>)}</div></main>;
}
