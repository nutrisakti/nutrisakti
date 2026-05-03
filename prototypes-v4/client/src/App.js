import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import * as api from './api';
import { translations } from './i18n';
import { themes } from './theme';
import { RichCard, FollowUpChips } from './ChatCards';

// ── App Context ───────────────────────────────────────────────────────────────
const AppCtx = createContext({});
const useApp = () => useContext(AppCtx);

// ── Responsive hook ───────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return bp;
}

// ── Theme-aware styles (responsive) ──────────────────────────────────────────
const makeS = (theme, bp) => {
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';
  const isSmall  = isMobile || isTablet;

  // Base font sizes — larger for family-friendly readability
  const fs = {
    xs:   isMobile ? 11 : 12,
    sm:   isMobile ? 13 : 14,
    base: isMobile ? 14 : 15,
    md:   isMobile ? 15 : 16,
    lg:   isMobile ? 17 : 19,
    xl:   isMobile ? 20 : 24,
    xxl:  isMobile ? 26 : 34,
  };

  return {
    // ── Layout ──────────────────────────────────────────────────────────────
    app: {
      display: 'flex', minHeight: '100vh',
      background: theme.bg, color: theme.text,
      fontFamily: '"Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
      fontSize: fs.base,
      position: 'relative',
    },
    sidebar: {
      width: isMobile ? '100%' : isTablet ? 220 : 256,
      background: theme.sidebarGradient,
      display: 'flex', flexDirection: 'column',
      borderRight: 'none',
      flexShrink: 0,
      boxShadow: isMobile ? 'none' : '2px 0 12px rgba(0,0,0,0.15)',
      ...(isMobile ? {
        position: 'fixed', top: 0, left: 0, height: '100%',
        zIndex: 200, transform: 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      } : {}),
    },
    sidebarOpen: { transform: 'translateX(0)' },
    overlay:     { display: isMobile ? 'block' : 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 199 },

    logo: {
      padding: isMobile ? '20px 20px 16px' : '24px 20px 20px',
      borderBottom: `1px solid ${theme.sidebarBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    logoTitle: { fontSize: isMobile ? 20 : 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' },
    logoSub:   { fontSize: fs.xs, color: theme.sidebarMuted, marginTop: 3, fontWeight: 500 },

    navBtn: (active) => ({
      display: 'flex', alignItems: 'center',
      padding: isSmall ? '12px 18px' : '11px 20px',
      cursor: 'pointer',
      background: active ? theme.sidebarActive : 'transparent',
      color: active ? '#fff' : theme.sidebarMuted,
      border: 'none', width: '100%', textAlign: 'left',
      fontSize: isSmall ? fs.sm : fs.sm,
      fontWeight: active ? 700 : 500,
      borderLeft: active ? '3px solid #fff' : '3px solid transparent',
      borderRadius: active ? '0 8px 8px 0' : 0,
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease',
      letterSpacing: '0.1px',
    }),

    main: {
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minWidth: 0,
      ...(isMobile ? { paddingBottom: 68 } : {}),
    },
    topbar: {
      background: theme.surface,
      padding: isMobile ? '12px 16px' : '14px 28px',
      borderBottom: `2px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    topbarLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
    topbarTitle: { fontSize: isMobile ? fs.md : fs.lg, fontWeight: 700, color: theme.text },
    hamburger:   { display: isMobile ? 'flex' : 'none', background: 'none', border: 'none', color: theme.text, fontSize: 24, cursor: 'pointer', padding: '2px 4px', alignItems: 'center' },
    badge:       (color) => ({ background: color, color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: fs.xs, fontWeight: 700, whiteSpace: 'nowrap' }),
    content:     { flex: 1, overflow: 'auto', padding: isMobile ? 14 : isTablet ? 20 : 28 },

    // ── Cards & grids ────────────────────────────────────────────────────────
    grid2: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 18, marginBottom: isMobile ? 12 : 18 },
    grid3: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 18 },
    grid5: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 12 : 18 },

    card: {
      background: theme.surface,
      borderRadius: isMobile ? 14 : 16,
      padding: isMobile ? 16 : 22,
      border: `1px solid ${theme.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardTitle: {
      fontSize: fs.xs, color: theme.textFaint, marginBottom: 10,
      textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700,
    },
    stat:    { fontSize: isMobile ? fs.xxl : 38, fontWeight: 800, color: theme.statColor, lineHeight: 1 },
    statSub: { fontSize: fs.sm, color: theme.textMuted, marginTop: 6 },

    // ── Table ────────────────────────────────────────────────────────────────
    tableWrap: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    table:     { width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 520 : 'auto' },
    th: {
      textAlign: 'left', padding: isMobile ? '8px 12px' : '10px 14px',
      fontSize: fs.xs, color: theme.textFaint,
      borderBottom: `2px solid ${theme.border}`,
      textTransform: 'uppercase', whiteSpace: 'nowrap',
      fontWeight: 700, letterSpacing: 0.8,
      background: theme.surfaceAlt || theme.surface,
    },
    td: {
      padding: isMobile ? '10px 12px' : '12px 14px',
      fontSize: fs.sm,
      borderBottom: `1px solid ${theme.border}`,
      verticalAlign: 'middle', color: theme.text,
      lineHeight: 1.5,
    },

    // ── Badges & buttons ─────────────────────────────────────────────────────
    riskBadge: (r) => ({
      padding: '3px 10px', borderRadius: 20, fontSize: fs.xs, fontWeight: 700,
      background: r === 'high' ? theme.dangerBg  : r === 'medium' ? theme.warningBg  : theme.successBg,
      color:      r === 'high' ? theme.danger     : r === 'medium' ? theme.warning     : theme.success,
      border:     `1px solid ${r === 'high' ? theme.danger : r === 'medium' ? theme.warning : theme.success}`,
    }),
    btn: (color) => ({
      background: color || theme.accent,
      color: '#fff', border: 'none',
      padding: isMobile ? '10px 18px' : '10px 20px',
      borderRadius: 10, cursor: 'pointer',
      fontSize: fs.base, fontWeight: 700,
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      transition: 'opacity 0.15s',
    }),
    btnSm: (color) => ({
      background: color || theme.border,
      color: color ? '#fff' : theme.text,
      border: 'none', padding: '6px 14px',
      borderRadius: 8, cursor: 'pointer',
      fontSize: fs.sm, fontWeight: 600,
      whiteSpace: 'nowrap',
    }),
    input: {
      background: theme.inputBg,
      border: `1.5px solid ${theme.border}`,
      color: theme.text,
      padding: isMobile ? '10px 14px' : '11px 16px',
      borderRadius: 10, fontSize: fs.base,
      width: '100%', outline: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.5,
    },
    select: {
      background: theme.inputBg,
      border: `1.5px solid ${theme.border}`,
      color: theme.text,
      padding: isMobile ? '8px 12px' : '9px 14px',
      borderRadius: 10, fontSize: fs.sm,
      outline: 'none',
    },

    // ── Chat ─────────────────────────────────────────────────────────────────
    chatBubble: (isUser) => ({
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      background: isUser ? theme.accent : theme.surface,
      color: isUser ? '#fff' : theme.text,
      padding: '12px 16px',
      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      maxWidth: isMobile ? '88%' : '78%',
      fontSize: fs.base,
      lineHeight: 1.65,
      border: isUser ? 'none' : `1px solid ${theme.border}`,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }),
    agentTag: (name) => ({
      display: 'inline-block', padding: '2px 8px',
      borderRadius: 6, fontSize: fs.xs, fontWeight: 700, marginRight: 4,
      background:
        name === 'GuardianAgent'    ? theme.accent :
        name === 'NutritionAgent'   ? theme.success :
        name === 'LogisticsAgent'   ? '#7c3aed' :
        name === 'AppointmentAgent' ? theme.danger :
        name === 'ReminderAgent'    ? theme.warning :
        name === 'ShopAgent'        ? '#0891b2' : theme.textMuted,
      color: '#fff',
    }),
    tag: (color) => ({
      display: 'inline-block', padding: '3px 10px',
      borderRadius: 8, fontSize: fs.xs,
      background: color || theme.border,
      color: '#fff', marginRight: 4,
    }),

    // ── Filter bar ───────────────────────────────────────────────────────────
    filterBar:   { display: 'flex', gap: isMobile ? 10 : 12, flexWrap: 'wrap', alignItems: 'flex-end' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
    filterLabel: { fontSize: fs.sm, color: theme.textMuted, fontWeight: 600 },
    filterBtns:  { display: 'flex', gap: 5, flexWrap: 'wrap' },

    // ── Misc ─────────────────────────────────────────────────────────────────
    dividerColor: theme.border,
    isMobile, isTablet, isSmall,
    fs, // expose font sizes for use in components
  };
};

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ mothers, alerts }) {
  const { t, S, theme } = useApp();
  const high   = mothers.filter(m => m.risk_level === 'high').length;
  const noBpjs = mothers.filter(m => !m.bpjs_status).length;
  const phases = { pregnancy:0, infant:0, toddler:0 };
  mothers.forEach(m => { if (phases[m.phase] !== undefined) phases[m.phase]++; });

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentLight || theme.accent} 100%)`,
        borderRadius: 16, padding: S.isMobile ? '18px 20px' : '22px 28px',
        marginBottom: S.isMobile ? 14 : 20, color: '#fff',
        boxShadow: '0 4px 16px rgba(13,115,119,0.25)',
      }}>
        <div style={{fontSize: S.isMobile ? 22 : 26, fontWeight: 800, marginBottom: 4}}>
          🌱 Selamat Datang di NutriSakti
        </div>
        <div style={{fontSize: S.fs?.base || 15, opacity: 0.9}}>
          Platform kesehatan ibu & anak — 1000 Hari Pertama Kehidupan
        </div>
        <div style={{display:'flex', gap:16, marginTop:14, flexWrap:'wrap'}}>
          {[
            { icon:'👩', val: mothers.length, label:'Total Ibu' },
            { icon:'🔴', val: high,           label:'Risiko Tinggi' },
            { icon:'🛡', val: mothers.filter(m=>m.bpjs_status).length, label:'BPJS Aktif' },
          ].map(s => (
            <div key={s.label} style={{background:'rgba(255,255,255,0.18)', borderRadius:10, padding:'8px 16px', textAlign:'center', minWidth:70}}>
              <div style={{fontSize:20}}>{s.icon}</div>
              <div style={{fontSize: S.isMobile ? 22 : 26, fontWeight:800, lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:11, opacity:0.85, marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.grid3}>
        <div style={S.card}><div style={S.cardTitle}>{t.total_mothers}</div><div style={S.stat}>{mothers.length}</div><div style={S.statSub}>{t.registered}</div></div>
        <div style={{...S.card, borderLeft:`4px solid ${theme.danger}`}}><div style={S.cardTitle}>{t.high_risk}</div><div style={{...S.stat,color:theme.danger}}>{high}</div><div style={S.statSub}>{t.needs_attention}</div></div>
        <div style={{...S.card, borderLeft:`4px solid ${theme.warning}`}}><div style={S.cardTitle}>{t.no_bpjs}</div><div style={{...S.stat,color:theme.warning}}>{noBpjs}</div><div style={S.statSub}>{t.not_registered}</div></div>
      </div>
      <div style={S.grid3}>
        <div style={{...S.card, textAlign:'center'}}><div style={{fontSize:28, marginBottom:6}}>🤰</div><div style={S.cardTitle}>{t.pregnant}</div><div style={{...S.stat, fontSize: S.isMobile ? 28 : 36}}>{phases.pregnancy}</div></div>
        <div style={{...S.card, textAlign:'center'}}><div style={{fontSize:28, marginBottom:6}}>👶</div><div style={S.cardTitle}>{t.infant}</div><div style={{...S.stat, fontSize: S.isMobile ? 28 : 36}}>{phases.infant}</div></div>
        <div style={{...S.card, textAlign:'center'}}><div style={{fontSize:28, marginBottom:6}}>🧒</div><div style={S.cardTitle}>{t.toddler}</div><div style={{...S.stat, fontSize: S.isMobile ? 28 : 36}}>{phases.toddler}</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>{t.active_alerts} ({alerts.length})</div>
        {alerts.length === 0 && <div style={{color:theme.success, fontSize: S.fs?.base || 15, padding:'8px 0'}}>✅ {t.no_alerts}</div>}
        {alerts.slice(0,5).map((a,i) => (
          <div key={i} style={{padding:'10px 0', borderBottom:`1px solid ${theme.border}`, fontSize: S.fs?.sm || 14, display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap'}}>
            <span style={S.badge(a.severity==='high'?theme.danger:a.severity==='warning'?theme.warning:theme.accent)}>{a.severity}</span>
            <span style={{color:theme.textMuted,fontSize: S.fs?.xs || 12,minWidth:70}}>{a.type}</span>
            <span style={{flex:1,minWidth:0,wordBreak:'break-word'}}>{a.message}</span>
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
      <div style={S.tableWrap}>
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
    </div>
  );
}

// ── Agent Chat ────────────────────────────────────────────────────────────────
function AgentChat({ mothers }) {
  const { t, S, theme } = useApp();
  const [motherId, setMotherId] = useState(mothers[0]?.id || 'MTR001');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{
    role: 'agent', text: t.chat_welcome, gemini: false, cards: [], followUps: [],
  }]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const msgEnd = useRef(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const r = await api.chat(motherId, msg);
      setLastResult(r);
      setMessages(m => [...m, {
        role:      'agent',
        text:      r.response,
        cards:     r.cards     || [],
        followUps: r.followUpQuestions || [],
        gemini:    r.gemini?.used    || false,
        flagged:   r.gemini?.flagged || false,
        flags:     r.gemini?.flags   || [],
      }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'agent', text: '❌ Error: ' + e.message, cards: [], followUps: [] }]);
    }
    setLoading(false);
  };

  const chatHeight = S.isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 140px)';

  return (
    <div style={{ display: 'flex', gap: 16, height: chatHeight, minHeight: S.isMobile ? 400 : 500 }}>

      {/* ── Chat panel ── */}
      <div style={{ ...S.card, flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: S.isMobile ? '10px 14px' : '12px 20px', borderBottom: `1px solid ${S.dividerColor}`, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>{t.mother_label}</span>
          <select value={motherId} onChange={e => setMotherId(e.target.value)} style={{ ...S.select, flex: 1, minWidth: 0 }}>
            {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <span style={S.agentTag('GuardianAgent')}>GuardianAgent</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg,#4285f4,#34a853)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>✦ Gemini</span>
          {S.isMobile && (
            <button style={{ ...S.btnSm('#334155'), marginLeft: 'auto' }} onClick={() => setShowLog(v => !v)}>
              {showLog ? '💬 Chat' : '📋 Log'}
            </button>
          )}
        </div>

        {/* Messages */}
        {(!S.isMobile || !showLog) && (
          <>
            <div style={{ flex: 1, overflow: 'auto', padding: S.isMobile ? 10 : 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  {/* Bubble */}
                  <div style={{
                    ...S.chatBubble(msg.role === 'user'),
                    maxWidth: msg.role === 'user' ? (S.isMobile ? '85%' : '70%') : '100%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    {msg.role === 'agent' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>🤖 Guardian Agent</span>
                        {msg.gemini && (
                          <span style={{ fontSize: 9, background: 'linear-gradient(135deg,#4285f4,#34a853)', color: '#fff', padding: '1px 5px', borderRadius: 5, fontWeight: 700 }}>✦ Gemini</span>
                        )}
                        {msg.flagged && (
                          <span title={`Filtered: ${msg.flags?.join(', ')}`} style={{ fontSize: 9, background: '#92400e', color: '#fde68a', padding: '1px 5px', borderRadius: 5, fontWeight: 700, cursor: 'help' }}>🛡 Filtered</span>
                        )}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</div>
                  </div>

                  {/* Rich cards (agent only) */}
                  {msg.role === 'agent' && msg.cards?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {msg.cards.map((card, ci) => (
                        <RichCard key={ci} card={card} theme={theme} S={S} onAction={send} />
                      ))}
                    </div>
                  )}

                  {/* Follow-up chips (last agent message only) */}
                  {msg.role === 'agent' && i === messages.length - 1 && msg.followUps?.length > 0 && (
                    <FollowUpChips questions={msg.followUps} onSelect={send} theme={theme} S={S} />
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ ...S.chatBubble(false), alignSelf: 'flex-start' }}>
                  <div style={{ fontSize: 10, color: '#38bdf8', marginBottom: 4, fontWeight: 700 }}>🤖 Guardian Agent</div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#38bdf8',
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        opacity: 0.7,
                      }} />
                    ))}
                    <span style={{ fontSize: 11, color: theme.textFaint, marginLeft: 4 }}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={msgEnd} />
            </div>

            {/* Input bar */}
            <div style={{ padding: S.isMobile ? '8px 10px' : '10px 14px', borderTop: `1px solid ${S.dividerColor}`, display: 'flex', gap: 8 }}>
              <input
                style={S.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={t.type_message}
              />
              <button style={S.btn()} onClick={() => send()} disabled={loading}>{t.send}</button>
            </div>
          </>
        )}

        {/* Mobile log toggle */}
        {S.isMobile && showLog && (
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <AgentLogPanel lastResult={lastResult} t={t} S={S} />
          </div>
        )}
      </div>

      {/* ── Desktop log panel ── */}
      {!S.isMobile && (
        <div style={{ ...S.card, width: S.isTablet ? 240 : 300, overflow: 'auto', flexShrink: 0 }}>
          <AgentLogPanel lastResult={lastResult} t={t} S={S} />
        </div>
      )}
    </div>
  );
}

function AgentLogPanel({ lastResult, t, S }) {
  return (
    <>
      <div style={S.cardTitle}>{t.agent_log}</div>
      {!lastResult && <div style={{ color: '#64748b', fontSize: 12 }}>{t.send_to_see_log}</div>}
      {lastResult && (
        <>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
            {t.session_label}: {lastResult.sessionId?.slice(0, 8)}... | {lastResult.durationMs}ms
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
            {t.intents_label}: {lastResult.intentsDetected?.join(', ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {lastResult.gemini?.used ? (
              <span style={{ fontSize: 10, background: 'linear-gradient(135deg,#4285f4,#34a853)', color: '#fff', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>
                ✦ Gemini {lastResult.gemini.model || ''}
              </span>
            ) : (
              <span style={{ fontSize: 10, background: '#334155', color: '#94a3b8', padding: '2px 7px', borderRadius: 8 }}>Rule-based</span>
            )}
            {lastResult.gemini?.flagged && (
              <span style={{ fontSize: 10, background: '#92400e', color: '#fde68a', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>🛡 Filtered</span>
            )}
            {lastResult.cards?.length > 0 && (
              <span style={{ fontSize: 10, background: '#1d4ed8', color: '#fff', padding: '2px 7px', borderRadius: 8 }}>
                {lastResult.cards.length} cards
              </span>
            )}
          </div>
          {lastResult.agentLog?.map((log, i) => (
            <div key={i} style={{ padding: '5px 0', borderBottom: `1px solid ${S.dividerColor}`, fontSize: 11 }}>
              <span style={S.agentTag(log.agent)}>{log.agent}</span>
              <span style={{ color: '#94a3b8' }}>{log.action}</span>
              {log.tool && <span style={{ ...S.tag('#1e3a5f'), marginLeft: 4 }}>🛠 {log.tool}</span>}
              {log.subAgent && <span style={{ ...S.tag('#3b1f5e'), marginLeft: 4 }}>→ {log.subAgent}</span>}
            </div>
          ))}
        </>
      )}
    </>
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
            <select value={motherId} onChange={e=>setMotherId(e.target.value)} style={S.input}>{mothers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <select value={kitType} onChange={e=>setKitType(e.target.value)} style={S.input}>
              <option value="prenatal">{t.kit_prenatal}</option>
              <option value="delivery">{t.kit_delivery}</option>
              <option value="newborn">{t.kit_newborn}</option>
              <option value="nutrition">{t.kit_nutrition}</option>
            </select>
            <button style={S.btn()} onClick={request} disabled={loading}>{loading?t.requesting:t.request_btn}</button>
          </div>
          {result && (
            <div style={{marginTop:12,padding:12,background:'rgba(0,0,0,0.2)',borderRadius:8,fontSize:12}}>
              {result.success ? (
                <>
                  <div style={{color:'#4ade80',marginBottom:4}}>✅ {result.message}</div>
                  <div style={{color:'#64748b',wordBreak:'break-all'}}>TX: {result.txHash?.slice(0,30)}...</div>
                  <div style={{color:'#64748b'}}>{t.usdc_escrowed}: ${result.usdcEscrowed}</div>
                </>
              ) : <div style={{color:'#f87171'}}>❌ {result.error}</div>}
            </div>
          )}
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>{t.kit_stats}</div>
          <div style={S.stat}>{kits.length}</div>
          <div style={S.statSub}>{t.total_requests}</div>
          <div style={{marginTop:12,fontSize:13,color:'#64748b'}}>{t.usdc_total}: ${kits.reduce((s,k)=>s+(k.usdc_escrowed||0),0)}</div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>{t.kit_history}</div>
        {kits.length===0 && <div style={{color:'#64748b',fontSize:13}}>{t.no_requests}</div>}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>{[t.col_mother,'Kit',t.status,'USDC','DID',t.time].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {kits.map((k,i)=>(
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

  const auditOne = async (id) => { setLoading(true); setSelected(await api.getAudit(id)); setLoading(false); };

  return (
    <div>
      {auditData && (
        <div style={S.grid3}>
          <div style={S.card}><div style={S.cardTitle}>{t.total_mothers}</div><div style={S.stat}>{auditData.totalMothers}</div></div>
          <div style={S.card}><div style={S.cardTitle}>{t.high_risk}</div><div style={{...S.stat,color:'#f87171'}}>{auditData.highRisk}</div></div>
          <div style={S.card}><div style={S.cardTitle}>{t.no_bpjs}</div><div style={{...S.stat,color:'#fbbf24'}}>{auditData.uncoveredBPJS}</div></div>
        </div>
      )}

      {/* Detail panel — full width on mobile, inline on desktop */}
      {selected && (
        <div style={{...S.card, marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div style={S.cardTitle}>{t.audit_detail}: {selected.mother?.name}</div>
            <button style={S.btnSm()} onClick={()=>setSelected(null)}>{t.close}</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap:12}}>
            <div>
              <div style={{fontSize:12,color:'#64748b',marginBottom:8}}>{selected.summary}</div>
              <span style={S.badge(selected.bpjsStatus?.covered?'#15803d':'#b91c1c')}>BPJS: {selected.bpjsStatus?.status}</span>
              {selected.risks?.length>0 && (
                <div style={{marginTop:10}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{t.risks_label}:</div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{selected.risks.map((r,i)=><span key={i} style={S.tag('#7f1d1d')}>{r}</span>)}</div>
                </div>
              )}
            </div>
            {selected.upcomingMilestones?.length>0 && (
              <div>
                <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>{t.upcoming_milestones}:</div>
                {selected.upcomingMilestones.map((m,i)=>(
                  <div key={i} style={{padding:'6px 0',borderBottom:`1px solid ${S.dividerColor}`,fontSize:12}}>
                    <div style={{color:'#38bdf8'}}>{m.label}</div>
                    <div style={{color:'#64748b'}}>{m.daysUntil} {t.days_until} ({t.day_label} {m.day})</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {loading && <div style={{color:'#64748b',fontSize:12,marginTop:8}}>{t.loading}</div>}
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>{t.audit_all}</div>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>{[t.name,t.region,t.phase,t.days,t.bpjs,t.risk,t.needs_attention,t.action].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(auditData?.mothers||[]).map((m,i)=>(
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
      {sessions.map((s,i)=>(
        <div key={i} style={{padding:'10px 0',borderBottom:`1px solid ${S.dividerColor}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:0}}>
              <span style={S.agentTag(s.agent_name)}>{s.agent_name}</span>
              <span style={{fontSize:13,color:S.topbarTitle?.color,wordBreak:'break-word'}}>{s.input?.slice(0,60)}{s.input?.length>60?'...':''}</span>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
              <span style={S.badge(s.status==='completed'?'#15803d':'#d97706')}>{s.status}</span>
              <button style={S.btnSm()} onClick={()=>setExpanded(expanded===i?null:i)}>{expanded===i?t.collapse:t.expand}</button>
            </div>
          </div>
          {expanded===i && s.output && (
            <div style={{marginTop:8,padding:10,background:'rgba(0,0,0,0.2)',borderRadius:8,fontSize:11,color:'#94a3b8',whiteSpace:'pre-wrap',maxHeight:200,overflow:'auto',wordBreak:'break-all'}}>
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
        <div style={S.filterBar}>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_status}</div>
            <div style={S.filterBtns}>
              {[['','all'],['taken','taken'],['planned','planned_btn']].map(([val,key])=>(
                <button key={val} style={{...S.btnSm(filters.status===val?(statusColor(val)||'#0ea5e9'):undefined),color:'#fff'}} onClick={()=>applyFilter('status',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_type}</div>
            <div style={S.filterBtns}>
              {[['','all'],['wajib','mandatory'],['lanjutan','booster'],['prenatal','prenatal_type']].map(([val,key])=>(
                <button key={val} style={{...S.btnSm(filters.type===val?typeColor(val):undefined),color:'#fff'}} onClick={()=>applyFilter('type',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_puskesmas}</div>
            <select value={filters.puskesmas} onChange={e=>applyFilter('puskesmas',e.target.value)} style={{...S.select, maxWidth: S.isMobile ? '100%' : 220}}>
              <option value=''>{t.all_centers}</option>
              {puskesmasList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_name}</div>
            <input style={{...S.input, maxWidth: S.isMobile ? '100%' : 160, padding:'6px 10px'}} placeholder={t.search_vaccine}
              value={filters.vaccine_name} onChange={e=>applyFilter('vaccine_name',e.target.value)} />
          </div>
          <button style={{...S.btnSm('#475569'), alignSelf:'flex-end'}} onClick={resetFilters}>{t.reset}</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.vacc_table_title} ({rows.length} {t.entries})</div>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>{[t.col_mother,t.col_vaccine,t.col_type,t.col_status,t.col_date,t.col_center,t.col_notes].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} style={{background: isOverdue(r) ? theme.rowOverdue : theme.rowAlt}}>
                  <td style={S.td}>{r.mother_name}</td>
                  <td style={S.td}><span style={{fontWeight:600}}>{r.vaccine_name}</span></td>
                  <td style={S.td}><span style={S.badge(typeColor(r.type))}>{r.type}</span></td>
                  <td style={S.td}>
                    <span style={S.badge(statusColor(r.status))}>{r.status==='taken'?t.taken:t.planned_btn}</span>
                    {isOverdue(r) && <span style={{...S.badge('#dc2626'),marginLeft:4}}>{t.overdue}</span>}
                  </td>
                  <td style={S.td}>{fmtDate(r.date)}</td>
                  <td style={S.td}><span style={{fontSize:11,color:'#94a3b8'}}>{r.puskesmas_name}</span></td>
                  <td style={S.td}><span style={{fontSize:11,color:'#64748b'}}>{r.notes||'-'}</span></td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'#64748b'}}>{t.no_data}</td></tr>}
            </tbody>
          </table>
        </div>
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

  const statusCfg = { delivered:{color:'#15803d',key:'delivered'}, in_transit:{color:'#0284c7',key:'in_transit'}, ordered:{color:'#d97706',key:'ordered'}, failed:{color:'#dc2626',key:'failed'} };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}) : '-';
  const deliveryDays = (row) => (!row.ordered_at||!row.delivered_at) ? null : Math.round((new Date(row.delivered_at)-new Date(row.ordered_at))/86400000);

  return (
    <div>
      <div style={S.grid5}>
        {[['total','#f1f5f9'],['delivered','#4ade80'],['in_transit','#38bdf8'],['ordered','#fbbf24'],['failed','#f87171']].map(([key,color])=>(
          <div key={key} style={S.card}><div style={S.cardTitle}>{t[key]||key}</div><div style={{...S.stat,color}}>{stats[key]||0}</div></div>
        ))}
      </div>

      <div style={{...S.card,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:13,color:'#94a3b8'}}>{t.delivery_rate}</span>
          <span style={{fontSize:16,fontWeight:700,color:'#4ade80'}}>{stats.delivery_rate||'0%'}</span>
        </div>
        <div style={{background:theme.barBg,borderRadius:8,height:12,overflow:'hidden'}}>
          <div style={{background:'#22c55e',height:'100%',width:stats.delivery_rate||'0%',borderRadius:8,transition:'width 0.5s'}} />
        </div>
      </div>

      <div style={{...S.card,marginBottom:16}}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.filter_delivery}</div>
        <div style={S.filterBar}>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_status_d}</div>
            <div style={S.filterBtns}>
              {[['','all_statuses'],['ordered','ordered'],['in_transit','in_transit'],['delivered','delivered'],['failed','failed']].map(([val,key])=>(
                <button key={val} style={{...S.btnSm(filters.status===val?(statusCfg[val]?.color||'#0ea5e9'):undefined),color:'#fff',fontSize:11}} onClick={()=>applyFilter('status',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_kit_type}</div>
            <div style={S.filterBtns}>
              {[['','all_kits'],['prenatal','kit_prenatal_s'],['delivery','kit_delivery_s'],['newborn','kit_newborn_s'],['nutrition','kit_nutrition_s']].map(([val,key])=>(
                <button key={val} style={{...S.btnSm(filters.kit_type===val?'#7c3aed':undefined),color:'#fff',fontSize:11}} onClick={()=>applyFilter('kit_type',val)}>{t[key]||t.all}</button>
              ))}
            </div>
          </div>
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>{t.filter_puskesmas}</div>
            <select value={filters.puskesmas} onChange={e=>applyFilter('puskesmas',e.target.value)} style={{...S.select, maxWidth: S.isMobile ? '100%' : 220}}>
              <option value=''>{t.all_centers}</option>
              {puskesmasList.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button style={{...S.btnSm('#475569'), alignSelf:'flex-end'}} onClick={resetFilters}>{t.reset}</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{...S.cardTitle,marginBottom:12}}>{t.delivery_table} ({rows.length} {t.entries})</div>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>{[t.col_mother,t.col_kit,t.col_status,t.col_ordered,t.col_dispatched,t.col_received,t.col_days,t.col_center,t.col_proof,t.col_notes].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r,i)=>{
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
    </div>
  );
}

// ── Appointments ─────────────────────────────────────────────────────────────
function Appointments({ mothers }) {
  const { t, S, theme } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAppointments().then(d => { setAppointments(d); setLoading(false); });
  }, []);

  const filtered = filter ? appointments.filter(a => a.type === filter) : appointments;

  const urgencyColor = { emergency:'#dc2626', urgent:'#d97706', routine:'#0284c7' };
  const statusColor  = { confirmed:'#15803d', scheduled:'#0284c7', cancelled:'#6b7280' };

  const stats = {
    total:     appointments.length,
    emergency: appointments.filter(a => a.type === 'emergency').length,
    upcoming:  appointments.filter(a => new Date(a.scheduled_at) > new Date()).length,
  };

  const fmt = (iso) => new Date(iso).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      {/* Stats */}
      <div style={S.grid3}>
        {[
          { label: t.appt_total,    val: stats.total,     color:'#0ea5e9' },
          { label: t.appt_today,    val: stats.emergency, color:'#dc2626' },
          { label: t.appt_upcoming, val: stats.upcoming,  color:'#15803d' },
        ].map(s => (
          <div key={s.label} style={S.card}>
            <div style={S.cardTitle}>{s.label}</div>
            <div style={{...S.stat, color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter + hint */}
      <div style={{...S.card, marginBottom:16}}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:12}}>
          {[['', t.appt_filter_all],['emergency', t.appt_emergency],['urgent', t.appt_urgent],['routine', t.appt_routine]].map(([val, label]) => (
            <button key={val} style={S.btnSm(filter===val ? urgencyColor[val]||'#0ea5e9' : undefined)} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>
        <div style={{fontSize:11, color:theme.textFaint, padding:'8px 12px', background:theme.bg, borderRadius:8, border:`1px solid ${theme.border}`}}>
          💡 {t.appt_book_btn} — type "bayi saya demam, pesan dokter" or "book emergency doctor" in Guardian Agent chat
        </div>
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={S.cardTitle}>{t.appt_title}</div>
        {loading && <div style={{color:theme.textFaint}}>{t.loading}</div>}
        {!loading && filtered.length === 0 && <div style={{color:theme.textFaint, fontSize:13}}>{t.appt_no_data}</div>}
        {!loading && filtered.length > 0 && (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {[t.name, t.appt_type, t.appt_doctor, t.appt_reason, t.appt_when, t.status].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={S.td}>{a.mother_name}</td>
                    <td style={S.td}>
                      <span style={{...S.riskBadge(a.type==='emergency'?'high':a.type==='urgent'?'medium':'low'), background:urgencyColor[a.type]||'#0284c7', color:'#fff', fontSize:10}}>
                        {t['appt_'+a.type] || a.type}
                      </span>
                    </td>
                    <td style={S.td}><div style={{fontWeight:600, fontSize:12}}>{a.doctor}</div><div style={{fontSize:10, color:theme.textFaint}}>{a.specialty}</div></td>
                    <td style={S.td} title={a.reason}><span style={{fontSize:11}}>{a.reason?.slice(0,40)}{a.reason?.length>40?'…':''}</span></td>
                    <td style={{...S.td, whiteSpace:'nowrap', fontSize:11}}>{fmt(a.scheduled_at)}</td>
                    <td style={S.td}>
                      <span style={{background:statusColor[a.status]||'#6b7280', color:'#fff', padding:'2px 7px', borderRadius:8, fontSize:10, fontWeight:600}}>
                        {t['appt_'+a.status] || a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reminders ─────────────────────────────────────────────────────────────────
function Reminders({ mothers }) {
  const { t, S, theme } = useApp();
  const [reminders, setReminders] = useState([]);
  const [motherId, setMotherId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (mid) => {
    setLoading(true);
    const call = mid ? api.getReminders(mid) : api.getAllReminders();
    call.then(d => {
      setReminders(Array.isArray(d) ? d : (d.reminders || []));
      setLoading(false);
    });
  };

  useEffect(() => { load(''); }, []);

  const daysLeft = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86400000);

  const urgencyLabel = (days) => {
    if (days < 0)  return { label: t.rem_overdue, color:'#dc2626' };
    if (days === 0) return { label: t.rem_today,   color:'#dc2626' };
    if (days <= 7)  return { label: t.rem_soon,    color:'#d97706' };
    return { label: t.rem_upcoming, color:'#15803d' };
  };

  const stats = {
    overdue:  reminders.filter(r => daysLeft(r.due_date) < 0).length,
    thisWeek: reminders.filter(r => { const d = daysLeft(r.due_date); return d >= 0 && d <= 7; }).length,
    upcoming: reminders.filter(r => daysLeft(r.due_date) > 7).length,
  };

  return (
    <div>
      <div style={S.grid3}>
        {[
          { label: t.rem_overdue,  val: stats.overdue,  color:'#dc2626' },
          { label: t.rem_soon,     val: stats.thisWeek, color:'#d97706' },
          { label: t.rem_upcoming, val: stats.upcoming, color:'#15803d' },
        ].map(s => (
          <div key={s.label} style={S.card}>
            <div style={S.cardTitle}>{s.label}</div>
            <div style={{...S.stat, color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card, marginBottom:16}}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <span style={{fontSize:12, color:theme.textFaint}}>{t.rem_filter_all}:</span>
          <select style={S.select} value={motherId} onChange={e => { setMotherId(e.target.value); load(e.target.value); }}>
            <option value="">{t.rem_filter_all}</option>
            {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>{t.rem_title}</div>
        {loading && <div style={{color:theme.textFaint}}>{t.loading}</div>}
        {!loading && reminders.length === 0 && (
          <div style={{color:theme.textFaint, fontSize:13, padding:'12px 0'}}>{t.rem_no_data}</div>
        )}
        {!loading && reminders.length > 0 && (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {[t.name, t.rem_vaccine, t.rem_due, t.rem_days_left, t.status].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => {
                  const days = daysLeft(r.due_date);
                  const urg  = urgencyLabel(days);
                  return (
                    <tr key={r.id}>
                      <td style={S.td}>{r.mother_name}</td>
                      <td style={S.td}><span style={{fontWeight:600, fontSize:12}}>💉 {r.vaccine_name || r.type}</span></td>
                      <td style={{...S.td, whiteSpace:'nowrap', fontSize:11}}>
                        {new Date(r.due_date).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td style={S.td}>
                        <span style={{background:urg.color, color:'#fff', padding:'2px 8px', borderRadius:8, fontSize:10, fontWeight:700}}>
                          {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? 'TODAY' : `${days}d`}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{background: r.status==='sent'?'#15803d':'#334155', color:'#fff', padding:'2px 7px', borderRadius:8, fontSize:10}}>
                          {r.status === 'sent' ? t.rem_sent : t.rem_pending}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shop ──────────────────────────────────────────────────────────────────────
function Shop({ mothers }) {
  const { t, S, theme } = useApp();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState('products');
  const [motherId, setMotherId] = useState(mothers[0]?.id || 'MTR001');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts(category ? { category } : {}),
      api.getOrders(),
    ]).then(([p, o]) => { setProducts(p); setOrders(o); setLoading(false); });
  }, [category]);

  const cats = [
    ['', t.shop_all], ['milk', t.shop_milk], ['biscuit', t.shop_biscuit],
    ['diaper', t.shop_diaper], ['vitamin', t.shop_vitamin],
  ];

  const statusCfg = { ordered:'#0284c7', in_transit:'#d97706', delivered:'#15803d' };

  return (
    <div>
      {/* Header */}
      <div style={{...S.card, marginBottom:16, background:'linear-gradient(135deg,#0ea5e9,#7c3aed)', border:'none'}}>
        <div style={{fontSize: S.isMobile ? 18 : 22, fontWeight:700, color:'#fff'}}>{t.shop_title} 🛍️</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:4}}>{t.shop_subtitle}</div>
        <div style={{marginTop:10, fontSize:11, background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'8px 12px', color:'rgba(255,255,255,0.9)'}}>
          💬 {t.shop_how}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <button style={S.btn(tab==='products'?'#0ea5e9':'#334155')} onClick={()=>setTab('products')}>🛍️ {t.shop_all}</button>
        <button style={S.btn(tab==='orders'?'#0ea5e9':'#334155')} onClick={()=>setTab('orders')}>📦 {t.shop_orders}</button>
        {tab==='orders' && (
          <select style={{...S.select, marginLeft:'auto'}} value={motherId} onChange={e=>setMotherId(e.target.value)}>
            {mothers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>

      {tab === 'products' && (
        <>
          {/* Category filter */}
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:16}}>
            {cats.map(([val, label]) => (
              <button key={val} style={S.btnSm(category===val?'#0ea5e9':undefined)} onClick={()=>setCategory(val)}>{label}</button>
            ))}
          </div>

          {/* Product grid */}
          {loading ? <div style={{color:theme.textFaint}}>{t.loading}</div> : (
            <div style={{display:'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap:12}}>
              {products.map(p => (
                <div key={p.id} style={{...S.card, display:'flex', flexDirection:'column', gap:6, padding: S.isMobile ? 12 : 16}}>
                  <div style={{fontSize: S.isMobile ? 28 : 36, textAlign:'center'}}>{p.image_emoji}</div>
                  <div style={{fontSize:10, color:theme.textFaint, textAlign:'center'}}>[{p.id}]</div>
                  <div style={{fontWeight:700, fontSize: S.isMobile ? 11 : 13, textAlign:'center', lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:10, color:theme.textFaint, textAlign:'center'}}>{p.brand} · {p.unit}</div>
                  <div style={{fontSize:11, color:theme.textFaint, textAlign:'center', lineHeight:1.4}}>{p.description}</div>
                  <div style={{marginTop:'auto', textAlign:'center'}}>
                    <div style={{fontWeight:700, color:'#0ea5e9', fontSize: S.isMobile ? 13 : 15}}>{p.price_usdc} USDC</div>
                    <div style={{fontSize:10, color:theme.textFaint}}>Rp{p.price_idr.toLocaleString('id-ID')}</div>
                    <div style={{fontSize:10, color: p.stock > 0 ? '#15803d' : '#dc2626', marginTop:2}}>
                      {p.stock > 0 ? `✅ Stok: ${p.stock}` : '❌ Habis'}
                    </div>
                  </div>
                  <div style={{fontSize:10, color:theme.textFaint, textAlign:'center', marginTop:4, padding:'4px 8px', background:theme.bg, borderRadius:6}}>
                    💬 "pesan {p.id} 1 buah"
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div style={S.card}>
          <div style={S.cardTitle}>{t.shop_orders}</div>
          {orders.filter(o => !motherId || o.mother_id === motherId).length === 0 ? (
            <div style={{color:theme.textFaint, fontSize:13}}>{t.shop_no_orders}</div>
          ) : (
            orders.filter(o => !motherId || o.mother_id === motherId).map(o => (
              <div key={o.id} style={{padding:'12px 0', borderBottom:`1px solid ${theme.border}`}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8}}>
                  <div>
                    <div style={{fontWeight:600, fontSize:13}}>{o.mother_name}</div>
                    <div style={{fontSize:11, color:theme.textFaint}}>{o.id} · {new Date(o.created_at).toLocaleDateString('id-ID')}</div>
                  </div>
                  <span style={{background:statusCfg[o.status]||'#334155', color:'#fff', padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600}}>
                    {t['shop_'+o.status] || o.status}
                  </span>
                </div>
                <div style={{marginTop:8}}>
                  {o.items_detail?.map((item, i) => (
                    <div key={i} style={{fontSize:11, color:theme.textMuted, padding:'2px 0'}}>
                      {item.product?.image_emoji} {item.qty}x {item.product?.name} — {(item.qty * item.price_usdc).toFixed(2)} USDC
                    </div>
                  ))}
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12}}>
                  <span style={{color:theme.textFaint}}>📍 {o.address}</span>
                  <span style={{fontWeight:700, color:'#0ea5e9'}}>{t.shop_total}: {o.total_usdc} USDC</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Analytics / BI Dashboard ──────────────────────────────────────────────────

/* ── Reusable chart primitives (pure CSS/SVG, no library) ── */

// Horizontal bar chart row
function BarRow({ label, value, max, color, suffix = '%', extra }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}{suffix}{extra ? <span style={{ color: '#64748b', fontWeight: 400 }}> {extra}</span> : null}</span>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{ background: color, width: pct + '%', height: '100%', borderRadius: 6, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// Donut chart via SVG
function DonutChart({ segments, size = 120, thickness = 22 }) {
  const r = (size / 2) - thickness / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        const dash = total > 0 ? (seg.value / total) * circ : 0;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt" />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// KPI card
function KpiCard({ label, value, sub, color, icon, trend }) {
  const { S, theme } = useApp();
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: S.isMobile ? 24 : 30, fontWeight: 700, color: color || theme.statColor, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: theme.textFaint }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? '#4ade80' : '#f87171', marginTop: 2 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// Section header
function SectionHeader({ title, subtitle }) {
  const { theme } = useApp();
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

function Analytics() {
  const { t, S, theme } = useApp();
  const [summary,      setSummary]      = useState(null);
  const [riskRegion,   setRiskRegion]   = useState([]);
  const [vaccCoverage, setVaccCoverage] = useState([]);
  const [delivery,     setDelivery]     = useState([]);
  const [phases,       setPhases]       = useState([]);
  const [appts,        setAppts]        = useState(null);
  const [shop,         setShop]         = useState(null);
  const [agentAct,     setAgentAct]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const load = async () => {
    setLoading(true);
    const [s, r, v, d, p, a, sh, ag] = await Promise.all([
      api.getAnalyticsSummary(),
      api.getAnalyticsRiskByRegion(),
      api.getAnalyticsVaccCoverage(),
      api.getAnalyticsDelivery(),
      api.getAnalyticsPhase(),
      api.getAnalyticsAppointments(),
      api.getAnalyticsShop(),
      api.getAnalyticsAgentActivity(),
    ]);
    setSummary(s); setRiskRegion(r); setVaccCoverage(v); setDelivery(d);
    setPhases(p); setAppts(a); setShop(sh); setAgentAct(ag);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // CSV export helper
  const exportCSV = () => {
    if (!summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Mothers', summary.totalMothers],
      ['High Risk', summary.highRisk],
      ['Medium Risk', summary.mediumRisk],
      ['Low Risk', summary.lowRisk],
      ['BPJS Coverage Rate (%)', summary.bpjsCoverageRate],
      ['Vaccination Completion Rate (%)', summary.vaccCompletionRate],
      ['Overdue Vaccinations', summary.vaccOverdue],
      ['Kit Delivery Rate (%)', summary.kitDeliveryRate],
      ['Emergency Appointments', summary.emergencyAppts],
      ['Pending Reminders', summary.pendingReminders],
      ['Total Shop Revenue (USDC)', summary.totalRevenue],
      ['Total Orders', summary.totalOrders],
      ['Avg Order Value (USDC)', summary.avgOrderValue],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'nutrisakti-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>📈</div>
        <div style={{ color: theme.textFaint, fontSize: 13 }}>Loading analytics...</div>
      </div>
    );
  }

  const phaseColors = { pregnancy: '#0ea5e9', infant: '#a855f7', toddler: '#22c55e' };
  const riskColors  = { high: '#dc2626', medium: '#d97706', low: '#15803d' };
  const catColors   = { milk: '#0ea5e9', biscuit: '#f59e0b', diaper: '#a855f7', vitamin: '#22c55e', other: '#64748b' };
  const catEmoji    = { milk: '🥛', biscuit: '🍪', diaper: '👶', vitamin: '💊', other: '📦' };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ ...S.card, marginBottom: 16, background: 'linear-gradient(135deg,#1e3a5f,#312e81)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: S.isMobile ? 16 : 20, fontWeight: 700, color: '#fff' }}>📈 {t.bi_title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{t.bi_subtitle}</div>
            {lastUpdated && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{t.bi_last_updated}: {lastUpdated}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...S.btnSm('#334155'), color: '#fff' }} onClick={load}>{t.bi_refresh}</button>
            <button style={{ ...S.btnSm('#0ea5e9'), color: '#fff' }} onClick={exportCSV}>{t.bi_export}</button>
          </div>
        </div>
      </div>

      {/* ── Section 1: Health KPIs ── */}
      <SectionHeader title={`🏥 ${t.bi_health}`} />
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: S.isMobile ? 8 : 12, marginBottom: 16 }}>
        <KpiCard label={t.total_mothers}    value={summary.totalMothers}        color="#0ea5e9"  icon="👩" />
        <KpiCard label={t.bi_high}          value={summary.highRisk}            color="#dc2626"  icon="🔴" sub={`${pct(summary.highRisk, summary.totalMothers)}% of total`} />
        <KpiCard label={t.bi_bpjs_covered}  value={`${summary.bpjsCoverageRate}%`} color="#22c55e" icon="🛡" sub={`${summary.bpjsCovered}/${summary.totalMothers} mothers`} />
        <KpiCard label={t.bi_emergency_appts} value={summary.emergencyAppts}   color="#f97316"  icon="🚨" />
      </div>

      {/* ── Risk + Phase side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>

        {/* Risk by region */}
        <div style={S.card}>
          <SectionHeader title={`🗺 ${t.bi_risk_region}`} />
          {riskRegion.map(r => (
            <div key={r.region} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: theme.text }}>{r.region}</span>
                <span style={{ color: theme.textFaint, fontSize: 11 }}>{r.total} mothers · BPJS: {pct(r.bpjs, r.total)}%</span>
              </div>
              <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
                {['high','medium','low'].map(level => r[level] > 0 && (
                  <div key={level} style={{ flex: r[level], background: riskColors[level], transition: 'flex 0.5s' }} title={`${level}: ${r[level]}`} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {['high','medium','low'].map(level => (
                  <span key={level} style={{ fontSize: 10, color: riskColors[level] }}>● {level}: {r[level]}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Phase distribution donut */}
        <div style={S.card}>
          <SectionHeader title={`🔄 ${t.bi_phase_dist}`} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <DonutChart size={120} thickness={24}
                segments={phases.map(p => ({ value: p.count, color: phaseColors[p.phase] || '#64748b' }))} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{summary.totalMothers}</div>
                <div style={{ fontSize: 9, color: theme.textFaint }}>total</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              {phases.map(p => (
                <div key={p.phase} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: phaseColors[p.phase], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: theme.text, textTransform: 'capitalize' }}>{p.phase}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: phaseColors[p.phase] }}>{p.count}</span>
                    <span style={{ fontSize: 10, color: theme.textFaint, marginLeft: 4 }}>{p.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Vaccination ── */}
      <SectionHeader title={`💉 ${t.bi_vaccination}`} />
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: S.isMobile ? 8 : 12, marginBottom: 12 }}>
        <KpiCard label={t.given}           value={summary.vaccTaken}              color="#22c55e" icon="✅" />
        <KpiCard label={t.planned}         value={summary.vaccPlanned}            color="#0ea5e9" icon="📅" />
        <KpiCard label={t.bi_overdue_vacc} value={summary.vaccOverdue}            color="#dc2626" icon="⚠️" />
        <KpiCard label={t.bi_completion}   value={`${summary.vaccCompletionRate}%`} color="#a855f7" icon="📊" />
      </div>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <SectionHeader title={t.bi_vacc_coverage} subtitle={`${vaccCoverage.length} vaccines tracked`} />
        {vaccCoverage.slice(0, 8).map(v => (
          <BarRow key={v.name} label={v.name} value={v.coverage} max={100} color={v.coverage >= 80 ? '#22c55e' : v.coverage >= 50 ? '#f59e0b' : '#dc2626'}
            extra={`(${v.taken}/${v.total})`} />
        ))}
      </div>

      {/* ── Section 3: Logistics ── */}
      <SectionHeader title={`📦 ${t.bi_logistics}`} />
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: S.isMobile ? 8 : 12, marginBottom: 12 }}>
        <KpiCard label={t.delivered}      value={summary.kitDelivered}          color="#22c55e" icon="✅" />
        <KpiCard label={t.failed}         value={summary.kitFailed}             color="#dc2626" icon="❌" />
        <KpiCard label={t.bi_delivery_rate} value={`${summary.kitDeliveryRate}%`} color="#0ea5e9" icon="🚚" />
        <KpiCard label={t.bi_pending_rem} value={summary.pendingReminders}      color="#f59e0b" icon="🔔" />
      </div>
      <div style={{ ...S.card, marginBottom: 16 }}>
        <SectionHeader title={t.bi_delivery_perf} />
        <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : 'repeat(2,1fr)', gap: 12 }}>
          {delivery.map(d => (
            <div key={d.kit_type} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: theme.text, textTransform: 'capitalize' }}>📦 {d.kit_type}</span>
                <span style={{ fontSize: 11, color: theme.textFaint }}>{d.total} total · {d.avg_delivery_days != null ? `avg ${d.avg_delivery_days}d` : 'no data'}</span>
              </div>
              <div style={{ display: 'flex', height: 8, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
                {d.delivered  > 0 && <div style={{ flex: d.delivered,  background: '#22c55e' }} title={`Delivered: ${d.delivered}`} />}
                {d.in_transit > 0 && <div style={{ flex: d.in_transit, background: '#0ea5e9' }} title={`In transit: ${d.in_transit}`} />}
                {d.ordered    > 0 && <div style={{ flex: d.ordered,    background: '#f59e0b' }} title={`Ordered: ${d.ordered}`} />}
                {d.failed     > 0 && <div style={{ flex: d.failed,     background: '#dc2626' }} title={`Failed: ${d.failed}`} />}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                {[['delivered','#22c55e'],['in_transit','#0ea5e9'],['ordered','#f59e0b'],['failed','#dc2626']].map(([k,c]) => d[k] > 0 && (
                  <span key={k} style={{ fontSize: 10, color: c }}>● {k.replace('_',' ')}: {d[k]}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Commerce ── */}
      <SectionHeader title={`🛍️ ${t.bi_commerce}`} />
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: S.isMobile ? 8 : 12, marginBottom: 12 }}>
        <KpiCard label={t.bi_revenue}   value={`${summary.totalRevenue}`}  color="#22c55e" icon="💰" sub="USDC" />
        <KpiCard label={t.bi_orders}    value={summary.totalOrders}         color="#0ea5e9" icon="📦" />
        <KpiCard label={t.bi_avg_order} value={`${summary.avgOrderValue}`}  color="#a855f7" icon="📊" sub="USDC avg" />
        <KpiCard label="Products"       value={summary.totalProducts}       color="#f59e0b" icon="🏪" />
      </div>
      {shop && shop.byCategory?.length > 0 && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <SectionHeader title={t.bi_shop_perf} subtitle={`Total: ${shop.totalRevenue} USDC`} />
          <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : 'repeat(2,1fr)', gap: 16 }}>
            <div>
              {shop.byCategory.map(c => (
                <BarRow key={c.category}
                  label={`${catEmoji[c.category] || '📦'} ${c.category}`}
                  value={c.revenue_usdc} max={shop.totalRevenue || 1}
                  color={catColors[c.category] || '#64748b'}
                  suffix=" USDC"
                  extra={`(${c.share_pct}%)`} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <DonutChart size={140} thickness={28}
                segments={shop.byCategory.map(c => ({ value: c.revenue_usdc, color: catColors[c.category] || '#64748b' }))} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {shop.byCategory.map(c => (
                  <span key={c.category} style={{ fontSize: 10, color: catColors[c.category] || '#64748b' }}>
                    ● {c.category} {c.share_pct}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 5: Appointments ── */}
      {appts && (
        <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={S.card}>
            <SectionHeader title={`🏥 ${t.bi_appt_summary}`} />
            {[['emergency','#dc2626','🚨'],['urgent','#d97706','⚠️'],['routine','#0284c7','📅']].map(([type,color,icon]) => (
              <BarRow key={type} label={`${icon} ${type}`} value={appts.byType[type] || 0} max={appts.total || 1} color={color} suffix="" extra={`/ ${appts.total}`} />
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['confirmed','#22c55e'],['scheduled','#0ea5e9'],['cancelled','#64748b']].map(([s,c]) => (
                <span key={s} style={{ fontSize: 11, background: c, color: '#fff', padding: '2px 8px', borderRadius: 8 }}>
                  {s}: {appts.byStatus[s] || 0}
                </span>
              ))}
            </div>
          </div>

          {/* Agent activity */}
          {agentAct && (
            <div style={S.card}>
              <SectionHeader title={`🤖 ${t.bi_agent_sessions}`} subtitle={`${agentAct.total} total · ${agentAct.successRate}% success`} />
              {agentAct.byAgent.map(a => (
                <BarRow key={a.agent} label={a.agent} value={pct(a.completed, a.sessions)} max={100} color="#4285f4"
                  extra={`(${a.completed}/${a.sessions} sessions)`} />
              ))}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['completed','#22c55e'],['running','#f59e0b'],['failed','#dc2626']].map(([s,c]) => (
                  <span key={s} style={{ fontSize: 11, background: c, color: '#fff', padding: '2px 8px', borderRadius: 8 }}>
                    {s}: {agentAct.byStatus[s] || 0}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 6: BPJS Coverage gauge ── */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <SectionHeader title="🛡 BPJS Coverage vs Risk Correlation" />
        <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
          {riskRegion.map(r => (
            <div key={r.region} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 8 }}>{r.region}</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <DonutChart size={90} thickness={16}
                  segments={[
                    { value: r.bpjs,         color: '#22c55e' },
                    { value: r.total - r.bpjs, color: '#dc2626' },
                  ]} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 13, fontWeight: 700, color: theme.text }}>
                  {pct(r.bpjs, r.total)}%
                </div>
              </div>
              <div style={{ fontSize: 10, color: theme.textFaint, marginTop: 4 }}>
                {r.bpjs}/{r.total} covered · {r.high} high-risk
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// helper used inside Analytics
function pct(n, d) { return d === 0 ? 0 : Math.round((n / d) * 100); }

// ── Version / Diagnostics Panel ───────────────────────────────────────────────
function VersionPanel() {
  const { S, theme } = useApp();
  const [info, setInfo]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  const load = () => {
    setLoading(true); setError(null);
    api.getVersion()
      .then(d => { setInfo(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const copyReport = () => {
    if (!info) return;
    const lines = [
      '=== NutriSakti Version Report ===',
      `Server version:  ${info.server?.version}`,
      `Build time:      ${info.server?.buildTime}`,
      `Git commit:      ${info.server?.gitCommit}`,
      `Node.js:         ${info.server?.nodeVersion}`,
      `Environment:     ${info.server?.environment}`,
      `Uptime:          ${info.server?.uptimeHuman}`,
      `Memory:          ${info.server?.memoryMB} MB`,
      '',
      `Client version:  ${process.env.REACT_APP_VERSION || '4.0.0'}`,
      `Client build:    ${process.env.REACT_APP_BUILD_TIME || 'local dev'}`,
      `Client commit:   ${process.env.REACT_APP_GIT_COMMIT || 'local'}`,
      '',
      '=== Services ===',
      `Gemini API key:  ${info.checks?.geminiApiKey ? '✅ Configured' : '❌ NOT SET'}`,
      `Gemini models:   ${info.services?.gemini?.models?.join(', ')}`,
      `Agents:          ${info.services?.agents?.join(', ')}`,
      `MCP Tools:       ${info.services?.mcpTools?.join(', ')}`,
      '',
      '=== Features ===',
      ...(info.services?.features || []).map(f => `  ✅ ${f}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const Check = ({ ok, label, detail }) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${theme.border}` }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{ok ? '✅' : '❌'}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize: S.fs?.base || 15, fontWeight:600, color: ok ? theme.success : theme.danger }}>{label}</div>
        {detail && <div style={{ fontSize: S.fs?.xs || 12, color:theme.textMuted, marginTop:2 }}>{detail}</div>}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, mono }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${theme.border}`, gap:12 }}>
      <span style={{ fontSize: S.fs?.sm || 14, color:theme.textMuted, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize: S.fs?.sm || 14, fontWeight:600, color:theme.text, fontFamily: mono ? 'monospace' : 'inherit', textAlign:'right', wordBreak:'break-all' }}>{value ?? '—'}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ ...S.card, marginBottom:16, background:`linear-gradient(135deg, ${theme.accent}, ${theme.accentLight || theme.accent})`, border:'none' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize: S.isMobile ? 18 : 22, fontWeight:800, color:'#fff' }}>🔍 Version & Diagnostics</div>
            <div style={{ fontSize: S.fs?.sm || 14, color:'rgba(255,255,255,0.8)', marginTop:4 }}>
              Paste this report when verifying your deployment
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ ...S.btnSm('#ffffff33'), color:'#fff', border:'1px solid rgba(255,255,255,0.4)' }} onClick={load}>↺ Refresh</button>
            <button style={{ ...S.btnSm(copied ? '#15803d' : '#ffffff33'), color:'#fff', border:'1px solid rgba(255,255,255,0.4)' }} onClick={copyReport}>
              {copied ? '✅ Copied!' : '📋 Copy Report'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ ...S.card, textAlign:'center', padding:40, color:theme.textMuted }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
          <div style={{ fontSize: S.fs?.base || 15 }}>Checking server...</div>
        </div>
      )}

      {error && (
        <div style={{ ...S.card, borderLeft:`4px solid ${theme.danger}`, marginBottom:16 }}>
          <div style={{ fontSize: S.fs?.md || 16, fontWeight:700, color:theme.danger, marginBottom:6 }}>❌ Cannot reach server</div>
          <div style={{ fontSize: S.fs?.sm || 14, color:theme.textMuted, fontFamily:'monospace' }}>{error}</div>
          <div style={{ fontSize: S.fs?.sm || 14, color:theme.textMuted, marginTop:8 }}>
            Make sure the server is running and accessible at <code>/api/version</code>
          </div>
        </div>
      )}

      {info && !loading && (
        <>
          {/* Health checks */}
          <div style={{ ...S.card, marginBottom:16 }}>
            <div style={{ ...S.cardTitle, marginBottom:12 }}>🩺 Health Checks</div>
            <Check ok={true}                        label="Server reachable"          detail={`Responded in < 1s`} />
            <Check ok={info.checks?.dotenvLoaded}   label="Environment variables loaded" detail={info.checks?.dotenvLoaded ? 'dotenv loaded successfully' : 'GEMINI_API_KEY not in environment'} />
            <Check ok={info.checks?.geminiApiKey}   label="Gemini API key configured" detail={info.services?.gemini?.keyPrefix ? `Key: ${info.services.gemini.keyPrefix}` : 'Set GEMINI_API_KEY in server/.env or Cloud Run env vars'} />
            <Check ok={info.services?.agents?.length > 0} label="All agents loaded"  detail={info.services?.agents?.join(', ')} />
          </div>

          {/* Server info */}
          <div style={{ display:'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 }}>
            <div style={S.card}>
              <div style={{ ...S.cardTitle, marginBottom:12 }}>🖥 Server</div>
              <InfoRow label="Version"     value={info.server?.version} />
              <InfoRow label="Build time"  value={info.server?.buildTime ? new Date(info.server.buildTime).toLocaleString() : '—'} />
              <InfoRow label="Git commit"  value={info.server?.gitCommit} mono />
              <InfoRow label="Node.js"     value={info.server?.nodeVersion} />
              <InfoRow label="Environment" value={info.server?.environment} />
              <InfoRow label="Uptime"      value={info.server?.uptimeHuman} />
              <InfoRow label="Memory"      value={`${info.server?.memoryMB} MB`} />
            </div>

            <div style={S.card}>
              <div style={{ ...S.cardTitle, marginBottom:12 }}>💻 Client</div>
              <InfoRow label="Version"    value={process.env.REACT_APP_VERSION || '4.0.0'} />
              <InfoRow label="Build time" value={process.env.REACT_APP_BUILD_TIME ? new Date(process.env.REACT_APP_BUILD_TIME).toLocaleString() : 'Local dev build'} />
              <InfoRow label="Git commit" value={process.env.REACT_APP_GIT_COMMIT || 'local'} mono />
              <InfoRow label="React"      value="18.2.0" />
              <InfoRow label="Build env"  value={process.env.NODE_ENV} />
            </div>
          </div>

          {/* Gemini models */}
          <div style={{ ...S.card, marginBottom:16 }}>
            <div style={{ ...S.cardTitle, marginBottom:12 }}>✦ Gemini AI</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
              {info.services?.gemini?.models?.map((m, i) => (
                <span key={m} style={{ background: i === 0 ? theme.accent : theme.border, color: i === 0 ? '#fff' : theme.text, padding:'4px 12px', borderRadius:20, fontSize: S.fs?.sm || 14, fontWeight:600 }}>
                  {i === 0 ? '⭐ ' : ''}{m}
                </span>
              ))}
            </div>
            <div style={{ fontSize: S.fs?.xs || 12, color:theme.textMuted }}>
              Models are tried in order. If the primary is rate-limited (429) or overloaded (503), the next model is used automatically.
            </div>
          </div>

          {/* Features */}
          <div style={S.card}>
            <div style={{ ...S.cardTitle, marginBottom:12 }}>🚀 Active Features</div>
            <div style={{ display:'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap:4 }}>
              {info.services?.features?.map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize: S.fs?.sm || 14 }}>
                  <span style={{ color:theme.success, fontSize:16 }}>✅</span>
                  <span style={{ color:theme.text }}>{f.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Bottom Nav (mobile only) ──────────────────────────────────────────────────
const TABS = (t) => [
  { id:'overview',      label: t.nav_overview,      short:'📊' },
  { id:'analytics',     label: t.nav_analytics,     short:'📈' },
  { id:'chat',          label: t.nav_chat,           short:'🤖' },
  { id:'mothers',       label: t.nav_mothers,        short:'👩' },
  { id:'appointments',  label: t.nav_appointments,   short:'🏥' },
  { id:'reminders',     label: t.nav_reminders,      short:'🔔' },
  { id:'shop',          label: t.nav_shop,           short:'🛍️' },
  { id:'calendar',      label: t.nav_calendar,       short:'💉' },
  { id:'delivery',      label: t.nav_delivery,       short:'📦' },
  { id:'audit',         label: t.nav_audit,          short:'🔍' },
  { id:'kits',          label: t.nav_kits,           short:'🛒' },
  { id:'sessions',      label: t.nav_sessions,       short:'📋' },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const bp = useBreakpoint();
  const [tab, setTab] = useState('overview');
  const [mothers, setMothers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lang, setLang] = useState(() => localStorage.getItem('ns_lang') || 'en');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ns_theme') !== 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t     = translations[lang];
  const theme = isDark ? themes.dark : themes.light;
  const S     = makeS(theme, bp);
  const tabs  = TABS(t);

  const toggleLang = () => { const n = lang==='en'?'id':'en'; setLang(n); localStorage.setItem('ns_lang',n); };
  const toggleTheme = () => { const n = !isDark; setIsDark(n); localStorage.setItem('ns_theme',n?'dark':'light'); };

  useEffect(() => {
    api.getMothers().then(setMothers);
    api.getAlerts().then(setAlerts);
    const iv = setInterval(() => api.getAlerts().then(setAlerts), 10000);
    return () => clearInterval(iv);
  }, []);

  const handleSelectMother = useCallback(() => { setTab('audit'); setSidebarOpen(false); }, []);

  const navigate = (id) => { setTab(id); setSidebarOpen(false); };

  const tabLabel = tabs.find(tb => tb.id === tab)?.label || '';
  const ctx = { t, S, theme, lang, isDark };

  const sidebarStyle = {
    ...S.sidebar,
    ...(bp === 'mobile' && sidebarOpen ? S.sidebarOpen : {}),
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div style={S.app}>

        {/* Mobile overlay */}
        {bp === 'mobile' && sidebarOpen && (
          <div style={S.overlay} onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div style={S.logo}>
            <div>
              <div style={S.logoTitle}>NutriSakti</div>
              <div style={S.logoSub}>{t.app_subtitle}</div>
            </div>
            {bp === 'mobile' && (
              <button style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',fontSize:22,cursor:'pointer'}} onClick={()=>setSidebarOpen(false)}>✕</button>
            )}
          </div>

          <div style={{flex:1, overflowY:'auto'}}>
            {tabs.map(tb => (
              <button key={tb.id} style={S.navBtn(tab === tb.id)} onClick={() => navigate(tb.id)}>
                {tb.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div style={{padding:'16px 20px', borderTop:`1px solid ${theme.sidebarBorder}`, flexShrink:0}}>
            <div style={{fontSize:11, color:theme.sidebarMuted, marginBottom:10, textTransform:'uppercase', letterSpacing:1, fontWeight:700}}>{t.settings}</div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
              <span style={{fontSize:13, color:theme.sidebarMuted}}>{t.language}</span>
              <button onClick={toggleLang} style={{background:'rgba(255,255,255,0.15)', border:'none', borderRadius:20, padding:'4px 12px', cursor:'pointer', fontSize:12, color:'#fff', fontWeight:700}}>
                {lang==='en' ? '🇬🇧 EN' : '🇮🇩 ID'}
              </button>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
              <span style={{fontSize:13, color:theme.sidebarMuted}}>{t.theme}</span>
              <button onClick={toggleTheme} style={{background:'rgba(255,255,255,0.15)', border:'none', borderRadius:20, padding:'4px 12px', cursor:'pointer', fontSize:12, color:'#fff', fontWeight:700}}>
                {isDark ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <div style={{paddingTop:12, borderTop:`1px solid ${theme.sidebarBorder}`}}>
              <div style={{fontSize:11, color:theme.sidebarMuted, marginBottom:4, fontWeight:700}}>MCP Tools</div>
              {['calendar','database','blockchain','whatsapp','gemini'].map(tool => (
                <div key={tool} style={{fontSize:11, color:'rgba(255,255,255,0.6)', padding:'2px 0'}}>🛠 {tool}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={S.main}>
          {/* Topbar */}
          <div style={S.topbar}>
            <div style={S.topbarLeft}>
              <button style={S.hamburger} onClick={() => setSidebarOpen(v => !v)}>☰</button>
              <div style={S.topbarTitle}>{tabLabel}</div>
            </div>
            <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
              {alerts.filter(a=>a.severity==='high').length > 0 && (
                <span style={S.badge('#dc2626')}>🔴 {alerts.filter(a=>a.severity==='high').length}</span>
              )}
              {!S.isMobile && <span style={S.badge('#0284c7')}>{t.api_label}: :8080</span>}
              <span style={S.badge('#15803d')}>{mothers.length} {S.isMobile ? '' : t.total_mothers}</span>
            </div>
          </div>

          {/* Page content */}
          <div style={S.content}>
            {tab==='overview'      && <Overview mothers={mothers} alerts={alerts} />}
            {tab==='analytics'     && <Analytics />}
            {tab==='chat'          && <AgentChat mothers={mothers} />}
            {tab==='mothers'       && <Mothers mothers={mothers} onSelect={handleSelectMother} />}
            {tab==='calendar'      && <VaccinationCalendar />}
            {tab==='delivery'      && <KitDeliveryTracking />}
            {tab==='audit'         && <HealthAudit mothers={mothers} />}
            {tab==='kits'          && <KitRequests mothers={mothers} />}
            {tab==='sessions'      && <Sessions />}
            {tab==='appointments'  && <Appointments mothers={mothers} />}
            {tab==='reminders'     && <Reminders mothers={mothers} />}
            {tab==='shop'          && <Shop mothers={mothers} />}
          </div>

          {/* Mobile bottom navigation */}
          {bp === 'mobile' && (
            <div style={{display:'flex', background:theme.surface, borderTop:`2px solid ${theme.border}`, position:'fixed', bottom:0, left:0, right:0, zIndex:100, overflowX:'auto', boxShadow:'0 -2px 12px rgba(0,0,0,0.1)'}}>
              {tabs.map(tb => (
                <button key={tb.id} onClick={() => navigate(tb.id)} style={{
                  flex:'0 0 auto', minWidth:58, padding:'8px 4px 6px',
                  background: tab===tb.id ? theme.accentBg : 'transparent',
                  border:'none',
                  borderTop: tab===tb.id ? `3px solid ${theme.accent}` : '3px solid transparent',
                  color: tab===tb.id ? theme.accent : theme.textMuted,
                  cursor:'pointer', fontSize:20, display:'flex',
                  flexDirection:'column', alignItems:'center', gap:2,
                }}>
                  <span>{tb.short}</span>
                  <span style={{fontSize:9, whiteSpace:'nowrap', fontWeight: tab===tb.id ? 700 : 400}}>{tb.label.replace(/^[^\s]+\s/,'').slice(0,8)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppCtx.Provider>
  );
}
