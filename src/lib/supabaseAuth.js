const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seosxqrdqqolsmjsljze.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_iwF32Nm5hQLSKj2KpKIuEA_VxI-_M-e';
const PERSONA_ID = import.meta.env.VITE_SUPABASE_PERSONA_ID || 'b7e95bab-1bd1-4e5b-89cc-7b6fc1bcf960';
const TOKEN_KEY = 'lc.supabase.session';
export function getSession() { try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null'); } catch { return null; } }
export function getAccessToken() { return getSession()?.access_token || ''; }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); }
export async function signIn(email, password) { const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:'POST', headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'}, body:JSON.stringify({email,password}) }); const d=await r.json(); if(!r.ok) throw new Error(d.error_description||d.msg||d.message||'登录失败'); localStorage.setItem(TOKEN_KEY,JSON.stringify(d)); return d; }
export async function supabaseFetch(path, options={}) { const token=getAccessToken(); const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,...(options.headers||{})}; const r=await fetch(`${SUPABASE_URL}${path}`,{...options,headers}); const text=await r.text(); let d=null; try{d=text?JSON.parse(text):null}catch{d=text} if(!r.ok) throw new Error(d?.message||d?.error||`请求失败（${r.status}）`); return d; }
async function syncRequest(body){const r=await fetch(`${SUPABASE_URL}/functions/v1/memory-sync`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${getAccessToken()}`,'Content-Type':'application/json'},body:JSON.stringify({...body,persona_id:PERSONA_ID})});const d=await r.json();if(!r.ok)throw new Error(d.error||'同步请求失败');return d;}
export function pullSync(){return syncRequest({action:'pull',since:'1970-01-01T00:00:00Z',limit:500});}
export function pushSync(operations){return syncRequest({action:'push',operations});}
export async function localBridgeSync(){const r=await fetch('http://127.0.0.1:18127/sync',{method:'POST',headers:{Authorization:`Bearer ${getAccessToken()}`}});const d=await r.json();if(!r.ok)throw new Error(d.error||'本地同步桥未启动');return d;}
export { SUPABASE_URL };
