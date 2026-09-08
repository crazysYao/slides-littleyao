import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';

import officeCircle from './assets/office-circle.jpg';
import mentoring from './assets/mentoring.jpg';
import meetingRoom from './assets/meeting-room.jpg';
import phonePeace from './assets/phone-peace.jpg';
import deskTalk from './assets/desk-talk.jpg';
import pairCloseup from './assets/pair-closeup.jpg';
import crewShot from './assets/crew-shot.jpg';
import certQr from './assets/cert-qr.png';

const recapVideo = new URL('./assets/recap.mp4', import.meta.url).href;

export const design: DesignSystem = {
  palette: { bg: '#faf5ec', text: '#40342a', accent: '#e2704a' },
  fonts: {
    display: '"PingFang TC", "Noto Sans TC", system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", system-ui, sans-serif',
  },
  typeScale: { hero: 150, body: 36 },
  radius: 16,
};

// 額外色票(DesignSystem 形狀之外)
const muted = '#a3937f';
const paper = '#fffdf8';
const tapeOrange = 'rgba(226, 112, 74, 0.35)';
const tapeMint = 'rgba(122, 178, 152, 0.45)';
const tapeYellow = 'rgba(240, 200, 90, 0.5)';

const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

// RISE — 全 deck 預設轉場
export const transition: SlideTransition = {
  duration: 200,
  exit: {
    duration: 140,
    easing: EASE_IN,
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-4px)' },
    ],
  },
  enter: {
    duration: 200,
    delay: 80,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

// SETTLE — 封面 / 結尾專用
const settle: SlideTransition = {
  duration: 280,
  exit: {
    duration: 160,
    easing: EASE_IN,
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)' },
    ],
  },
  enter: {
    duration: 280,
    delay: 100,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ],
  },
};

const fill = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  position: 'relative',
  overflow: 'hidden',
} as const;

// 紙膠帶裝飾條
const Tape = ({
  color,
  top,
  left,
  rotate,
  width = 220,
}: {
  color: string;
  top: number;
  left: number;
  rotate: number;
  width?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width,
      height: 52,
      background: color,
      transform: `rotate(${rotate}deg)`,
      borderRadius: 2,
    }}
  />
);

const PageFooter = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        right: 100,
        fontSize: 24,
        letterSpacing: '0.15em',
        color: muted,
      }}
    >
      {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </div>
  );
};

// 流程段落頁共用版面:時間籤 + 中文大標 + 越文副標 + 一句提示
const SegmentLayout = ({
  index,
  time,
  title,
  viTitle,
  note,
  viNote,
  children,
}: {
  index: string;
  time: string;
  title: string;
  viTitle?: string;
  note?: string;
  viNote?: string;
  children?: React.ReactNode;
}) => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 160px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        fontSize: 28,
        letterSpacing: '0.25em',
        color: 'var(--osd-accent)',
        fontWeight: 600,
      }}
    >
      <span>{index}</span>
      <span style={{ width: 48, height: 3, background: 'var(--osd-accent)' }} />
      <span>{time}</span>
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 110,
        fontWeight: 800,
        lineHeight: 1.15,
        margin: '40px 0 0',
      }}
    >
      {title}
    </h1>
    {viTitle && (
      <p style={{ fontSize: 40, color: 'var(--osd-accent)', margin: '28px 0 0', fontWeight: 600 }}>
        {viTitle}
      </p>
    )}
    {note && (
      <p style={{ fontSize: 'var(--osd-size-body)', color: muted, marginTop: 36, lineHeight: 1.6 }}>
        {note}
      </p>
    )}
    {viNote && (
      <p style={{ fontSize: 28, color: muted, marginTop: 12, lineHeight: 1.5 }}>{viNote}</p>
    )}
    {children}
    <PageFooter />
  </div>
);

