/**
 * ChatCards.js — Rich interactive card components for Guardian Agent chat
 * Renders structured data returned in the `cards[]` array from the server.
 */
import React, { useState } from 'react';

// ── Card dispatcher ───────────────────────────────────────────────────────────
export function RichCard({ card, theme, S, onAction }) {
  switch (card.type) {
    case 'appointment':  return <AppointmentCard  card={card} theme={theme} S={S} />;
    case 'calendar':     return <CalendarCard     card={card} theme={theme} S={S} />;
    case 'milestones':   return <MilestonesCard   card={card} theme={theme} S={S} />;
    case 'products':     return <ProductsCard     card={card} theme={theme} S={S} onAction={onAction} />;
    case 'order_confirm':return <OrderConfirmCard card={card} theme={theme} S={S} />;
    case 'qris':         return <QrisCard         card={card} theme={theme} S={S} />;
    case 'tracking':     return <TrackingCard     card={card} theme={theme} S={S} />;
    case 'nutrition':    return <NutritionCard    card={card} theme={theme} S={S} />;
    case 'audit':        return <AuditCard        card={card} theme={theme} S={S} />;
    default:             return null;
  }
}

// ── Shared card shell ─────────────────────────────────────────────────────────
function CardShell({ icon, title, color, children, theme, S }) {
  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${color || theme.border}`,
      borderLeft: `3px solid ${color || '#0ea5e9'}`,
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 8,
      fontSize: S.isMobile ? 12 : 13,
    }}>
      <div style={{
        background: color ? color + '22' : theme.bg,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontWeight: 700, color: color || theme.text, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
      </div>
      <div style={{ padding: '10px 12px' }}>{children}</div>
    </div>
  );
}

function Row({ label, value, theme, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid ${theme.border}` }}>
      <span style={{ color: theme.textFaint, fontSize: 11 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, color: theme.text, fontSize: 11 }}>{value}</span>
    </div>
  );
}

