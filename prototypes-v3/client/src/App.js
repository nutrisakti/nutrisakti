import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as api from './api';
import { translations } from './i18n';
import { themes } from './theme';

// ── App Context (theme + language) ────────────────────────────────────────────
const AppCtx = createContext({});
const useApp = () => useContext(AppCtx);

// ── Dynamic styles (theme-aware) ──────────────────────────────────────────────
const makeS = (t) => ({
  app:        { display:'flex', height:'100vh', background:t.bg, color:t.text, fontFamily:'system-ui,sans-serif' },
  sidebar:    { width:230, background:t.surface, padding:'20px 0', display:'flex', flexDirection:'column', borderRight:`1px solid ${t.border}` },
  logo:       { padding:'0 20px 20px', borderBottom:`1px solid ${t.border}`, marginBottom:12 },
  logoTitle:  { fontSize:20, fontWeight:700, color:t.accent },
  logoSub:    { fontSize:11, color:t.textFaint, marginTop:2 },
  navBtn:     (active) => ({ display:'flex', alignItems:'center', padding:'10px 20px', cursor:'pointer', background: active ? t.bg : 'transparent', color: active ? t.accent : t.textMuted, border:'none', width:'100%', textAlign:'left', fontSize:13, borderLeft: active ? `3px solid ${t.accent}` : '3px solid transparent' }),
  main:       { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:     { background:t.surface, padding:'12px 24px', borderBottom:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' },
  topbarTitle:{ fontSize:18, fontWeight:600, color:t.text },
  badge:      (color) => ({ background:color, color:'#fff', padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600 }),
  content:    { flex:1, overflow:'auto', padding:24 },
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
  grid3:      { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 },
  card:       { background:t.surface, borderRadius:12, padding:20, border:`1px solid ${t.border}` },
  cardTitle:  { fontSize:12, color:t.textFaint, marginBottom:8, textTransform:'uppercase', letterSpacing:1 },
  stat:       { fontSize:32, fontWeight:700, color:t.statColor },
  statSub:    { fontSize:12, color:t.textFaint, marginTop:4 },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', padding:'8px 12px', fontSize:11, color:t.textFaint, borderBottom:`1px solid ${t.border}`, textTransform:'uppercase' },
  td:         { padding:'10px 12px', fontSize:13, borderBottom:`1px solid ${t.border}`, verticalAlign:'middle', color:t.text },
  riskBadge:  (r) => ({ padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600, background: r==='high'?'#7f1d1d': r==='medium'?'#78350f':'#14532d', color: r==='high'?'#fca5a5': r==='medium'?'#fcd34d':'#86efac' }),
  btn:        (color='#0ea5e9') => ({ background:color, color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }),
  btnSm:      (color) => ({ background: color || t.border, color: color ? '#fff' : t.text, border:'none', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:12 }),
  input:      { background:t.inputBg, border:`1px solid ${t.border}`, color:t.text, padding:'10px 14px', borderRadius:8, fontSize:14, width:'100%', outline:'none' },
  chatBubble: (isUser) => ({ alignSelf: isUser?'flex-end':'flex-start', background: isUser?'#0ea5e9':t.surface, color:t.text, padding:'10px 14px', borderRadius:12, maxWidth:'80%', fontSize:13, lineHeight:1.5, border:`1px solid ${t.border}`, whiteSpace:'pre-wrap' }),
  agentTag:   (name) => ({ display:'inline-block', padding:'1px 6px', borderRadius:4, fontSize:10, fontWeight:700, marginRight:4, background: name==='GuardianAgent'?'#1d4ed8': name==='NutritionAgent'?'#065f46': name==='LogisticsAgent'?'#7c3aed':'#9a3412', color:'#fff' }),
  tag:        (color) => ({ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background: color || t.border, color:'#e2e8f0', marginRight:4 }),
  divider:    { borderBottom:`1px solid ${t.border}` },
});

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ mothers, alerts }) {
  const { t, S } = useApp();
  const high   = mothers.filter(m => m.risk_level === 'high').length;
  const noBpjs = mothers.filter(m => !m.bpjs_status).length;
  const phases = { pregnancy:0, infant:0, toddler:0 };
  mothers.forEach(m => { if (phases[m.phase] !== undefined) phases[m.phase]++; });

  return (
    <div>
      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>{t.total_mothers}</div><div style={S.stat}>{mothers.length}</div><div style={S.statSub}>{t.registered}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.high_risk}</div><div style={{...S.stat,color:'#f87171'}}>{high}</div><div style={S.statSub}>{t.needs_attention}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.no_bpjs}</div><div style={{...S.stat,color:'#fbbf24'}}>{noBpjs}</div><div style={S.statSub}>{t.not_registered}</div></div>
      </div>
      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>{t.pregnant}</div><div style={S.stat}>{phases.pregnancy}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.infant}</div><div style={S.stat}>{phases.infant}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.toddler}</div><div style={S.stat}>{phases.toddler}</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>{t.active_alerts} ({alerts.length})</div>
        {alerts.length === 0 && <div style={{color:'#64748b',fontSize:13}}>{t.no_alerts}</div>}
        {alerts.slice(0,5).map((a,i) => (
          <div key={i} style={{padding:'8px 0', borderBottom:`1px solid ${S.divider.borderBottom.split(' ')[2]}`, fontSize:13, display:'flex', gap:8, alignItems:'flex-start'}}>
            <span style={S.badge(a.severity==='high'?'#dc2626':a.severity==='warning'?'#d97706':'#0284c7')}>{a.severity}</span>
            <span style={{color:'#94a3b8',fontSize:11,minWidth:80}}>{a.type}</span>
            <span>{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mothers ───────────────────────────────────────────────────────────────────
function Mothers({ mothers, onSelect }) {
  const { t, S } = useApp();
  return (
    <div style={S.card}>
      <div style={{...S.cardTitle,marginBottom:16}}>{t.mothers_list} ({mothers.length})</div>
      <table style={S.table}>
        <thead>
          <tr>{[t.name,t.age,t.phase,t.days,t.region,t.bpjs,t.risk,t.action].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {mothers.map(m => (
            <tr key={m.id}>
              <td style={S.td}><div style={{fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:'#64748b'}}>{m.id}</div></td>
              <td style={S.td}>{m.age} {t.yrs}</td>
              <td style={S.td}>{m.phase==='pregnancy'?t.phase_pregnancy:m.phase==='infant'?t.phase_infant:t.phase_toddler}</td>
              <td style={S.td}>{m.days_in_journey}</td>
              <td style={S.td}>{m.village}, {m.region}</td>
              <td style={S.td}><span style={S.badge(m.bpjs_status?'#15803d':'#b91c1c')}>{m.bpjs_status?t.active:t.inactive}</span></td>
              <td style={S.td}><span style={S.riskBadge(m.risk_level)}>{m.risk_level}</span></td>
              <td style={S.td}><button style={S.btnSm('#0ea5e9')} onClick={()=>onSelect(m)}>{t.detail}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Agent Chat ────────────────────────────────────────────────────────────────
function AgentChat({ mothers }) {
  const { t, S } = useApp();
  const [motherId, setMotherId] = useState(mothers[0]?.id || 'MTR001');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role:'agent', text: t.chat_welcome }]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput('');
    setMessages(m => [...m, { role:'user', text:msg }]);
    setLoading(true);
    try {
      const r = await api.chat(motherId, msg);
      setLastResult(r);
      setMessages(m => [...m, { role:'agent', text:r.response }]);
    } catch(e) {
      setMessages(m => [...m, { role:'agent', text:'❌ Error: '+e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:'flex', gap:16, height:'calc(100vh - 120px)'}}>
      <div style={{...S.card, flex:1, display:'flex', flexDirection:'column', padding:0, overflow:'hidden'}}>
        <div style={{padding:'14px 20px', borderBottom:`1px solid ${S.divider.borderBottom.split(' ')[2]}`, display:'flex', gap:12, alignItems:'center'}}>
          <span style={{fontSize:13, color:'#64748b'}}>{t.mother_label}</span>
          <select value={motherId} onChange={e=>setMotherId(e.target.value)} style={{...S.input, width:'auto', padding:'4px 10px'}}>
            {mothers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <span style={S.agentTag('GuardianAgent')}>GuardianAgent</span>
        </div>
        <div style={{flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:10}}>
          {messages.map((msg,i) => (
            <div key={i} style={S.chatBubble(msg.role==='user')}>
              {msg.role==='agent' && <div style={{fontSize:10, color:'#38bdf8', marginBottom:4}}>🤖 Guardian Agent</div>}
              {msg.text}
            </div>
          ))}
          {loading && <div style={S.chatBubble(false)}>{t.processing}</div>}
        </div>
        <div style={{padding:12, borderTop:`1px solid ${S.divider.borderBottom.split(' ')[2]}`, display:'flex', gap:8}}>
          <input style={S.input} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={t.type_message} />
          <button style={S.btn()} onClick={send} disabled={loading}>{t.send}</button>
        </div>
      </div>
      <div style={{...S.card, width:320, overflow:'auto'}}>
        <div style={S.cardTitle}>{t.agent_log}</div>
        {!lastResult && <div style={{color:'#64748b',fontSize:12}}>{t.send_to_see_log}</div>}
        {lastResult && (
          <>
            <div style={{fontSize:11,color:'#64748b',marginBottom:8}}>{t.session_label}: {lastResult.sessionId?.slice(0,8)}... | {lastResult.durationMs}ms</div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:12}}>{t.intents_label}: {lastResult.intentsDetected?.join(', ')}</div>
            {lastResult.agentLog?.map((log,i) => (
              <div key={i} style={{padding:'6px 0', borderBottom:`1px solid ${S.divider.borderBottom.split(' ')[2]}`, fontSize:11}}>
                <span style={S.agentTag(log.agent)}>{log.agent}</span>
                <span style={{color:'#94a3b8'}}>{log.action}</span>
                {log.tool && <span style={{...S.tag('#1e3a5f'), marginLeft:4}}>🛠 {log.tool}</span>}
                {log.subAgent && <span style={{...S.tag('#3b1f5e'), marginLeft:4}}>→ {log.subAgent}</span>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Kit Requests ──────────────────────────────────────────────────────────────
function KitRequests({ mothers }) {
  const { t, S } = useApp();
  const [kits, setKits] = useState([]);
  const [motherId, setMotherId] = useState(mothers[0]?.id || 'MTR001');
  const [kitType, setKitType] = useState('prenatal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { api.getKitRequests().then(setKits); }, []);

  const request = async () => {
    setLoading(true);
    const r = await api.requestKit(motherId, kitType);
    setResult(r);
    api.getKitRequests().then(setKits);
    setLoading(false);
  };

  return (
    <div>
      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.cardTitle}>{t.request_kit}</div>
          <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:8}}>
            <select value={motherId} onChange={e=>setMotherId(e.target.value)} style={S.input}>
              {mothers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={kitType} onChange={e=>setKitType(e.target.value)} style={S.input}>
              <option value="prenatal">{t.kit_prenatal}</option>
              <option value="delivery">{t.kit_delivery}</option>
              <option value="newborn">{t.kit_newborn}</option>
              <option value="nutrition">{t.kit_nutrition}</option>
            </select>
            <button style={S.btn()} onClick={request} disabled={loading}>{loading ? t.requesting : t.request_btn}</button>
          </div>
          {result && (
            <div style={{marginTop:12, padding:12, background:'#0f172a', borderRadius:8, fontSize:12}}>
              {result.success ? (
                <>
                  <div style={{color:'#4ade80',marginBottom:4}}>✅ {result.message}</div>
                  <div style={{color:'#64748b'}}>TX: {result.txHash?.slice(0,30)}...</div>
                  <div style={{color:'#64748b'}}>{t.usdc_escrowed}: ${result.usdcEscrowed}</div>
                  <div style={{color:'#64748b'}}>{t.did_verified}: {result.didVerified?'✅':'❌'}</div>
                </>
              ) : <div style={{color:'#f87171'}}>❌ {result.error}</div>}
            </div>
          )}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>{t.kit_stats}</div>
          <div style={S.stat}>{kits.length}</div>
          <div style={S.statSub}>{t.total_requests}</div>
          <div style={{marginTop:12, fontSize:13, color:'#64748b'}}>{t.usdc_total}: ${kits.reduce((s,k)=>s+(k.usdc_escrowed||0),0)}</div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>{t.kit_history}</div>
        {kits.length===0 && <div style={{color:'#64748b',fontSize:13}}>{t.no_requests}</div>}
        <table style={S.table}>
          <thead><tr>{[t.col_mother,'Kit',t.status,'USDC','DID',t.time].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {kits.map((k,i) => (
              <tr key={i}>
                <td style={S.td}>{k.mother_name}</td>
                <td style={S.td}>{k.kit_type}</td>
                <td style={S.td}><span style={S.badge('#0284c7')}>{k.status}</span></td>
                <td style={S.td}>${k.usdc_escrowed}</td>
                <td style={S.td}>{k.did_verified?'✅':'❌'}</td>
                <td style={S.td}>{new Date(k.created_at).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Health Audit ──────────────────────────────────────────────────────────────
function HealthAudit({ mothers }) {
  const { t, S } = useApp();
  const [auditData, setAuditData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.getAuditAll().then(setAuditData); }, []);

  const auditOne = async (id) => {
    setLoading(true);
    setSelected(await api.getAudit(id));
    setLoading(false);
  };

  return (
    <div style={{display:'flex', gap:16}}>
      <div style={{flex:1}}>
        {auditData && (
          <div style={S.grid3}>
            <div style={S.card}><div style={S.cardTitle}>{t.total_mothers}</div><div style={S.stat}>{auditData.totalMothers}</div></div>
            <div style={S.card}><div style={S.cardTitle}>{t.high_risk}</div><div style={{...S.stat,color:'#f87171'}}>{auditData.highRisk}</div></div>
            <div style={S.card}><div style={S.cardTitle}>{t.no_bpjs}</div><div style={{...S.stat,color:'#fbbf24'}}>{auditData.uncoveredBPJS}</div></div>
          </div>
        )}
        <div style={S.card}>
          <div style={S.cardTitle}>{t.audit_all}</div>
          <table style={S.table}>
            <thead><tr>{[t.name,t.region,t.phase,t.days,t.bpjs,t.risk,t.needs_attention,t.action].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(auditData?.mothers||[]).map((m,i) => (
                <tr key={i}>
                  <td style={S.td}>{m.name}</td>
                  <td style={S.td}>{m.region}</td>
                  <td style={S.td}>{m.phase}</td>
                  <td style={S.td}>{m.daysInJourney}</td>
                  <td style={S.td}><span style={S.badge(m.bpjsCovered?'#15803d':'#b91c1c')}>{m.bpjsCovered?t.active:t.inactive}</span></td>
                  <td style={S.td}><span style={S.riskBadge(m.riskLevel)}>{m.riskLevel}</span></td>
                  <td style={S.td}>{m.needsAttention?<span style={S.badge('#dc2626')}>{t.needs_attn_yes}</span>:<span style={S.badge('#15803d')}>{t.needs_attn_no}</span>}</td>
                  <td style={S.td}><button style={S.btnSm('#7c3aed')} onClick={()=>auditOne(m.id)}>{t.audit_btn}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <div style={{...S.card, width:300, overflow:'auto'}}>
          <div style={S.cardTitle}>{t.audit_detail}</div>
          <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>{selected.mother?.name}</div>
          <div style={{fontSize:12,color:'#64748b',marginBottom:12}}>{selected.summary}</div>
          <div style={{fontSize:12,marginBottom:8}}><span style={S.badge(selected.bpjsStatus?.covered?'#15803d':'#b91c1c')}>BPJS: {selected.bpjsStatus?.status}</span></div>
          {selected.risks?.length>0 && (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.risks_label}:</div>
              {selected.risks.map((r,i)=><div key={i} style={{...S.tag('#7f1d1d'),marginBottom:4}}>{r}</div>)}
            </div>
          )}
          {selected.upcomingMilestones?.length>0 && (
            <div>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.upcoming_milestones}:</div>
              {selected.upcomingMilestones.map((m,i)=>(
                <div key={i} style={{padding:'6px 0',borderBottom:`1px solid ${S.divider.borderBottom.split(' ')[2]}`,fontSize:12}}>
                  <div style={{color:'#38bdf8'}}>{m.label}</div>
                  <div style={{color:'#64748b'}}>{m.daysUntil} {t.days_until} ({t.day_label} {m.day})</div>
                </div>
              ))}
            </div>
          )}
          {loading && <div style={{color:'#64748b',fontSize:12}}>{t.loading}</div>}
          <button style={{...S.btnSm(),marginTop:12}} onClick={()=>setSelected(null)}>{t.close}</button>
        </div>
      )}
    </div>
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function Sessions() {
  const { t, S } = useApp();
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { api.getSessions().then(setSessions); }, []);

  return (
    <div style={S.card}>
      <div style={{...S.cardTitle,marginBottom:16}}>{t.session_history} ({sessions.length})</div>
      {sessions.length===0 && <div style={{color:'#64748b',fontSize:13}}>{t.no_sessions}</div>}
      {sessions.map((s,i) => (
        <div key={i} style={{padding:'10px 0', borderBottom:`1px solid ${S.divider.borderBottom.split(' ')[2]}`}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <span style={S.agentTag(s.agent_name)}>{s.agent_name}</span>
              <span style={{fontSize:13,color:S.topbarTitle.color}}>{s.input?.slice(0,60)}{s.input?.length>60?'...':''}</span>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={S.badge(s.status==='completed'?'#15803d':'#d97706')}>{s.status}</span>
              <span style={{fontSize:11,color:'#64748b'}}>{new Date(s.created_at).toLocaleTimeString()}</span>
              <button style={S.btnSm()} onClick={()=>setExpanded(expanded===i?null:i)}>
                {expanded===i?t.collapse:t.expand}
              </button>
            </div>
          </div>
          {expanded===i && s.output && (
            <div style={{marginTop:8,padding:10,background:'#0f172a',borderRadius:8,fontSize:11,color:'#94a3b8',whiteSpace:'pre-wrap',maxHeight:200,overflow:'auto'}}>
              {JSON.stringify(JSON.parse(s.output),null,2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Vaccination Calendar ──────────────────────────────────────────────────────
function VaccinationCalendar() {
  const { t, S, theme } = useApp();
  const [rows, setRows] = useState([]);
  const [puskesmasList, setPuskesmasList] = useState([]);
  const [filters, setFilters] = useState({ status:'', type:'', puskesmas:'', vaccine_name:'' });
  const [stats, setStats] = useState({});

  const load = async (f) => {
    const data = await api.getVaccinations(f);
    setRows(data);
    setStats({ total:data.length, taken:data.filter(r=>r.status==='taken').length, planned:data.filter(r=>r.status==='planned').length });
  };

  useEffect(() => { api.getPuskesmas().then(setPuskesmasList); load({}); }, []);

  const applyFilter = (key, val) => { const f={...filters,[key]:val}; setFilters(f); load(f); };
  const resetFilters = () => { const f={status:'',type:'',puskesmas:'',vaccine_name:''}; setFilters(f); load(f); };

  const statusColor = (s) => s==='taken'?'#15803d':s==='planned'?'#0284c7':'#6b7280';
  const typeColor   = (tp) => tp==='wajib'?'#7c3aed':tp==='lanjutan'?'#d97706':'#0e7490';
  const fmtDate     = (d) => d ? new Date(d).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}) : '-';
  const isOverdue   = (row) => row.status==='planned' && new Date(row.date) < new Date();

  return (
    <div>
      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>{t.total_scheduled}</div><div style={S.stat}>{stats.total||0}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.given}</div><div style={{...S.stat,color:'#4ade80'}}>{stats.taken||0}</div></div>
        <div style={S.card}><div style={S.cardTitle}>{t.planned}</div><div style={{...S.stat,color:'#38bdf8'}}>{stats.planned||0}</div></div>
      </div>

      <div style={{...S.card,marginBottom:16}}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.filter_title}</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_status}</div>
            <div style={{display:'flex',gap:6}}>
              {[['','all'],['taken','taken'],['planned','planned_btn']].map(([val,key]) => (
                <button key={val} style={{...S.btnSm(filters.status===val?(statusColor(val)||'#0ea5e9'):undefined),color:'#fff'}}
                  onClick={()=>applyFilter('status',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_type}</div>
            <div style={{display:'flex',gap:6}}>
              {[['','all'],['wajib','mandatory'],['lanjutan','booster'],['prenatal','prenatal_type']].map(([val,key]) => (
                <button key={val} style={{...S.btnSm(filters.type===val?typeColor(val):undefined),color:'#fff'}}
                  onClick={()=>applyFilter('type',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_puskesmas}</div>
            <select value={filters.puskesmas} onChange={e=>applyFilter('puskesmas',e.target.value)} style={{...S.input,width:220,padding:'5px 10px'}}>
              <option value=''>{t.all_centers}</option>
              {puskesmasList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_name}</div>
            <input style={{...S.input,width:160,padding:'5px 10px'}} placeholder={t.search_vaccine}
              value={filters.vaccine_name} onChange={e=>applyFilter('vaccine_name',e.target.value)} />
          </div>
          <button style={S.btnSm('#475569')} onClick={resetFilters}>{t.reset}</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.vacc_table_title} ({rows.length} {t.entries})</div>
        <table style={S.table}>
          <thead><tr>{[t.col_mother,t.col_vaccine,t.col_type,t.col_status,t.col_date,t.col_center,t.col_notes].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} style={{background: isOverdue(r) ? theme.rowOverdue : theme.rowAlt}}>
                <td style={S.td}>{r.mother_name}</td>
                <td style={S.td}><span style={{fontWeight:600}}>{r.vaccine_name}</span></td>
                <td style={S.td}><span style={S.badge(typeColor(r.type))}>{r.type}</span></td>
                <td style={S.td}>
                  <span style={S.badge(statusColor(r.status))}>{r.status==='taken'?t.taken:t.planned_btn}</span>
                  {isOverdue(r) && <span style={{...S.badge('#dc2626'),marginLeft:4}}>{t.overdue}</span>}
                </td>
                <td style={S.td}>{fmtDate(r.date)}</td>
                <td style={S.td}><span style={{fontSize:12,color:'#94a3b8'}}>{r.puskesmas_name}</span></td>
                <td style={S.td}><span style={{fontSize:11,color:'#64748b'}}>{r.notes||'-'}</span></td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'#64748b'}}>{t.no_data}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Kit Delivery Tracking ─────────────────────────────────────────────────────
function KitDeliveryTracking() {
  const { t, S, theme } = useApp();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [puskesmasList, setPuskesmasList] = useState([]);
  const [filters, setFilters] = useState({ status:'', kit_type:'', puskesmas:'' });

  const load = async (f) => {
    const [data, s] = await Promise.all([api.getKitDeliveries(f), api.getKitDeliveryStats()]);
    setRows(data); setStats(s);
  };

  useEffect(() => { api.getPuskesmas().then(setPuskesmasList); load({}); }, []);

  const applyFilter = (key, val) => { const f={...filters,[key]:val}; setFilters(f); load(f); };
  const resetFilters = () => { const f={status:'',kit_type:'',puskesmas:''}; setFilters(f); load(f); };

  const statusCfg = {
    delivered:  { color:'#15803d', key:'delivered' },
    in_transit: { color:'#0284c7', key:'in_transit' },
    ordered:    { color:'#d97706', key:'ordered' },
    failed:     { color:'#dc2626', key:'failed' },
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}) : '-';
  const deliveryDays = (row) => (!row.ordered_at||!row.delivered_at) ? null : Math.round((new Date(row.delivered_at)-new Date(row.ordered_at))/86400000);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
        {[['total','#f1f5f9'],['delivered','#4ade80'],['in_transit','#38bdf8'],['ordered','#fbbf24'],['failed','#f87171']].map(([key,color]) => (
          <div key={key} style={S.card}><div style={S.cardTitle}>{t[key]||key}</div><div style={{...S.stat,color}}>{stats[key]||0}</div></div>
        ))}
      </div>

      <div style={{...S.card,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <span style={{fontSize:13,color:'#94a3b8'}}>{t.delivery_rate}</span>
          <span style={{fontSize:16,fontWeight:700,color:'#4ade80'}}>{stats.delivery_rate||'0%'}</span>
        </div>
        <div style={{background:theme.barBg,borderRadius:8,height:12,overflow:'hidden'}}>
          <div style={{background:'#22c55e',height:'100%',width:stats.delivery_rate||'0%',borderRadius:8,transition:'width 0.5s'}} />
        </div>
      </div>

      <div style={{...S.card,marginBottom:16}}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.filter_delivery}</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_status_d}</div>
            <div style={{display:'flex',gap:6}}>
              {[['','all_statuses'],['ordered','ordered'],['in_transit','in_transit'],['delivered','delivered'],['failed','failed']].map(([val,key]) => (
                <button key={val} style={{...S.btnSm(filters.status===val?(statusCfg[val]?.color||'#0ea5e9'):undefined),color:'#fff',fontSize:11}}
                  onClick={()=>applyFilter('status',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_kit_type}</div>
            <div style={{display:'flex',gap:6}}>
              {[['','all_kits'],['prenatal','kit_prenatal_s'],['delivery','kit_delivery_s'],['newborn','kit_newborn_s'],['nutrition','kit_nutrition_s']].map(([val,key]) => (
                <button key={val} style={{...S.btnSm(filters.kit_type===val?'#7c3aed':undefined),color:'#fff',fontSize:11}}
                  onClick={()=>applyFilter('kit_type',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.filter_puskesmas}</div>
            <select value={filters.puskesmas} onChange={e=>applyFilter('puskesmas',e.target.value)} style={{...S.input,width:220,padding:'5px 10px'}}>
              <option value=''>{t.all_centers}</option>
              {puskesmasList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button style={S.btnSm('#475569')} onClick={resetFilters}>{t.reset}</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.delivery_table} ({rows.length} {t.entries})</div>
        <table style={S.table}>
          <thead><tr>{[t.col_mother,t.col_kit,t.col_status,t.col_ordered,t.col_dispatched,t.col_received,t.col_days,t.col_center,t.col_proof,t.col_notes].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r,i) => {
              const days = deliveryDays(r);
              return (
                <tr key={i} style={{background: r.status==='failed' ? theme.rowOverdue : theme.rowAlt}}>
                  <td style={S.td}>{r.mother_name}</td>
                  <td style={S.td}><span style={S.badge('#7c3aed')}>{r.kit_type}</span></td>
                  <td style={S.td}><span style={S.badge(statusCfg[r.status]?.color||'#6b7280')}>{t[statusCfg[r.status]?.key]||r.status}</span></td>
                  <td style={S.td}>{fmtDate(r.ordered_at)}</td>
                  <td style={S.td}>{fmtDate(r.dispatched_at)}</td>
                  <td style={S.td}>{fmtDate(r.delivered_at)}</td>
                  <td style={S.td}>{days!==null?<span style={{color:days<=3?'#4ade80':days<=7?'#fbbf24':'#f87171',fontWeight:600}}>{days} {t.days_label}</span>:'-'}</td>
                  <td style={S.td}><span style={{fontSize:11,color:'#94a3b8'}}>{r.puskesmas_name}</span></td>
                  <td style={S.td}>{r.proof_hash?<span style={{fontSize:10,color:'#4ade80',fontFamily:'monospace'}}>{r.proof_hash.slice(0,10)}...</span>:'-'}</td>
                  <td style={S.td}><span style={{fontSize:11,color:'#64748b'}}>{r.notes}</span></td>
                </tr>
              );
            })}
            {rows.length===0 && <tr><td colSpan={10} style={{...S.td,textAlign:'center',color:'#64748b'}}>{t.no_data}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = (t) => [
  { id:'overview',  label: t.nav_overview },
  { id:'chat',      label: t.nav_chat },
  { id:'mothers',   label: t.nav_mothers },
  { id:'calendar',  label: t.nav_calendar },
  { id:'delivery',  label: t.nav_delivery },
  { id:'audit',     label: t.nav_audit },
  { id:'kits',      label: t.nav_kits },
  { id:'sessions',  label: t.nav_sessions },
];

export default function App() {
  const [tab, setTab] = useState('overview');
  const [mothers, setMothers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lang, setLang] = useState(() => localStorage.getItem('ns_lang') || 'en');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ns_theme') !== 'light');

  const t     = translations[lang];
  const theme = isDark ? themes.dark : themes.light;
  const S     = makeS(theme);

  const toggleLang = () => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('ns_lang', next);
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('ns_theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    api.getMothers().then(setMothers);
    api.getAlerts().then(setAlerts);
    const iv = setInterval(() => api.getAlerts().then(setAlerts), 10000);
    return () => clearInterval(iv);
  }, []);

  const handleSelectMother = useCallback((m) => { setTab('audit'); }, []);

  const tabs = TABS(t);
  const tabLabel = tabs.find(tb => tb.id === tab)?.label || '';

  const ctx = { t, S, theme, lang, isDark };

  return (
    <AppCtx.Provider value={ctx}>
      <div style={S.app}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          <div style={S.logo}>
            <div style={S.logoTitle}>NutriSakti</div>
            <div style={S.logoSub}>{t.app_subtitle}</div>
          </div>

          {tabs.map(tb => (
            <button key={tb.id} style={S.navBtn(tab === tb.id)} onClick={() => setTab(tb.id)}>
              {tb.label}
            </button>
          ))}

          {/* Settings at bottom */}
          <div style={{marginTop:'auto', padding:'16px 20px', borderTop:`1px solid ${theme.border}`}}>
            <div style={{fontSize:11, color:theme.textFaint, marginBottom:10, textTransform:'uppercase', letterSpacing:1}}>{t.settings}</div>

            {/* Language toggle */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
              <span style={{fontSize:12, color:theme.textMuted}}>{t.language}</span>
              <button onClick={toggleLang} style={{
                background: theme.border, border:'none', borderRadius:20, padding:'3px 10px',
                cursor:'pointer', fontSize:12, color:theme.text, fontWeight:600
              }}>
                {lang === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}
              </button>
            </div>

            {/* Theme toggle */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:12, color:theme.textMuted}}>{t.theme}</span>
              <button onClick={toggleTheme} style={{
                background: isDark ? '#334155' : '#e2e8f0', border:'none', borderRadius:20,
                padding:'3px 10px', cursor:'pointer', fontSize:12, color:theme.text, fontWeight:600
              }}>
                {isDark ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>

            {/* MCP tools */}
            <div style={{marginTop:14, paddingTop:12, borderTop:`1px solid ${theme.border}`}}>
              <div style={{fontSize:11, color:theme.textFaint, marginBottom:4}}>MCP Tools</div>
              {['calendar','database','blockchain','whatsapp'].map(tool => (
                <div key={tool} style={{fontSize:11, color:theme.accent, padding:'2px 0'}}>🛠 {tool}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={S.main}>
          <div style={S.topbar}>
            <div style={S.topbarTitle}>{tabLabel}</div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              {alerts.filter(a => a.severity==='high').length > 0 && (
                <span style={S.badge('#dc2626')}>🔴 {alerts.filter(a=>a.severity==='high').length} Critical</span>
              )}
              <span style={S.badge('#0284c7')}>{t.api_label}: :8080</span>
              <span style={S.badge('#15803d')}>{mothers.length} {t.total_mothers}</span>
            </div>
          </div>

          <div style={S.content}>
            {tab==='overview'  && <Overview mothers={mothers} alerts={alerts} />}
            {tab==='chat'      && <AgentChat mothers={mothers} />}
            {tab==='mothers'   && <Mothers mothers={mothers} onSelect={handleSelectMother} />}
            {tab==='calendar'  && <VaccinationCalendar />}
            {tab==='delivery'  && <KitDeliveryTracking />}
            {tab==='audit'     && <HealthAudit mothers={mothers} />}
            {tab==='kits'      && <KitRequests mothers={mothers} />}
            {tab==='sessions'  && <Sessions />}
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );
}