/* ---------- P1 封面 ---------- */
const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 160px',
    }}
  >
    <Tape color={tapeOrange} top={120} left={280} rotate={-8} />
    <Tape color={tapeMint} top={200} left={1480} rotate={12} width={180} />
    <Tape color={tapeYellow} top={860} left={380} rotate={6} width={160} />
    <div style={{ fontSize: 28, letterSpacing: '0.4em', color: 'var(--osd-accent)', fontWeight: 600 }}>
      FAREWELL PARTY
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        lineHeight: 1.15,
        margin: '40px 0',
      }}
    >
      謝謝有你
    </h1>
    <p style={{ fontSize: 48, color: 'var(--osd-accent)', margin: '0 0 28px', fontWeight: 600 }}>
      Cảm ơn vì đã có bạn
    </p>
    <p style={{ fontSize: 40, color: muted, margin: 0 }}>
      實習生歡送會 · Tiệc chia tay thực tập sinh
    </p>
  </div>
);
Cover.transition = settle;

/* ---------- P2 流程總覽 ---------- */
const AgendaRow = ({ time, label, vi }: { time: string; label: string; vi: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 48,
      padding: '10px 0',
      borderBottom: `2px solid rgba(64, 52, 42, 0.08)`,
    }}
  >
    <span
      style={{
        fontSize: 30,
        fontWeight: 600,
        color: 'var(--osd-accent)',
        width: 260,
        textAlign: 'right',
        letterSpacing: '0.05em',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {time}
    </span>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: 24, color: muted, lineHeight: 1.3 }}>{vi}</span>
    </span>
  </div>
);

const Agenda: Page = () => (
  <div style={{ ...fill, padding: '110px 200px' }}>
    <Steps>
      <h2
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 72,
          fontWeight: 800,
          margin: '0 0 48px',
        }}
      >
        今天的流程 <span style={{ fontSize: 36, color: 'var(--osd-accent)', fontWeight: 600 }}>Chương trình hôm nay</span>
      </h2>
      <Step>
        <div>
          <AgendaRow time="0:00 – 0:15" label="取餐、暖場" vi="Lấy đồ ăn, khởi động" />
          <AgendaRow time="0:15 – 0:25" label="照片回顧影片" vi="Video kỷ niệm" />
          <AgendaRow time="0:25 – 0:45" label="「這段時間的你」" vi="Bạn trong thời gian qua" />
          <AgendaRow time="0:45 – 1:00" label="主角分享" vi="Nhân vật chính chia sẻ" />
          <AgendaRow time="1:00 – 1:15" label="頒發實習證明" vi="Trao giấy chứng nhận thực tập" />
          <AgendaRow time="1:15 – 1:30" label="合照、道別" vi="Chụp ảnh, tạm biệt" />
        </div>
      </Step>
    </Steps>
    <PageFooter />
  </div>
);

/* ---------- P3 取餐、暖場 ---------- */
const Warmup: Page = () => (
  <SegmentLayout
    index="01"
    time="0:00 – 0:15"
    title="取餐、暖場"
    viTitle="Lấy đồ ăn, khởi động"
    note="先吃點東西,隨意聊聊"
    viNote="Ăn chút gì đó, trò chuyện thoải mái"
  />
);

/* ---------- P4 照片回顧影片 ---------- */
const Recap: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        fontSize: 28,
        letterSpacing: '0.25em',
        color: 'var(--osd-accent)',
        fontWeight: 600,
      }}
    >
      <span>02</span>
      <span style={{ width: 48, height: 3, background: 'var(--osd-accent)' }} />
      <span>0:15 – 0:25</span>
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 84,
        fontWeight: 800,
        margin: '32px 0 48px',
        lineHeight: 1.15,
      }}
    >
      照片回顧影片 <span style={{ fontSize: 40, color: 'var(--osd-accent)', fontWeight: 600 }}>Video kỷ niệm</span>
    </h1>
    <div
      style={{
        background: paper,
        padding: 20,
        borderRadius: 'var(--osd-radius)',
        boxShadow: '0 16px 40px rgba(64, 52, 42, 0.14)',
        transform: 'rotate(-1deg)',
      }}
    >
      <video
        src={recapVideo}
        controls
        style={{ width: 1000, height: 562, display: 'block', borderRadius: 8, background: '#000' }}
      />
    </div>
    <PageFooter />
  </div>
);