// ── Appointment + Map card ────────────────────────────────────────────────────
function AppointmentCard({ card, theme, S }) {
  const urgencyColor = { emergency: '#dc2626', urgent: '#d97706', routine: '#0284c7' };
  const color = urgencyColor[card.urgency] || '#0284c7';
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('id-ID', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }) : '-';

  return (
    <CardShell icon={card.urgency === 'emergency' ? '🚨' : card.urgency === 'urgent' ? '⚠️' : '🏥'}
      title={card.urgency === 'emergency' ? 'DARURAT — Janji Temu Dikonfirmasi' : card.urgency === 'urgent' ? 'Janji Temu Mendesak' : 'Janji Temu Rutin'}
      color={color} theme={theme} S={S}>

      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
        <div>
          <Row label="Dokter"    value={card.doctor}    theme={theme} bold />
          <Row label="Spesialis" value={card.specialty} theme={theme} />
          <Row label="Jadwal"    value={fmt(card.scheduledAt)} theme={theme} bold />
          <Row label="Status"    value={card.status}    theme={theme} />
          {card.reason && <div style={{ marginTop: 6, fontSize: 11, color: theme.textFaint, fontStyle: 'italic' }}>"{card.reason}"</div>}
        </div>

        {/* Map placeholder with real link */}
        <div>
          <div style={{
            background: '#1e3a5f',
            borderRadius: 8,
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: `1px solid ${theme.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Fake map grid */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 24, height: 1, background: '#38bdf8' }} />
              ))}
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * 40, width: 1, background: '#38bdf8' }} />
              ))}
            </div>
            <div style={{ fontSize: 24, zIndex: 1 }}>📍</div>
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', zIndex: 1, padding: '0 8px' }}>{card.address}</div>
          </div>
          <a href={card.mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', marginTop: 6, textAlign: 'center', fontSize: 11, color: '#38bdf8', textDecoration: 'none', padding: '4px 8px', border: '1px solid #38bdf8', borderRadius: 6 }}>
            🗺 Buka di Google Maps
          </a>
        </div>
      </div>
    </CardShell>
  );
}

// ── Vaccination calendar card ─────────────────────────────────────────────────
function CalendarCard({ card, theme, S }) {
  const daysLeft = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86400000);
  const urgencyColor = (d) => d < 0 ? '#dc2626' : d <= 3 ? '#dc2626' : d <= 7 ? '#d97706' : '#15803d';

  return (
    <CardShell icon="💉" title="Jadwal Vaksinasi" color="#7c3aed" theme={theme} S={S}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {card.reminders.map((r, i) => {
          const days = daysLeft(r.due_date);
          const color = urgencyColor(days);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6,
              background: days <= 3 ? color + '22' : theme.bg,
              border: `1px solid ${days <= 3 ? color : theme.border}`,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{days < 0 ? '!' : days === 0 ? '!' : days + 'd'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: theme.text }}>{r.vaccine_name || r.type}</div>
                <div style={{ fontSize: 10, color: theme.textFaint }}>
                  {new Date(r.due_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <span style={{ fontSize: 10, background: color, color: '#fff', padding: '2px 6px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>
                {days < 0 ? `${Math.abs(days)}d terlambat` : days === 0 ? 'HARI INI' : `${days} hari lagi`}
              </span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ── Health milestones card ────────────────────────────────────────────────────
function MilestonesCard({ card, theme, S }) {
  return (
    <CardShell icon="📅" title="Milestone Kesehatan" color="#0ea5e9" theme={theme} S={S}>
      {card.summary && <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 8 }}>{card.summary}</div>}
      {card.risks?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {card.risks.map((r, i) => (
            <span key={i} style={{ fontSize: 10, background: '#7f1d1d', color: '#fca5a5', padding: '2px 6px', borderRadius: 4 }}>⚠ {r}</span>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        {/* Timeline line */}
        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: theme.border }} />
        {card.milestones.map((m, i) => (
          <div key={i} style={{ position: 'relative', paddingLeft: 16, marginBottom: 10 }}>
            <div style={{ position: 'absolute', left: -6, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#0ea5e9', border: `2px solid ${theme.surface}` }} />
            <div style={{ fontWeight: 600, fontSize: 12, color: theme.text }}>{m.label}</div>
            <div style={{ fontSize: 10, color: theme.textFaint }}>{m.daysUntil} hari lagi · Hari ke-{m.day}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── Product grid card ─────────────────────────────────────────────────────────
function ProductsCard({ card, theme, S, onAction }) {
  const catEmoji = { milk: '🥛', biscuit: '🍪', diaper: '👶', vitamin: '💊', all: '🛍️' };

  return (
    <CardShell icon={catEmoji[card.category] || '🛍️'} title={`Produk ${card.category || 'Tersedia'}`} color="#0ea5e9" theme={theme} S={S}>
      <div style={{ display: 'grid', gridTemplateColumns: S.isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: 8 }}>
        {card.products.map(p => (
          <div key={p.id} style={{
            background: theme.bg, borderRadius: 8, padding: 8,
            border: `1px solid ${theme.border}`,
            display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24 }}>{p.image_emoji}</div>
            <div style={{ fontSize: 9, color: theme.textFaint }}>[{p.id}]</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.text, lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: theme.textFaint }}>{p.unit}</div>
            <div style={{ fontWeight: 700, color: '#0ea5e9', fontSize: 12 }}>{p.price_usdc} USDC</div>
            <div style={{ fontSize: 9, color: theme.textFaint }}>Rp{p.price_idr?.toLocaleString('id-ID')}</div>
            <div style={{ fontSize: 9, color: p.stock > 0 ? '#15803d' : '#dc2626' }}>
              {p.stock > 0 ? `✅ Stok: ${p.stock}` : '❌ Habis'}
            </div>
            {p.stock > 0 && onAction && (
              <button
                onClick={() => onAction(`pesan ${p.id} 1 buah`)}
                style={{
                  marginTop: 4, width: '100%', background: '#0ea5e9', color: '#fff',
                  border: 'none', borderRadius: 5, padding: '4px 0', fontSize: 10,
                  cursor: 'pointer', fontWeight: 600,
                }}>
                🛒 Pesan
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: theme.textFaint, textAlign: 'center' }}>
        Ketik ID produk untuk memesan, contoh: "pesan PRD001 2 buah"
      </div>
    </CardShell>
  );
}

// ── Order confirmation card ───────────────────────────────────────────────────
function OrderConfirmCard({ card, theme, S }) {
  return (
    <CardShell icon="✅" title="Pesanan Berhasil!" color="#15803d" theme={theme} S={S}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>{card.product?.image_emoji || '📦'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{card.product?.name}</div>
          <div style={{ fontSize: 11, color: theme.textFaint }}>{card.product?.brand} · {card.product?.unit}</div>
          <div style={{ marginTop: 6 }}>
            <Row label="Jumlah"  value={`${card.qty} pcs`}       theme={theme} />
            <Row label="Total"   value={`${card.total} USDC`}    theme={theme} bold />
            <Row label="Order ID" value={card.order?.id}         theme={theme} />
            <Row label="Alamat"  value={card.order?.address}     theme={theme} />
            <Row label="Estimasi" value="3-5 hari kerja"         theme={theme} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ── QRIS payment card ─────────────────────────────────────────────────────────
function QrisCard({ card, theme, S }) {
  const [paid, setPaid] = useState(false);

  // Generate a simple visual QR pattern from the qrData string (purely decorative)
  const seed = card.qrData || 'NUTRISAKTI';
  const cells = 15;
  const grid = Array.from({ length: cells }, (_, row) =>
    Array.from({ length: cells }, (_, col) => {
      // Finder patterns (corners)
      if ((row < 7 && col < 7) || (row < 7 && col >= cells - 7) || (row >= cells - 7 && col < 7)) {
        const r = row % 7, c = col % 7;
        return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      }
      // Data cells — pseudo-random from seed
      const charCode = seed.charCodeAt((row * cells + col) % seed.length);
      return ((charCode + row * 3 + col * 7) % 3) !== 0;
    })
  );

  return (
    <CardShell icon="💳" title="Pembayaran QRIS" color="#7c3aed" theme={theme} S={S}>
      <div style={{ display: 'flex', flexDirection: S.isMobile ? 'column' : 'row', gap: 12, alignItems: 'center' }}>
        {/* QR Code */}
        <div style={{
          background: '#fff', padding: 10, borderRadius: 8,
          border: '2px solid #7c3aed', flexShrink: 0,
          opacity: paid ? 0.4 : 1, position: 'relative',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells}, 8px)`, gap: 1 }}>
            {grid.flat().map((on, i) => (
              <div key={i} style={{ width: 8, height: 8, background: on ? '#1e293b' : '#fff', borderRadius: 1 }} />
            ))}
          </div>
          {paid && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.85)', borderRadius: 6,
            }}>
              <span style={{ fontSize: 28 }}>✅</span>
            </div>
          )}
        </div>

        {/* Payment details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 6 }}>Scan QRIS untuk membayar</div>
          <Row label="Merchant" value={card.merchant}          theme={theme} />
          <Row label="Order ID" value={card.orderId}           theme={theme} />
          <Row label="Jumlah"   value={`${card.amount} USDC`} theme={theme} bold />
          <div style={{ marginTop: 4, fontSize: 10, color: theme.textFaint, fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {card.qrData}
          </div>
          {!paid ? (
            <button
              onClick={() => setPaid(true)}
              style={{
                marginTop: 10, width: '100%', background: '#7c3aed', color: '#fff',
                border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 12,
                cursor: 'pointer', fontWeight: 700,
              }}>
              ✅ Simulasi Bayar Sekarang
            </button>
          ) : (
            <div style={{ marginTop: 10, textAlign: 'center', color: '#15803d', fontWeight: 700, fontSize: 13 }}>
              ✅ Pembayaran Berhasil!
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}

// ── Kit delivery tracking card ────────────────────────────────────────────────
function TrackingCard({ card, theme, S }) {
  return (
    <CardShell icon="📦" title={`Tracking Kit ${card.kitType}`} color="#0284c7" theme={theme} S={S}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ fontSize: 11, color: theme.textFaint, fontFamily: 'monospace', wordBreak: 'break-all' }}>
          🔗 TX: {card.txHash?.slice(0, 24)}...
        </div>
        <span style={{ fontSize: 11, background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
          {card.usdcEscrowed} USDC escrowed
        </span>
      </div>

      {/* Stepper */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: theme.border }} />
        {card.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, position: 'relative' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: step.done ? '#15803d' : theme.bg,
              border: `2px solid ${step.done ? '#15803d' : theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}>
              {step.done ? <span style={{ fontSize: 10, color: '#fff' }}>✓</span> : <span style={{ fontSize: 9, color: theme.textFaint }}>{i + 1}</span>}
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 12, fontWeight: step.done ? 600 : 400, color: step.done ? theme.text : theme.textFaint }}>{step.label}</div>
              {step.time && <div style={{ fontSize: 10, color: theme.textFaint }}>{new Date(step.time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── Nutrition analysis card ───────────────────────────────────────────────────
function NutritionCard({ card, theme, S }) {
  const nutrients = card.nutrients || {};
  const maxVal = Math.max(...Object.values(nutrients).filter(v => typeof v === 'number'), 1);

  return (
    <CardShell icon="🥗" title={`Analisis Nutrisi: ${card.food}`} color="#15803d" theme={theme} S={S}>
      {card.riskFlags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {card.riskFlags.map((f, i) => (
            <span key={i} style={{ fontSize: 10, background: '#7f1d1d', color: '#fca5a5', padding: '2px 6px', borderRadius: 4 }}>⚠ {f.replace('_', ' ')}</span>
          ))}
        </div>
      )}
      {Object.keys(nutrients).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {Object.entries(nutrients).filter(([, v]) => typeof v === 'number').map(([key, val]) => (
            <div key={key} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                <span style={{ color: theme.textFaint, textTransform: 'capitalize' }}>{key}</span>
                <span style={{ color: theme.text, fontWeight: 600 }}>{val}</span>
              </div>
              <div style={{ background: theme.bg, borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ background: '#15803d', width: `${Math.min(100, (val / maxVal) * 100)}%`, height: '100%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {card.recommendation && (
        <div style={{ fontSize: 11, color: '#86efac', background: '#14532d', padding: '6px 8px', borderRadius: 6 }}>
          💡 {card.recommendation}
        </div>
      )}
    </CardShell>
  );
}

// ── Audit summary card ────────────────────────────────────────────────────────
function AuditCard({ card, theme, S }) {
  const riskColor = { high: '#dc2626', medium: '#d97706', low: '#15803d' };
  return (
    <CardShell icon="📊" title="Audit Semua Ibu" color="#7c3aed" theme={theme} S={S}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        {[
          { label: 'Total', val: card.totalMothers, color: '#0ea5e9' },
          { label: 'Risiko Tinggi', val: card.highRisk, color: '#dc2626' },
          { label: 'Tanpa BPJS', val: card.uncoveredBPJS, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '6px 4px', background: theme.bg, borderRadius: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: theme.textFaint }}>{s.label}</div>
          </div>
        ))}
      </div>
      {card.mothers?.map((m, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${theme.border}`, fontSize: 11 }}>
          <span style={{ color: theme.text }}>{m.name}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ background: riskColor[m.riskLevel] || '#64748b', color: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: 9 }}>{m.riskLevel}</span>
            {!m.bpjsCovered && <span style={{ background: '#b91c1c', color: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: 9 }}>No BPJS</span>}
          </div>
        </div>
      ))}
    </CardShell>
  );
}

// ── Follow-up question chips ──────────────────────────────────────────────────
export function FollowUpChips({ questions, onSelect, theme, S }) {
  if (!questions || questions.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          style={{
            background: theme.accentBg || 'transparent',
            border: `1.5px solid ${theme.accent}`,
            color: theme.accent,
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: S.fs?.sm || 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.accent; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = theme.accentBg || 'transparent'; e.currentTarget.style.color = theme.accent; }}
        >
          💬 {q}
        </button>
      ))}
    </div>
  );
}
