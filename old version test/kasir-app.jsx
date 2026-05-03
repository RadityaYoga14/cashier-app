import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── helpers ──────────────────────────────────────────────────────────────────
const IDR = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n ?? 0);

const dateStr = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().split("T")[0];

async function load(key, def) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : def;
  } catch { return def; }
}
async function persist(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── design tokens ────────────────────────────────────────────────────────────
const C = {
  amber: "#D97706", amberDark: "#92400E", amberMid: "#FEF3C7", amberLight: "#FFFBEB",
  green: "#059669", greenLight: "#ECFDF5",
  red: "#DC2626", redLight: "#FEF2F2",
  gray: "#6B7280", border: "#E5E7EB", text: "#111827", muted: "#9CA3AF",
  bg: "#FAFAF9", white: "#FFFFFF", surface: "#F9FAFB",
};

const cardSt = (extra = {}) => ({
  background: C.white, borderRadius: 16, padding: 20,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  border: `1px solid ${C.border}`, ...extra,
});
const inputSt = (extra = {}) => ({
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: `1.5px solid ${C.border}`, fontSize: 16, fontFamily: "inherit",
  outline: "none", color: C.text, background: C.white, ...extra,
});
const btnSt = (bg, extra = {}) => ({
  background: bg, color: "#fff", border: "none", borderRadius: 12,
  fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
  transition: "opacity 0.15s, transform 0.1s", ...extra,
});

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("kasir");
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [manualIncome, setManualIncome] = useState([]);
  const [storeName, setStoreName] = useState("Toko Saya");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, t, e, m, s] = await Promise.all([
        load("ksr-products", []), load("ksr-transactions", []),
        load("ksr-expenses", []), load("ksr-manual-income", []),
        load("ksr-store-name", "Toko Saya"),
      ]);
      setProducts(p); setTransactions(t); setExpenses(e);
      setManualIncome(m); setStoreName(s); setReady(true);
    })();
  }, []);

  const sp = async (p) => { setProducts(p); await persist("ksr-products", p); };
  const st = async (t) => { setTransactions(t); await persist("ksr-transactions", t); };
  const se = async (e) => { setExpenses(e); await persist("ksr-expenses", e); };
  const sm = async (m) => { setManualIncome(m); await persist("ksr-manual-income", m); };
  const sn = async (n) => { setStoreName(n); await persist("ksr-store-name", n); };

  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, fontFamily: "Nunito, sans-serif" }}>
      <div style={{ textAlign: "center", color: C.amber }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Memuat sistem kasir...</div>
      </div>
    </div>
  );

  const TABS = [
    { id: "kasir", icon: "🛒", label: "Kasir" },
    { id: "produk", icon: "📦", label: "Produk" },
    { id: "laporan", icon: "📊", label: "Laporan" },
    { id: "pembukuan", icon: "📒", label: "Pembukuan" },
  ];

  return (
    <div style={{ fontFamily: "Nunito, sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        button:active { transform: scale(0.96); }
        input:focus, select:focus { border-color: ${C.amber} !important; box-shadow: 0 0 0 3px rgba(217,119,6,0.15) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.amber} 0%, ${C.amberDark} 100%)`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 16px rgba(146,64,14,0.3)" }}>
        <span style={{ fontSize: 34 }}>🏪</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 21, lineHeight: 1.2 }}>{storeName}</div>
          <div style={{ color: "#FDE68A", fontSize: 12, fontWeight: 700 }}>Sistem Kasir Digital</div>
        </div>
        <button
          onClick={() => { const n = prompt("Nama toko:", storeName); if (n?.trim()) sn(n.trim()); }}
          style={{ ...btnSt("rgba(255,255,255,0.2)"), padding: "8px 14px", fontSize: 13, border: "1px solid rgba(255,255,255,0.35)" }}
        >✏️ Ganti Nama</button>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", background: C.white, borderBottom: `2px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "11px 4px", border: "none",
            borderBottom: tab === t.id ? `3px solid ${C.amber}` : "3px solid transparent",
            background: tab === t.id ? C.amberMid : C.white,
            color: tab === t.id ? C.amberDark : C.gray,
            fontWeight: tab === t.id ? 900 : 600, fontSize: 13,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px", maxWidth: 980, margin: "0 auto" }}>
        {tab === "kasir" && <KasirSection products={products} onCheckout={async tx => await st([...transactions, tx])} />}
        {tab === "produk" && <ProdukSection products={products} onSave={sp} />}
        {tab === "laporan" && <LaporanSection transactions={transactions} expenses={expenses} manualIncome={manualIncome} />}
        {tab === "pembukuan" && <PembukuanSection transactions={transactions} expenses={expenses} manualIncome={manualIncome} onAddExpense={async e => await se([...expenses, e])} onAddIncome={async i => await sm([...manualIncome, i])} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KASIR SECTION
// ═══════════════════════════════════════════════════════════════
function KasirSection({ products, onCheckout }) {
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("");
  const [done, setDone] = useState(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const payNum = parseInt(payment) || 0;
  const change = payNum - total;
  const canCheckout = cart.length > 0 && payNum >= total && payNum > 0;

  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
  });

  const setQty = (id, q) => q <= 0
    ? setCart(p => p.filter(i => i.id !== id))
    : setCart(p => p.map(i => i.id === id ? { ...i, qty: q } : i));

  const checkout = async () => {
    if (!canCheckout) return;
    const tx = {
      id: uid(), date: new Date().toISOString(),
      items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, emoji: i.emoji })),
      total, payment: payNum, change,
    };
    await onCheckout(tx);
    setDone(tx); setCart([]); setPayment("");
  };

  if (done) return (
    <div style={{ ...cardSt({ textAlign: "center", padding: "60px 32px" }) }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.green, marginBottom: 14 }}>Transaksi Berhasil!</div>
      <div style={{ fontSize: 17, color: C.gray, marginBottom: 6 }}>Total Belanja: <b style={{ color: C.text }}>{IDR(done.total)}</b></div>
      <div style={{ fontSize: 17, color: C.gray, marginBottom: 24 }}>Uang Diterima: <b style={{ color: C.text }}>{IDR(done.payment)}</b></div>
      <div style={{ background: C.amberMid, borderRadius: 20, padding: "24px 48px", display: "inline-block", marginBottom: 40, border: `2px solid ${C.amber}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.amberDark, marginBottom: 6, letterSpacing: 1 }}>💵 KEMBALIAN</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.amberDark }}>{IDR(done.change)}</div>
      </div>
      <br />
      <button onClick={() => setDone(null)} style={{ ...btnSt(C.amber), fontSize: 18, padding: "16px 52px" }}>
        🛒 Transaksi Baru
      </button>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, alignItems: "start" }}>
      {/* Product Grid */}
      <div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 14 }}>Pilih produk — klik untuk ditambahkan ke keranjang</div>
        {products.length === 0 ? (
          <div style={{ ...cardSt({ textAlign: "center", padding: "60px 24px" }), color: C.muted }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Belum ada produk</div>
            <div style={{ fontSize: 15 }}>Silakan tambah produk di menu <b style={{ color: C.amberDark }}>Produk</b> terlebih dahulu</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 10 }}>
            {products.map(p => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <button key={p.id} onClick={() => addToCart(p)} style={{
                  background: inCart ? C.amberMid : C.white,
                  border: `2px solid ${inCart ? C.amber : C.border}`,
                  borderRadius: 14, padding: "14px 8px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", textAlign: "center", position: "relative",
                }}
                onMouseOver={e => { if (!inCart) { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = C.amberLight; } }}
                onMouseOut={e => { if (!inCart) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; } }}
                >
                  {inCart && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: C.amber, color: "#fff", fontSize: 11, fontWeight: 900, borderRadius: 20, padding: "2px 7px", minWidth: 22, textAlign: "center" }}>
                      ×{inCart.qty}
                    </div>
                  )}
                  <span style={{ fontSize: 36 }}>{p.emoji || "🛍️"}</span>
                  <div style={{ fontWeight: 800, fontSize: 13, color: C.text, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: C.amberDark }}>{IDR(p.price)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart */}
      <div style={{ ...cardSt({ position: "sticky", top: 66 }) }}>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>🧾 Keranjang Belanja</div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, fontSize: 15, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
            Belum ada item yang dipilih
          </div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 8 }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji || "🛍️"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.amberDark, fontWeight: 800 }}>{IDR(item.price * item.qty)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => setQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 18, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>−</button>
                  <span style={{ fontWeight: 900, minWidth: 22, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
                  <button onClick={() => setQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${C.amber}`, background: C.amber, fontSize: 18, fontWeight: 900, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ paddingTop: cart.length > 0 ? 14 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20, marginBottom: 16 }}>
            <span>Total</span>
            <span style={{ color: C.amberDark }}>{IDR(total)}</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 6, color: C.gray }}>💵 Uang yang Diterima (Rp)</label>
            <input
              type="number" value={payment}
              onChange={e => setPayment(e.target.value)}
              placeholder="Masukkan jumlah uang..."
              style={{ ...inputSt({ fontSize: 18, fontWeight: 800 }) }}
            />
          </div>

          {payment && (
            <div style={{
              background: change >= 0 ? C.greenLight : C.redLight,
              border: `2px solid ${change >= 0 ? "#6EE7B7" : "#FCA5A5"}`,
              borderRadius: 12, padding: "14px", marginBottom: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: change >= 0 ? C.green : C.red, marginBottom: 3 }}>
                {change >= 0 ? "KEMBALIAN" : "⚠️ UANG KURANG"}
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: change >= 0 ? C.green : C.red }}>
                {IDR(Math.abs(change))}
              </div>
            </div>
          )}

          <button onClick={checkout} disabled={!canCheckout} style={{
            ...btnSt(C.green), width: "100%", fontSize: 16, padding: "15px",
            opacity: canCheckout ? 1 : 0.38, marginBottom: 8,
          }}>
            ✅ Selesaikan Transaksi
          </button>

          {cart.length > 0 && (
            <button onClick={() => { setCart([]); setPayment(""); }} style={{
              background: C.white, color: C.red, border: `1.5px solid #FECACA`,
              borderRadius: 12, fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
              width: "100%", fontSize: 14, padding: "10px",
            }}>🗑️ Kosongkan Keranjang</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRODUK SECTION
// ═══════════════════════════════════════════════════════════════
const EMOJIS = [
  "🛍️","🍎","🍌","🍊","🥤","🍕","🍜","☕","🍰","🧃",
  "🥛","🍞","🥩","🐟","🧴","🧹","📦","🎁","🧅","🌶️",
  "🍫","🥚","🫙","🥫","🍿","🍦","🧁","🥐","🍋","🫐",
];

function ProdukSection({ products, onSave }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("🛍️");
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const reset = () => { setName(""); setPrice(""); setEmoji("🛍️"); setEditing(null); setErr(""); };

  const doSave = async () => {
    if (!name.trim()) { setErr("Nama produk harus diisi"); return; }
    const p = parseInt(price);
    if (!p || p <= 0) { setErr("Harga harus diisi dengan benar (angka saja)"); return; }
    const item = { id: editing || uid(), name: name.trim(), price: p, emoji };
    await onSave(editing ? products.map(x => x.id === editing ? item : x) : [...products, item]);
    reset();
  };

  const doEdit = (p) => {
    setEditing(p.id); setName(p.name); setPrice(String(p.price)); setEmoji(p.emoji || "🛍️");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const doDelete = async (id) => {
    if (!confirm("Hapus produk ini? Data tidak bisa dikembalikan.")) return;
    await onSave(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Form */}
      <div style={{ ...cardSt({ marginBottom: 24, border: editing ? `2px solid ${C.amber}` : `1px solid ${C.border}` }) }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: editing ? C.amberDark : C.text }}>
          {editing ? "✏️ Edit Produk" : "➕ Tambah Produk Baru"}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 9, color: C.gray }}>Pilih Ikon Produk</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 42, height: 42, borderRadius: 10,
                border: `2px solid ${emoji === e ? C.amber : C.border}`,
                background: emoji === e ? C.amberMid : C.white,
                fontSize: 20, cursor: "pointer", transition: "all 0.1s",
              }}>{e}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 7, color: C.gray }}>Nama Produk</label>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()}
              placeholder="Contoh: Es Teh Manis" style={inputSt()} />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 7, color: C.gray }}>Harga Jual (Rp)</label>
            <input value={price} onChange={e => setPrice(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()}
              type="number" placeholder="Contoh: 5000" style={inputSt()} />
          </div>
        </div>

        {err && <div style={{ color: C.red, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⚠️ {err}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={doSave} style={{ ...btnSt(C.amber), flex: 1, padding: "13px", fontSize: 15 }}>
            {editing ? "💾 Simpan Perubahan" : "➕ Tambah Produk"}
          </button>
          {editing && (
            <button onClick={reset} style={{
              background: C.surface, color: C.text, border: `1.5px solid ${C.border}`,
              borderRadius: 12, fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
              padding: "13px 20px", fontSize: 15,
            }}>Batal</button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>📦 Daftar Produk ({products.length})</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari produk..."
          style={{ ...inputSt({ width: "auto", fontSize: 14, padding: "9px 14px" }) }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...cardSt({ textAlign: "center", padding: "48px" }), color: C.muted }}>
          {products.length === 0 ? "Belum ada produk. Silakan tambah produk di atas." : "Produk tidak ditemukan."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id} style={cardSt({ padding: 16 })}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>{p.emoji || "🛍️"}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontWeight: 900, color: C.amberDark, fontSize: 17, marginBottom: 14 }}>{IDR(p.price)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => doEdit(p)} style={{ ...btnSt(C.amber), flex: 1, padding: "9px", fontSize: 13 }}>✏️ Edit</button>
                <button onClick={() => doDelete(p.id)} style={{ ...btnSt(C.red), flex: 1, padding: "9px", fontSize: 13 }}>🗑️ Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LAPORAN SECTION
// ═══════════════════════════════════════════════════════════════
function LaporanSection({ transactions, expenses, manualIncome }) {
  const [period, setPeriod] = useState("bulan");

  const getStart = () => {
    const n = new Date();
    if (period === "minggu") return new Date(n.getTime() - 7 * 86400000);
    if (period === "bulan") return new Date(n.getFullYear(), n.getMonth(), 1);
    if (period === "3bulan") return new Date(n.getFullYear(), n.getMonth() - 2, 1);
    if (period === "6bulan") return new Date(n.getFullYear(), n.getMonth() - 5, 1);
    return new Date(n.getFullYear(), 0, 1);
  };

  const start = getStart();
  const fTx = transactions.filter(t => new Date(t.date) >= start);
  const fExp = expenses.filter(e => new Date(e.date) >= start);
  const fInc = manualIncome.filter(m => new Date(m.date) >= start);

  const salesIncome = fTx.reduce((s, t) => s + t.total, 0);
  const extraIncome = fInc.reduce((s, m) => s + m.amount, 0);
  const grossIncome = salesIncome + extraIncome;
  const totalExp = fExp.reduce((s, e) => s + e.amount, 0);
  const netIncome = grossIncome - totalExp;
  const avgTx = fTx.length ? Math.round(salesIncome / fTx.length) : 0;

  const chartData = (() => {
    const g = {};
    const key = (d) => {
      if (period === "minggu") return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      if (period === "bulan") return `Tgl ${d.getDate()}`;
      return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    };
    [
      ...fTx.map(t => ({ date: t.date, amt: t.total, typ: "i" })),
      ...fInc.map(m => ({ date: m.date, amt: m.amount, typ: "i" })),
      ...fExp.map(e => ({ date: e.date, amt: e.amount, typ: "e" })),
    ].forEach(({ date, amt, typ }) => {
      const k = key(new Date(date));
      if (!g[k]) g[k] = { name: k, Pendapatan: 0, Pengeluaran: 0 };
      g[k][typ === "i" ? "Pendapatan" : "Pengeluaran"] += amt;
    });
    return Object.values(g);
  })();

  const PERIODS = [
    { id: "minggu", label: "7 Hari Terakhir" },
    { id: "bulan", label: "Bulan Ini" },
    { id: "3bulan", label: "3 Bulan" },
    { id: "6bulan", label: "6 Bulan" },
    { id: "tahun", label: "Setahun" },
  ];

  const stats = [
    { label: "💰 Laba Kotor", sub: "Total pendapatan semua sumber", val: grossIncome, color: C.amber, bg: C.amberMid },
    { label: "💸 Total Pengeluaran", sub: "Semua biaya operasional", val: totalExp, color: C.red, bg: C.redLight },
    { label: "📈 Laba Bersih", sub: "Pendapatan dikurangi pengeluaran", val: netIncome, color: netIncome >= 0 ? C.green : C.red, bg: netIncome >= 0 ? C.greenLight : C.redLight },
  ];

  return (
    <div>
      {/* Period Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            padding: "10px 20px", borderRadius: 24, fontFamily: "inherit",
            border: `2px solid ${period === p.id ? C.amber : C.border}`,
            background: period === p.id ? C.amber : C.white,
            color: period === p.id ? "#fff" : C.text,
            fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 16, padding: "18px 16px", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 10 }}>{s.sub}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{IDR(s.val)}</div>
          </div>
        ))}
      </div>

      {/* Extra cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { label: "🧾 Jumlah Transaksi", val: `${fTx.length} transaksi`, color: C.text },
          { label: "📊 Rata-rata per Transaksi", val: IDR(avgTx), color: C.amberDark },
          { label: "💰 Dari Penjualan Toko", val: IDR(salesIncome), color: C.green },
        ].map((s, i) => (
          <div key={i} style={cardSt()}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={cardSt()}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📊 Grafik Pendapatan & Pengeluaran</div>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontFamily: "Nunito", fontSize: 11, fill: C.gray }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Nunito", fontSize: 11, fill: C.gray }} tickFormatter={v => `${Math.round(v / 1000)}rb`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v, n) => [IDR(v), n]}
                  contentStyle={{ fontFamily: "Nunito", borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "10px 16px" }}
                />
                <Bar dataKey="Pendapatan" fill={C.amber} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill={C.red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 12 }}>
              {[{ c: C.amber, l: "Pendapatan" }, { c: C.red, l: "Pengeluaran" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: c }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.gray }}>{l}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "48px", color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Belum ada data untuk periode ini</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PEMBUKUAN SECTION
// ═══════════════════════════════════════════════════════════════
function PembukuanSection({ transactions, expenses, manualIncome, onAddExpense, onAddIncome }) {
  const [mode, setMode] = useState(null);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [filter, setFilter] = useState("semua");

  const reset = () => { setDesc(""); setAmount(""); setDate(todayISO()); };

  const submit = async () => {
    if (!desc.trim() || !parseInt(amount)) return;
    const entry = {
      id: uid(), date: new Date(date + "T12:00:00").toISOString(),
      description: desc.trim(), amount: parseInt(amount),
    };
    if (mode === "expense") await onAddExpense(entry);
    else await onAddIncome(entry);
    reset(); setMode(null);
  };

  const totalSales = transactions.reduce((s, t) => s + t.total, 0);
  const totalManInc = manualIncome.reduce((s, m) => s + m.amount, 0);
  const totalInc = totalSales + totalManInc;
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalInc - totalExp;

  const allEntries = [
    ...transactions.map(t => ({
      id: t.id, date: t.date, type: "income",
      desc: `🛒 Penjualan — ${t.items.slice(0, 2).map(i => `${i.name} ×${i.qty}`).join(", ")}${t.items.length > 2 ? ` +${t.items.length - 2} item lainnya` : ""}`,
      amount: t.total, source: "kasir",
    })),
    ...manualIncome.map(m => ({ id: m.id, date: m.date, type: "income", desc: m.description, amount: m.amount, source: "manual" })),
    ...expenses.map(e => ({ id: e.id, date: e.date, type: "expense", desc: e.description, amount: e.amount, source: "manual" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = allEntries.filter(e =>
    filter === "semua" ? true : filter === "income" ? e.type === "income" : e.type === "expense"
  );

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "💰 Total Pendapatan", val: totalInc, color: C.green, bg: C.greenLight },
          { label: "💸 Total Pengeluaran", val: totalExp, color: C.red, bg: C.redLight },
          { label: "🏦 Saldo Bersih", val: balance, color: balance >= 0 ? C.amberDark : C.red, bg: balance >= 0 ? C.amberMid : C.redLight },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 16, padding: 18, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{IDR(s.val)}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={cardSt()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 6 }}>🛒 Dari Penjualan Toko</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: C.green }}>{IDR(totalSales)}</div>
        </div>
        <div style={cardSt()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 6 }}>📝 Pendapatan Manual</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: C.green }}>{IDR(totalManInc)}</div>
        </div>
      </div>

      {/* Action buttons */}
      {!mode && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setMode("expense")} style={{ ...btnSt(C.red), padding: "15px", fontSize: 16 }}>
            💸 Catat Pengeluaran
          </button>
          <button onClick={() => setMode("income")} style={{ ...btnSt(C.green), padding: "15px", fontSize: 16 }}>
            💰 Pendapatan Manual
          </button>
        </div>
      )}

      {/* Form */}
      {mode && (
        <div style={{
          ...cardSt({ marginBottom: 20 }),
          border: `2px solid ${mode === "expense" ? "#FCA5A5" : "#6EE7B7"}`,
          background: mode === "expense" ? C.redLight : C.greenLight,
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18, color: mode === "expense" ? C.red : C.green }}>
            {mode === "expense" ? "💸 Catat Pengeluaran Baru" : "💰 Catat Pendapatan Manual"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 6, color: C.gray }}>Keterangan</label>
              <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder={mode === "expense" ? "Contoh: Beli stok barang" : "Contoh: Uang titipan warung"}
                style={inputSt()} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 6, color: C.gray }}>Jumlah (Rp)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0" style={inputSt()} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 6, color: C.gray }}>Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputSt({ width: "auto" }) }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={submit} style={{ ...btnSt(mode === "expense" ? C.red : C.green), padding: "12px 28px", fontSize: 15 }}>
              💾 Simpan
            </button>
            <button onClick={() => { setMode(null); reset(); }} style={{
              background: C.surface, color: C.text, border: `1.5px solid ${C.border}`,
              borderRadius: 12, fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
              padding: "12px 20px", fontSize: 15,
            }}>Batal</button>
          </div>
        </div>
      )}

      {/* Ledger */}
      <div style={cardSt()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>📒 Riwayat Pembukuan ({allEntries.length} entri)</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "semua", l: "Semua" }, { id: "income", l: "Pendapatan" }, { id: "expense", l: "Pengeluaran" }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                border: `1.5px solid ${filter === f.id ? C.amber : C.border}`,
                background: filter === f.id ? C.amber : C.white,
                color: filter === f.id ? "#fff" : C.text, cursor: "pointer", fontFamily: "inherit",
              }}>{f.l}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 700 }}>Belum ada catatan</div>
          </div>
        ) : (
          <div>
            {filtered.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: e.type === "income" ? C.greenLight : C.redLight,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {e.type === "income" ? (e.source === "kasir" ? "🛒" : "💰") : "💸"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                    {dateStr(e.date)} · {e.source === "kasir" ? "Otomatis dari Kasir" : "Input Manual"}
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, color: e.type === "income" ? C.green : C.red, flexShrink: 0 }}>
                  {e.type === "income" ? "+" : "−"}{IDR(e.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