/* ---------- P5 照片牆 ---------- */
const WallPhoto = ({
  src,
  rotate,
  caption,
}: {
  src: string;
  rotate: number;
  caption: string;
}) => (
  <div
    style={{
      background: paper,
      padding: '14px 14px 16px',
      borderRadius: 6,
      boxShadow: '0 14px 36px rgba(64, 52, 42, 0.16)',
      transform: `rotate(${rotate}deg)`,
    }}
  >
    <img src={src} style={{ width: 330, height: 330, objectFit: 'cover', display: 'block' }} />
    <p style={{ fontSize: 24, color: muted, margin: '14px 0 0', textAlign: 'center' }}>{caption}</p>
  </div>
);

const PhotoWall: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 120px',
    }}
  >
    <Tape color={tapeYellow} top={100} left={1520} rotate={10} width={170} />
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        fontWeight: 800,
        margin: '0 0 64px',
      }}
    >
      這些日子 <span style={{ fontSize: 36, color: 'var(--osd-accent)', fontWeight: 600 }}>Những ngày qua</span>
    </h2>
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      <WallPhoto src={mentoring} rotate={-3} caption="肩並肩 debug · Cùng nhau debug" />
      <WallPhoto src={phonePeace} rotate={2} caption="休息時間 · Giờ nghỉ" />
      <WallPhoto src={pairCloseup} rotate={-2} caption="一起想辦法 · Cùng tìm cách" />
      <WallPhoto src={crewShot} rotate={3} caption="拍攝花絮 · Hậu trường" />
    </div>
    <PageFooter />
  </div>
);

/* ---------- P6 這段時間的你 ---------- */
const Stories: Page = () => (
  <SegmentLayout
    index="03"
    time="0:25 – 0:45"
    title="「這段時間的你」"
    viTitle="Bạn trong thời gian qua"
    note="每位同事,說一件關於你的具體小事"
    viNote="Mỗi đồng nghiệp kể một kỷ niệm nhỏ về bạn"
  />
);

/* ---------- P7 主角分享 ---------- */
const PromptCard = ({ tape, title, vi }: { tape: string; title: string; vi: string }) => (
  <div
    style={{
      position: 'relative',
      background: paper,
      borderRadius: 'var(--osd-radius)',
      boxShadow: '0 12px 32px rgba(64, 52, 42, 0.12)',
      padding: '72px 56px 64px',
      width: 620,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -22,
        left: '50%',
        width: 180,
        height: 44,
        background: tape,
        transform: 'translateX(-50%) rotate(-3deg)',
        borderRadius: 2,
      }}
    />
    <p style={{ fontSize: 44, fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{title}</p>
    <p style={{ fontSize: 28, color: muted, margin: '16px 0 0', lineHeight: 1.4 }}>{vi}</p>
  </div>
);

const Sharing: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 120px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        fontSize: 28,
        letterSpacing: '0.25em',
        color: 'var(--osd-accent)',
        fontWeight: 600,
      }}
    >
      <span>04</span>
      <span style={{ width: 48, height: 3, background: 'var(--osd-accent)' }} />
      <span>0:45 – 1:00</span>
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 96,
        fontWeight: 800,
        margin: '36px 0 64px',
        lineHeight: 1.15,
      }}
    >
      換你說說
    </h1>
    <p style={{ fontSize: 38, color: 'var(--osd-accent)', fontWeight: 600, margin: '-32px 0 56px' }}>
      Đến lượt bạn chia sẻ
    </p>
    <div style={{ display: 'flex', gap: 64 }}>
      <PromptCard tape={tapeMint} title="在實習學到的事" vi="Điều học được trong kỳ thực tập" />
      <PromptCard tape={tapeYellow} title="最驚訝的事" vi="Điều bất ngờ nhất" />
    </div>
    <PageFooter />
  </div>
);

