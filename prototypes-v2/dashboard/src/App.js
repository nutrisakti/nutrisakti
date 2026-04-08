import React, { useState, useEffect, useCallback } from 'react';
import * as api from './api';

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  app: { display:'flex', height:'100vh', background:'#0f172a', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' },
  sidebar: { width:220, background:'#1e293b', padding:'20px 0', display:'flex', flexDirection:'column', borderRight:'1px solid #334155' },
  logo: { padding:'0 20px 24px', borderBottom:'1px solid #334155', marginBottom:16 },
  logoTitle: { fontSize:20, fontWeight:700, color:'#38bdf8' },
  logoSub: { fontSize:11, color:'#64748b', marginTop:2 },
  navBtn: (active) => ({ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', cursor:'pointer', background: active ? '#0f172a' : 'transparent', color: active ? '#38bdf8' : '#94a3b8', border:'none', width:'100%', textAlign:'left', fontSize:14, borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent' }),
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { background:'#1e293b', padding:'12px 24px', borderBottom:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between' },
  topbarTitle: { fontSize:18, fontWeight:600 },
  badge: (color) => ({ background:color, color:'#fff', padding:'2px 8px', borderRadius:12, fontSize:11, fontWeight:600 }),
  content: { flex:1, overflow:'auto', padding:24 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
  grid3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 },
  card: { background:'#1e293b', borderRadius:12, padding:20, border:'1px solid #334155' },
  cardTitle: { fontSize:13, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:1 },
  stat: { fontSize:32, fontWeight:700, color:'#f1f5f9' },
  statSub: { fontSize:12, color:'#64748b', marginTop:4 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'8px 12px', fontSize:12, color:'#64748b', borderBottom:'1px solid #334155', textTransform:'uppercase' },
  td: { padding:'10px 12px', fontSize:13, borderBottom:'1px solid #1e293b', verticalAlign:'middle' },
  riskBadge: (r) => ({ padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600, background: r==='high'?'#7f1d1d': r==='medium'?'#78350f':'#14532d', color: r==='high'?'#fca5a5': r==='medium'?'#fcd34d':'#86efac' }),
  btn: (color='#0ea5e9') => ({ background:color, color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }),
  btnSm: (color='#334155') => ({ background:color, color:'#e2e8f0', border:'none', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:12 }),
  input: { background:'#0f172a', border:'1px solid #334155', color:'#e2e8f0', padding:'10px 14px', borderRadius:8, fontSize:14, width:'100%', outline:'none' },
  chatBubble: (isUser) => ({ alignSelf: isUser?'flex-end':'flex-start', background: isUser?'#0ea5e9':'#1e293b', color:'#f1f5f9', padding:'10px 14px', borderRadius:12, maxWidth:'80%', fontSize:13, lineHeight:1.5, border:'1px solid #334155', whiteSpace:'pre-wrap' }),
  agentTag: (name) => ({ display:'inline-block', padding:'1px 6px', borderRadius:4, fontSize:10, fontWeight:700, marginRight:4, background: name==='GuardianAgent'?'#1d4ed8': name==='NutritionAgent'?'#065f46': name==='LogisticsAgent'?'#7c3aed':'#9a3412', color:'#fff' }),
  tag: (color='#334155') => ({ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background:color, color:'#e2e8f0', marginRight:4 }),
};

// ── Overview Panel ────────────────────────────────────────────────────────────
function Overview({ mothers, alerts }) {
  const high = mothers.filter(m => m.risk_level === 'high').length;
  const noBpjs = mothers.filter(m => !m.bpjs_status).length;
  const phases = { pregnancy: 0, infant: 0, toddler: 0 };
  mothers.forEach(m => { if (phases[m.phase] !== undefined) phases[m.phase]++; });

  return (
    <div>
      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>Total Ibu</div><div style={S.stat}>{mothers.length}</div><div style={S.statSub}>Terdaftar di sistem</div></div>
        <div style={S.card}><div style={S.cardTitle}>Risiko Tinggi</div><div style={{...S.stat, color:'#f87171'}}>{high}</div><div style={S.statSub}>Perlu perhatian segera</div></div>
        <div style={S.card}><div style={S.cardTitle}>Tanpa BPJS</div><div style={{...S.stat, color:'#fbbf24'}}>{noBpjs}</div><div style={S.statSub}>Belum terdaftar</div></div>
      </div>
      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>🤰 Hamil</div><div style={S.stat}>{phases.pregnancy}</div></div>
        <div style={S.card}><div style={S.cardTitle}>👶 Bayi (0-12 bln)</div><div style={S.stat}>{phases.infant}</div></div>
        <div style={S.card}><div style={S.cardTitle}>🧒 Balita (1-2 thn)</div><div style={S.stat}>{phases.toddler}</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>🔔 Alert Aktif ({alerts.length})</div>
        {alerts.length === 0 && <div style={{color:'#64748b', fontSize:13}}>Tidak ada alert aktif</div>}
        {alerts.slice(0, 5).map((a, i) => (
          <div key={i} style={{padding:'8px 0', borderBottom:'1px solid #334155', fontSize:13, display:'flex', gap:8, alignItems:'flex-start'}}>
            <span style={S.badge(a.severity === 'high' ? '#dc2626' : a.severity === 'warning' ? '#d97706' : '#0284c7')}>{a.severity}</span>
            <span style={{color:'#94a3b8', fontSize:11, minWidth:80}}>{a.type}</span>
            <span>{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mothers Panel ─────────────────────────────────────────────────────────────
function Mothers({ mothers, onSelect }) {
  return (
    <div style={S.card}>
      <div style={{...S.cardTitle, marginBottom:16}}>Daftar Ibu ({mothers.length})</div>
      <table style={S.table}>
        <thead>
          <tr>
            {['Nama','Usia','Fase','Hari','Wilayah','BPJS','Risiko','Aksi'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mothers.map(m => (
            <tr key={m.id} style={{background:'#0f172a'}}>
              <td style={S.td}><div style={{fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:'#64748b'}}>{m.id}</div></td>
              <td style={S.td}>{m.age} thn</td>
              <td style={S.td}>{m.phase === 'pregnancy' ? '🤰 Hamil' : m.phase === 'infant' ? '👶 Bayi' : '🧒 Balita'}</td>
              <td style={S.td}>{m.days_in_journey}</td>
              <td style={S.td}>{m.village}, {m.region}</td>
              <td style={S.td}><span style={S.badge(m.bpjs_status ? '#15803d' : '#b91c1c')}>{m.bpjs_status ? 'Aktif' : 'Tidak'}</span></td>
              <td style={S.td}><span style={S.riskBadge(m.risk_level)}>{m.risk_level}</span></td>
              <td style={S.td}><button style={S.btnSm('#0ea5e9')} onClick={() => onSelect(m)}>Detail</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Guardian Agent Chat ───────────────────────────────────────────────────────
function AgentChat({ mothers }) {
  const [motherId, setMotherId] = useState(mothers[0]?.id || 'MTR001');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: '👋 Halo! Saya Guardian Agent NutriSakti.\n\nCoba ketik:\n• "saya makan daun kelor tapi pusing"\n• "minta kit prenatal"\n• "cek status bpjs"\n• "audit semua ibu"' }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const result = await api.chat(motherId, userMsg);
      setLastResult(result);
      setMessages(m => [...m, { role: 'agent', text: result.response, agentLog: result.agentLog }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'agent', text: '❌ Error: ' + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:'flex', gap:16, height:'calc(100vh - 120px)'}}>
      {/* Chat */}
      <div style={{...S.card, flex:1, display:'flex', flexDirection:'column', gap:0, padding:0, overflow:'hidden'}}>
        <div style={{padding:'14px 20px', borderBottom:'1px solid #334155', display:'flex', gap:12, alignItems:'center'}}>
          <span style={{fontSize:13, color:'#64748b'}}>Ibu:</span>
          <select value={motherId} onChange={e => setMotherId(e.target.value)}
            style={{...S.input, width:'auto', padding:'4px 10px'}}>
            {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <span style={S.agentTag('GuardianAgent')}>GuardianAgent</span>
        </div>
        <div style={{flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:10}}>
          {messages.map((msg, i) => (
            <div key={i} style={S.chatBubble(msg.role === 'user')}>
              {msg.role === 'agent' && <div style={{fontSize:10, color:'#38bdf8', marginBottom:4}}>🤖 Guardian Agent</div>}
              {msg.text}
            </div>
          ))}
          {loading && <div style={S.chatBubble(false)}>⏳ Memproses multi-agent workflow...</div>}
        </div>
        <div style={{padding:12, borderTop:'1px solid #334155', display:'flex', gap:8}}>
          <input style={S.input} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ketik pesan dalam Bahasa Indonesia..." />
          <button style={S.btn()} onClick={send} disabled={loading}>Kirim</button>
        </div>
      </div>

      {/* Agent Log */}
      <div style={{...S.card, width:320, overflow:'auto'}}>
        <div style={S.cardTitle}>Agent Execution Log</div>
        {!lastResult && <div style={{color:'#64748b', fontSize:12}}>Kirim pesan untuk melihat log</div>}
        {lastResult && (
          <>
            <div style={{fontSize:11, color:'#64748b', marginBottom:8}}>
              Session: {lastResult.sessionId?.slice(0,8)}... | {lastResult.durationMs}ms
            </div>
            <div style={{fontSize:11, color:'#64748b', marginBottom:12}}>
              Intents: {lastResult.intentsDetected?.join(', ')}
            </div>
            {lastResult.agentLog?.map((log, i) => (
              <div key={i} style={{padding:'6px 0', borderBottom:'1px solid #334155', fontSize:11}}>
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

// ── Kit Requests Panel ────────────────────────────────────────────────────────
function KitRequests({ mothers }) {
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
    const updated = await api.getKitRequests();
    setKits(updated);
    setLoading(false);
  };

  return (
    <div>
      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.cardTitle}>🛒 Minta Kit Baru (LogisticsAgent)</div>
          <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:8}}>
            <select value={motherId} onChange={e => setMotherId(e.target.value)} style={S.input}>
              {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={kitType} onChange={e => setKitType(e.target.value)} style={S.input}>
              <option value="prenatal">Kit Perawatan Prenatal ($25 USDC)</option>
              <option value="delivery">Kit Persalinan Aman ($35 USDC)</option>
              <option value="newborn">Perlengkapan Bayi Baru Lahir ($20 USDC)</option>
              <option value="nutrition">Kit Dukungan Nutrisi ($15 USDC)</option>
            </select>
            <button style={S.btn()} onClick={request} disabled={loading}>
              {loading ? '⏳ Memproses...' : '📦 Minta Kit (DID + USDC Escrow)'}
            </button>
          </div>
          {result && (
            <div style={{marginTop:12, padding:12, background:'#0f172a', borderRadius:8, fontSize:12}}>
              {result.success ? (
                <>
                  <div style={{color:'#4ade80', marginBottom:4}}>✅ {result.message}</div>
                  <div style={{color:'#64748b'}}>TX: {result.txHash?.slice(0,30)}...</div>
                  <div style={{color:'#64748b'}}>USDC Escrowed: ${result.usdcEscrowed}</div>
                  <div style={{color:'#64748b'}}>DID Verified: {result.didVerified ? '✅' : '❌'}</div>
                </>
              ) : (
                <div style={{color:'#f87171'}}>❌ {result.error}</div>
              )}
            </div>
          )}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>📊 Statistik Kit</div>
          <div style={S.stat}>{kits.length}</div>
          <div style={S.statSub}>Total permintaan</div>
          <div style={{marginTop:12, fontSize:13, color:'#64748b'}}>
            USDC Total: ${kits.reduce((s, k) => s + (k.usdc_escrowed || 0), 0)}
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Riwayat Permintaan Kit</div>
        {kits.length === 0 && <div style={{color:'#64748b', fontSize:13}}>Belum ada permintaan</div>}
        <table style={S.table}>
          <thead><tr>{['Ibu','Kit','Status','USDC','DID','Waktu'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {kits.map((k, i) => (
              <tr key={i}>
                <td style={S.td}>{k.mother_name}</td>
                <td style={S.td}>{k.kit_type}</td>
                <td style={S.td}><span style={S.badge('#0284c7')}>{k.status}</span></td>
                <td style={S.td}>${k.usdc_escrowed}</td>
                <td style={S.td}>{k.did_verified ? '✅' : '❌'}</td>
                <td style={S.td}>{new Date(k.created_at).toLocaleTimeString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Health Audit Panel ────────────────────────────────────────────────────────
function HealthAudit({ mothers }) {
  const [auditData, setAuditData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAuditAll().then(setAuditData);
  }, []);

  const auditOne = async (id) => {
    setLoading(true);
    const r = await api.getAudit(id);
    setSelected(r);
    setLoading(false);
  };

  return (
    <div style={{display:'flex', gap:16}}>
      <div style={{flex:1}}>
        {auditData && (
          <div style={S.grid3}>
            <div style={S.card}><div style={S.cardTitle}>Total Ibu</div><div style={S.stat}>{auditData.totalMothers}</div></div>
            <div style={S.card}><div style={S.cardTitle}>Risiko Tinggi</div><div style={{...S.stat,color:'#f87171'}}>{auditData.highRisk}</div></div>
            <div style={S.card}><div style={S.cardTitle}>Tanpa BPJS</div><div style={{...S.stat,color:'#fbbf24'}}>{auditData.uncoveredBPJS}</div></div>
          </div>
        )}
        <div style={S.card}>
          <div style={S.cardTitle}>Audit Semua Ibu (HealthAuditAgent)</div>
          <table style={S.table}>
            <thead><tr>{['Nama','Wilayah','Fase','Hari','BPJS','Risiko','Perlu Perhatian','Audit'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(auditData?.mothers || []).map((m, i) => (
                <tr key={i}>
                  <td style={S.td}>{m.name}</td>
                  <td style={S.td}>{m.region}</td>
                  <td style={S.td}>{m.phase}</td>
                  <td style={S.td}>{m.daysInJourney}</td>
                  <td style={S.td}><span style={S.badge(m.bpjsCovered?'#15803d':'#b91c1c')}>{m.bpjsCovered?'Aktif':'Tidak'}</span></td>
                  <td style={S.td}><span style={S.riskBadge(m.riskLevel)}>{m.riskLevel}</span></td>
                  <td style={S.td}>{m.needsAttention ? <span style={S.badge('#dc2626')}>⚠️ Ya</span> : <span style={S.badge('#15803d')}>✅ Tidak</span>}</td>
                  <td style={S.td}><button style={S.btnSm('#7c3aed')} onClick={() => auditOne(m.id)}>Audit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{...S.card, width:300, overflow:'auto'}}>
          <div style={S.cardTitle}>Detail Audit</div>
          <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>{selected.mother?.name}</div>
          <div style={{fontSize:12, color:'#64748b', marginBottom:12}}>{selected.summary}</div>
          <div style={{fontSize:12, marginBottom:8}}>
            <span style={S.badge(selected.bpjsStatus?.covered?'#15803d':'#b91c1c')}>
              BPJS: {selected.bpjsStatus?.status}
            </span>
          </div>
          {selected.risks?.length > 0 && (
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11, color:'#64748b', marginBottom:4}}>Risiko:</div>
              {selected.risks.map((r,i) => <div key={i} style={{...S.tag('#7f1d1d'), marginBottom:4}}>{r}</div>)}
            </div>
          )}
          {selected.upcomingMilestones?.length > 0 && (
            <div>
              <div style={{fontSize:11, color:'#64748b', marginBottom:4}}>Milestone Mendatang:</div>
              {selected.upcomingMilestones.map((m,i) => (
                <div key={i} style={{padding:'6px 0', borderBottom:'1px solid #334155', fontSize:12}}>
                  <div style={{color:'#38bdf8'}}>{m.label}</div>
                  <div style={{color:'#64748b'}}>{m.daysUntil} hari lagi (Hari {m.day})</div>
                </div>
              ))}
            </div>
          )}
          {loading && <div style={{color:'#64748b', fontSize:12}}>⏳ Memuat...</div>}
          <button style={{...S.btnSm(), marginTop:12}} onClick={() => setSelected(null)}>Tutup</button>
        </div>
      )}
    </div>
  );
}

// ── Sessions Panel ────────────────────────────────────────────────────────────
function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { api.getSessions().then(setSessions); }, []);

  return (
    <div style={S.card}>
      <div style={{...S.cardTitle, marginBottom:16}}>Agent Session History ({sessions.length})</div>
      {sessions.length === 0 && <div style={{color:'#64748b', fontSize:13}}>Belum ada sesi. Coba Guardian Agent Chat.</div>}
      {sessions.map((s, i) => (
        <div key={i} style={{padding:'10px 0', borderBottom:'1px solid #334155'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <span style={S.agentTag(s.agent_name)}>{s.agent_name}</span>
              <span style={{fontSize:13, color:'#e2e8f0'}}>{s.input?.slice(0, 60)}{s.input?.length > 60 ? '...' : ''}</span>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <span style={S.badge(s.status === 'completed' ? '#15803d' : '#d97706')}>{s.status}</span>
              <span style={{fontSize:11, color:'#64748b'}}>{new Date(s.created_at).toLocaleTimeString('id-ID')}</span>
              <button style={S.btnSm()} onClick={() => setExpanded(expanded === i ? null : i)}>
                {expanded === i ? 'Tutup' : 'Detail'}
              </button>
            </div>
          </div>
          {expanded === i && s.output && (
            <div style={{marginTop:8, padding:10, background:'#0f172a', borderRadius:8, fontSize:11, color:'#94a3b8', whiteSpace:'pre-wrap', maxHeight:200, overflow:'auto'}}>
              {JSON.stringify(JSON.parse(s.output), null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: '📊 Overview',        icon: '📊' },
  { id: 'chat',      label: '🤖 Guardian Agent',   icon: '🤖' },
  { id: 'mothers',   label: '👩 Daftar Ibu',       icon: '👩' },
  { id: 'audit',     label: '🔍 Health Audit',     icon: '🔍' },
  { id: 'kits',      label: '📦 Kit Requests',     icon: '📦' },
  { id: 'sessions',  label: '📋 Agent Sessions',   icon: '📋' },
];

export default function App() {
  const [tab, setTab] = useState('overview');
  const [mothers, setMothers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedMother, setSelectedMother] = useState(null);

  useEffect(() => {
    api.getMothers().then(setMothers);
    api.getAlerts().then(setAlerts);
    const interval = setInterval(() => api.getAlerts().then(setAlerts), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMother = useCallback((m) => {
    setSelectedMother(m);
    setTab('audit');
  }, []);

  const tabTitle = TABS.find(t => t.id === tab)?.label || '';

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTitle}>NutriSakti</div>
          <div style={S.logoSub}>Multi-Agent System v2</div>
        </div>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div style={{marginTop:'auto', padding:'16px 20px', borderTop:'1px solid #334155'}}>
          <div style={{fontSize:11, color:'#64748b', marginBottom:4}}>MCP Tools</div>
          {['calendar','database','blockchain','whatsapp'].map(tool => (
            <div key={tool} style={{fontSize:11, color:'#38bdf8', padding:'2px 0'}}>🛠 {tool}</div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.topbarTitle}>{tabTitle}</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            {alerts.filter(a => a.severity === 'high').length > 0 && (
              <span style={S.badge('#dc2626')}>
                🔴 {alerts.filter(a => a.severity === 'high').length} Alert Kritis
              </span>
            )}
            <span style={S.badge('#0284c7')}>API: localhost:3001</span>
            <span style={S.badge('#15803d')}>{mothers.length} Ibu</span>
          </div>
        </div>
        <div style={S.content}>
          {tab === 'overview'  && <Overview mothers={mothers} alerts={alerts} />}
          {tab === 'chat'      && <AgentChat mothers={mothers} />}
          {tab === 'mothers'   && <Mothers mothers={mothers} onSelect={handleSelectMother} />}
          {tab === 'audit'     && <HealthAudit mothers={mothers} />}
          {tab === 'kits'      && <KitRequests mothers={mothers} />}
          {tab === 'sessions'  && <Sessions />}
        </div>
      </div>
    </div>
  );
}
