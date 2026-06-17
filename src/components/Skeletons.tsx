/* Skeleton placeholder components — match the shape of their real counterparts. */

import type { CSSProperties } from 'react';

function S({ w = '100%', h = 14, r = 8, mb = 0, style }: {
  w?: string | number; h?: number; r?: number; mb?: number; style?: CSSProperties;
}) {
  return <span className="skel" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, ...style }} />;
}

/* ─────────────────── Cafe card ─────────────────── */
export function CafeCardSkeleton() {
  return (
    <div className="ccard" style={{ pointerEvents: 'none' }}>
      <div className="photo skel" style={{ background: 'none' }} />
      <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <S h={22} w="68%" r={6} />
        <S h={13} w="50%" />
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <S h={22} w={70} r={999} />
          <S h={22} w={44} r={999} style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Game card ─────────────────── */
export function GameCardSkeleton() {
  return (
    <div className="gcard" style={{ pointerEvents: 'none' }}>
      <div className="box skel" style={{ background: 'none' }} />
      <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <S h={19} w="80%" r={6} />
        <S h={13} w="55%" />
        <div className="wt">
          <div className="bar skel" style={{ flex: 1 }} />
          <S h={11} w={22} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Cafe detail page ─────────────────── */
export function CafeDetailSkeleton() {
  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ padding: '16px 0 12px' }}><S h={13} w={120} /></div>

      {/* Header: cover + info */}
      <div className="cafe-head">
        <div className="cover-box skel" style={{ background: 'none', minHeight: 230 }} />
        <div className="cafe-info" style={{ gap: 0 }}>
          <S h={42} w="75%" r={8} mb={12} />
          <S h={15} w="55%" mb={16} />
          <S h={15} w="90%" mb={6} />
          <S h={15} w="70%" mb={20} />
          {/* Stats row */}
          <div className="stats">
            {[80, 70, 90].map((w, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <S h={22} w={w} r={6} />
                <S h={11} w={w * 0.7} />
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            {[100, 90, 80].map((w, i) => <S key={i} h={36} w={w} r={11} />)}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ marginTop: 8 }}>
        <S h={26} w={160} r={6} />
        <S h={38} w={220} r={12} style={{ marginLeft: 'auto' }} />
      </div>

      {/* Game grid */}
      <div className="ggrid" style={{ marginTop: 16 }}>
        {Array(8).fill(0).map((_, i) => <GameCardSkeleton key={i} />)}
      </div>

      {/* Menu section */}
      <div className="section" style={{ marginTop: 32 }}>
        <S h={26} w={120} r={6} mb={18} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <S h={110} r={0} />
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <S h={16} w="70%" />
                <S h={13} w="35%" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews section */}
      <div className="section">
        <S h={26} w={100} r={6} mb={18} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="review-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <S h={38} w={38} r={999} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <S h={14} w="50%" />
                  <S h={12} w="30%" />
                </div>
              </div>
              <S h={13} w="100%" />
              <S h={13} w="80%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Game detail page ─────────────────── */
export function GameDetailSkeleton() {
  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ padding: '16px 0 12px' }}><S h={13} w={160} /></div>

      {/* Hero: art + info */}
      <div className="ghero">
        {/* Art box */}
        <div className="art skel" style={{ background: 'none', minHeight: 320 }} />

        {/* Info */}
        <div className="ginfo" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <S h={46} w="85%" r={8} mb={10} />
          <S h={15} w="60%" mb={18} />

          {/* Rating row */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
            <S h={38} w={80} r={6} />
            <S h={34} w={110} r={11} />
          </div>

          {/* Quick stats */}
          <div className="quickstats" style={{ marginBottom: 22 }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="qs" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <S h={11} w="70%" />
                <S h={20} w="55%" r={6} />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 11 }}>
            <S h={38} w={130} r={11} />
            <S h={38} w={110} r={11} />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="section">
        <S h={26} w={140} r={6} mb={14} />
        {[100, 95, 88, 70].map((w, i) => <S key={i} h={15} w={`${w}%`} mb={8} />)}
        <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap' }}>
          {[70, 80, 60, 90, 75].map((w, i) => <S key={i} h={24} w={w} r={999} />)}
        </div>
      </div>

      {/* Cafes where to play */}
      <div className="section">
        <S h={26} w={160} r={6} mb={14} />
        <div className="cafe-rows">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="crow" style={{ pointerEvents: 'none' }}>
              <S h={50} w={50} r={12} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <S h={16} w="60%" r={5} />
                <S h={13} w="80%" />
              </div>
              <S h={13} w={50} />
            </div>
          ))}
        </div>
      </div>

      {/* Discussion */}
      <div className="section">
        <S h={26} w={120} r={6} mb={18} />
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="comment">
            <S h={40} w={40} r={999} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <S h={14} w={80} />
                <S h={12} w={60} />
              </div>
              <S h={14} w="90%" />
              <S h={14} w="65%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