/* ---------- P8 頒發實習證明 ---------- */
// 依素材中兩位主角簡化而成的扁平人物
// 女生:黑長髮、淺藍襯衫、黑短裙、米色鞋
const InternGirl = () => (
  <svg width="220" height="340" viewBox="0 0 220 340">
    {/* 後髮 */}
    <path d="M62 60 Q58 150 74 196 L146 196 Q162 150 158 60 Z" fill="#2b2320" />
    {/* 頭 */}
    <circle cx="110" cy="78" r="44" fill="#f3d3b3" />
    {/* 瀏海 */}
    <path d="M66 70 Q72 26 110 26 Q148 26 154 70 Q136 52 110 50 Q84 52 66 70 Z" fill="#2b2320" />
    {/* 表情 */}
    <circle cx="94" cy="80" r="5" fill="#40342a" />
    <circle cx="126" cy="80" r="5" fill="#40342a" />
    <path d="M100 96 Q110 104 120 96" stroke="#c96f52" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="82" cy="92" r="7" fill="rgba(226,112,74,0.25)" />
    <circle cx="138" cy="92" r="7" fill="rgba(226,112,74,0.25)" />
    {/* 淺藍襯衫 */}
    <path d="M74 130 Q110 118 146 130 L160 216 L60 216 Z" fill="#a9c8e6" />
    <line x1="110" y1="132" x2="110" y2="214" stroke="#ffffff" strokeWidth="3" />
    <circle cx="110" cy="150" r="3" fill="#ffffff" />
    <circle cx="110" cy="172" r="3" fill="#ffffff" />
    <circle cx="110" cy="194" r="3" fill="#ffffff" />
    {/* 手臂 */}
    <path d="M74 132 Q52 168 60 204" stroke="#a9c8e6" strokeWidth="20" fill="none" strokeLinecap="round" />
    <path d="M146 132 Q168 168 160 204" stroke="#a9c8e6" strokeWidth="20" fill="none" strokeLinecap="round" />
    <circle cx="60" cy="208" r="10" fill="#f3d3b3" />
    <circle cx="160" cy="208" r="10" fill="#f3d3b3" />
    {/* 黑短裙 */}
    <path d="M64 214 L156 214 L164 258 L56 258 Z" fill="#33302f" />
    {/* 腿 */}
    <rect x="86" y="256" width="16" height="56" rx="8" fill="#f3d3b3" />
    <rect x="118" y="256" width="16" height="56" rx="8" fill="#f3d3b3" />
    {/* 白襪米鞋 */}
    <rect x="84" y="304" width="20" height="12" rx="6" fill="#ffffff" />
    <rect x="116" y="304" width="20" height="12" rx="6" fill="#ffffff" />
    <path d="M82 316 Q94 310 106 316 L106 326 L82 326 Z" fill="#d9c39a" />
    <path d="M114 316 Q126 310 138 316 L138 326 L114 326 Z" fill="#d9c39a" />
  </svg>
);

// 男生:黑短髮、深藍襯衫、黑長褲、白球鞋
const InternBoy = () => (
  <svg width="220" height="340" viewBox="0 0 220 340">
    {/* 頭 */}
    <circle cx="110" cy="74" r="44" fill="#f0cdaa" />
    {/* 短髮 */}
    <path d="M64 68 Q64 22 110 22 Q156 22 156 68 Q150 44 110 44 Q70 44 64 68 Z" fill="#241f1c" />
    {/* 表情 */}
    <circle cx="94" cy="76" r="5" fill="#40342a" />
    <circle cx="126" cy="76" r="5" fill="#40342a" />
    <path d="M100 92 Q110 100 120 92" stroke="#b56a4e" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* 深藍襯衫 */}
    <path d="M72 124 Q110 112 148 124 L158 226 L62 226 Z" fill="#2d3d5e" />
    <path d="M102 122 L110 134 L118 122 L110 118 Z" fill="#1f2c46" />
    <line x1="110" y1="134" x2="110" y2="224" stroke="#f0f2f5" strokeWidth="3" />
    <circle cx="110" cy="152" r="3" fill="#f0f2f5" />
    <circle cx="110" cy="176" r="3" fill="#f0f2f5" />
    <circle cx="110" cy="200" r="3" fill="#f0f2f5" />
    {/* 手臂 */}
    <path d="M72 128 Q50 168 58 210" stroke="#2d3d5e" strokeWidth="20" fill="none" strokeLinecap="round" />
    <path d="M148 128 Q170 168 162 210" stroke="#2d3d5e" strokeWidth="20" fill="none" strokeLinecap="round" />
    <circle cx="58" cy="214" r="10" fill="#f0cdaa" />
    <circle cx="162" cy="214" r="10" fill="#f0cdaa" />
    {/* 黑長褲 */}
    <path d="M66 224 L154 224 L150 310 L120 310 L114 248 L106 248 L100 310 L70 310 Z" fill="#2a2a2e" />
    {/* 白球鞋 */}
    <path d="M66 310 Q82 304 98 310 L98 324 L64 324 Z" fill="#ffffff" />
    <path d="M122 310 Q138 304 154 310 L156 324 L122 324 Z" fill="#ffffff" />
    <line x1="64" y1="320" x2="98" y2="320" stroke="#c9c9c9" strokeWidth="3" />
    <line x1="122" y1="320" x2="156" y2="320" stroke="#c9c9c9" strokeWidth="3" />
  </svg>
);

// 證書卡片:兩人到位後,從下方升起、微傾後擺正
const CertCard = () => (
  <div
    className="if-award-anim"
    style={{
      background: paper,
      border: '3px solid #c9a35c',
      borderRadius: 12,
      padding: 12,
      boxShadow: '0 24px 60px rgba(64, 52, 42, 0.2)',
      animation: `if-cert-present 900ms ${EASE_OUT} 800ms both`,
    }}
  >
    <div
      style={{
        border: '1px solid rgba(201, 163, 92, 0.6)',
        borderRadius: 8,
        padding: '36px 56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        width: 460,
      }}
    >
      <div style={{ fontSize: 48, lineHeight: 1 }}>🎓</div>
      <div
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 52,
          fontWeight: 800,
          letterSpacing: '0.15em',
        }}
      >
        實習證明
      </div>
      <div style={{ fontSize: 22, color: '#c9a35c', letterSpacing: '0.1em', fontWeight: 600 }}>
        GIẤY CHỨNG NHẬN THỰC TẬP
      </div>
      <div style={{ width: 110, height: 2, background: 'rgba(201, 163, 92, 0.6)' }} />
      <div style={{ fontSize: 26, color: muted, lineHeight: 1.5, textAlign: 'center' }}>
        感謝你這段時間的付出
        <br />
        Cảm ơn những nỗ lực của bạn
      </div>
    </div>
  </div>
);

const Gifts: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 460px 0 140px',
    }}
  >
    <style>{`
      @keyframes if-cert-present {
        0%   { opacity: 0; transform: translateY(120px) rotate(-5deg) scale(0.92); }
        70%  { opacity: 1; transform: translateY(-10px) rotate(1.2deg) scale(1.01); }
        100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
      }
      @keyframes if-walk-in-left {
        0%   { opacity: 0; transform: translateX(-180px); }
        70%  { opacity: 1; transform: translateX(14px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes if-walk-in-right {
        0%   { opacity: 0; transform: translateX(180px); }
        70%  { opacity: 1; transform: translateX(-14px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes if-qr-pop {
        0%   { opacity: 0; transform: rotate(3deg) scale(0.6) translateY(30px); }
        70%  { opacity: 1; transform: rotate(3deg) scale(1.05) translateY(-4px); }
        100% { opacity: 1; transform: rotate(3deg) scale(1) translateY(0); }
      }
      /* Step 揭示前凍結動畫時間軸,按下一步才從頭播放 */
      [data-osd-step='pending'] .if-award-anim {
        animation-play-state: paused !important;
      }
    `}</style>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        fontSize: 28,
        letterSpacing: '0.25em',
        color: 'var(--osd-accent)',
        fontWeight: 600,
      }}
    >
      <span>05</span>
      <span style={{ width: 48, height: 3, background: 'var(--osd-accent)' }} />
      <span>1:00 – 1:15</span>
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 84,
        fontWeight: 800,
        margin: '28px 0 8px',
        lineHeight: 1.15,
      }}
    >
      頒發實習證明
    </h1>
    <p style={{ fontSize: 34, color: 'var(--osd-accent)', fontWeight: 600, margin: '0 0 48px' }}>
      Trao giấy chứng nhận thực tập
    </p>
    {/* 一開始只有標題;按下一步(→/點擊)才揭示並播放頒證動畫 */}
    <Steps>
      <Step>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 48 }}>
          <div
            className="if-award-anim"
            style={{ animation: `if-walk-in-left 700ms ${EASE_OUT} both` }}
          >
            <InternBoy />
          </div>
          <div style={{ alignSelf: 'center' }}>
            <CertCard />
          </div>
          <div
            className="if-award-anim"
            style={{ animation: `if-walk-in-right 700ms ${EASE_OUT} both` }}
          >
            <InternGirl />
          </div>
        </div>
        {/* 動畫收尾後才浮現的 QR 貼紙(外層定位、內層跑動畫,transform 不互相覆蓋) */}
        <div
          style={{
            position: 'absolute',
            right: 130,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <div
            className="if-award-anim"
            style={{
              background: paper,
              borderRadius: 'var(--osd-radius)',
              boxShadow: '0 16px 40px rgba(64, 52, 42, 0.18)',
              padding: '26px 30px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              animation: `if-qr-pop 600ms ${EASE_OUT} 2400ms both`,
            }}
          >
            <img src={certQr} style={{ width: 220, height: 220, display: 'block' }} />
            <div style={{ fontSize: 24, fontWeight: 600, textAlign: 'center', lineHeight: 1.5 }}>
              掃描領取電子證明
              <br />
              <span style={{ fontSize: 20, color: muted, fontWeight: 500 }}>
                Quét mã để nhận bản điện tử
              </span>
            </div>
          </div>
        </div>
      </Step>
    </Steps>
    <PageFooter />
  </div>
);

/* ---------- P9 合照、道別 ---------- */
const Goodbye: Page = () => (
  <SegmentLayout
    index="06"
    time="1:15 – 1:30"
    title="合照、道別"
    viTitle="Chụp ảnh, tạm biệt"
    note="拍張合照,交換聯絡方式"
    viNote="Chụp ảnh chung, trao đổi liên lạc"
  />
);

/* ---------- P10 結尾 ---------- */
const Polaroid = ({
  src,
  rotate,
  caption,
}: {
  src: string;
  rotate: number;
  caption: string;
}) => (
  <div
    style={{
      background: paper,
      padding: '18px 18px 20px',
      borderRadius: 6,
      boxShadow: '0 14px 36px rgba(64, 52, 42, 0.16)',
      transform: `rotate(${rotate}deg)`,
    }}
  >
    <img src={src} style={{ width: 360, height: 360, objectFit: 'cover', display: 'block' }} />
    <p style={{ fontSize: 26, color: muted, margin: '16px 0 0', textAlign: 'center' }}>{caption}</p>
  </div>
);

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 120,
        fontWeight: 900,
        margin: '0 0 24px',
        lineHeight: 1.15,
      }}
    >
      一路順風!
    </h1>
    <p style={{ fontSize: 44, color: 'var(--osd-accent)', fontWeight: 600, margin: '0 0 20px' }}>
      Thượng lộ bình an!
    </p>
    <p style={{ fontSize: 36, color: muted, margin: '0 0 52px' }}>
      路上小心,常回來看看 · Nhớ quay lại thăm nhé
    </p>
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
      <Polaroid src={officeCircle} rotate={-4} caption="剛來的時候 · Ngày mới đến" />
      <Polaroid src={meetingRoom} rotate={2} caption="一起工作的日子 · Ngày làm việc cùng nhau" />
      <Polaroid src={deskTalk} rotate={-2} caption="現在的我們 · Chúng ta bây giờ" />
    </div>
  </div>
);
Closing.transition = settle;

export const meta: SlideMeta = {
  title: '實習生歡送會',
  createdAt: '2026-09-04T09:32:42.549Z',
};

export default [
  Cover,
  Agenda,
  Warmup,
  Recap,
  PhotoWall,
  Stories,
  Sharing,
  Gifts,
  Goodbye,
  Closing,
] satisfies Page[];
