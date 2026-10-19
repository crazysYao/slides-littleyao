import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useSlidePageNumber } from '@open-slide/core';
import type { ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#f2f3f5', text: '#1d2129', accent: '#2f7bf6' },
  fonts: {
    display: '"PingFang TC", "Noto Sans TC", system-ui, sans-serif',
    body: '"PingFang TC", "Noto Sans TC", system-ui, sans-serif',
  },
  typeScale: { hero: 150, body: 40 },
  radius: 28,
};

// 額外色票(DesignSystem 形狀之外)
const muted = '#7a808a';
const panel = '#ffffff';
const line = '#e3e5e8';
const qWhy = '#f59e0b';
const qWhyNot = '#ef4444';
const qBetter = '#10b981';

const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

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
} as const;

const pad = (n: number) => String(n).padStart(2, '0');

// ── 共用元件 ──────────────────────────────────────────

const Frame = ({ section, children }: { section: string; children: ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        ...fill,
        background: 'var(--osd-bg)',
        color: 'var(--osd-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 88,
          flexShrink: 0,
          background: panel,
          borderBottom: `2px solid ${line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 140px',
          fontSize: 26,
          color: muted,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: '#22c55e' }} />
          <span style={{ fontWeight: 700, color: 'var(--osd-text)' }}>提問力</span>
          <span>· {section}</span>
        </div>
        <span>
          {pad(current)} / {pad(total)}
        </span>
      </div>
      <div style={{ flex: 1, padding: '72px 140px 100px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

const H = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: 72,
      fontWeight: 800,
      lineHeight: 1.2,
      margin: 0,
    }}
  >
    {children}
  </h2>
);

const Note = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 'var(--osd-size-body)', lineHeight: 1.5, color: muted, margin: 0 }}>{children}</p>
);

const Pill = ({ color, children }: { color: string; children: ReactNode }) => (
  <span
    style={{
      display: 'inline-block',
      alignSelf: 'flex-start',
      background: color,
      color: '#fff',
      fontSize: 30,
      fontWeight: 700,
      padding: '12px 30px',
      borderRadius: 999,
    }}
  >
    {children}
  </span>
);

const Avatar = () => (
  <div
    style={{
      width: 64,
      height: 64,
      borderRadius: 32,
      flexShrink: 0,
      background: 'var(--osd-text)',
      color: '#fff',
      fontSize: 24,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    AI
  </div>
);

const Bubble = ({ from, tint, children }: { from: 'me' | 'ai'; tint?: string; children: ReactNode }) => {
  const me = from === 'me';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: me ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: 20,
      }}
    >
      {!me && <Avatar />}
      <div
        style={{
          maxWidth: 1240,
          padding: '26px 36px',
          borderRadius: 36,
          borderBottomLeftRadius: me ? 36 : 10,
          borderBottomRightRadius: me ? 10 : 36,
          background: me ? (tint ?? 'var(--osd-accent)') : panel,
          color: me ? '#fff' : 'var(--osd-text)',
          fontSize: 38,
          lineHeight: 1.5,
          boxShadow: me ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Card = ({ color, title, children }: { color: string; title: ReactNode; children: ReactNode }) => (
  <div
    style={{
      flex: 1,
      background: panel,
      borderRadius: 'var(--osd-radius)',
      borderTop: `12px solid ${color}`,
      padding: '44px 48px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    }}
  >
    <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.3, color }}>{title}</div>
    <div style={{ fontSize: 36, lineHeight: 1.55, marginTop: 20 }}>{children}</div>
  </div>
);

const Term = ({ name, children }: { name: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 32 }}>
    <span
      style={{
        fontSize: 40,
        fontWeight: 800,
        color: 'var(--osd-accent)',
        minWidth: 220,
      }}
    >
      {name}
    </span>
    <span style={{ fontSize: 40, lineHeight: 1.5 }}>{children}</span>
  </div>
);

const Option = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      background: panel,
      borderRadius: 20,
      padding: '22px 32px',
      fontSize: 36,
    }}
  >
    <span style={{ fontWeight: 800, color: 'var(--osd-accent)' }}>{label}</span>
    <span>{children}</span>
  </div>
);

const NumRow = ({ color, q, children }: { color: string; q: string; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      background: panel,
      borderRadius: 24,
      padding: '30px 44px',
      borderLeft: `12px solid ${color}`,
    }}
  >
    <span style={{ fontSize: 42, fontWeight: 800, color, minWidth: 420 }}>{q}</span>
    <span style={{ fontSize: 38 }}>{children}</span>
  </div>
);

const Node = ({ children, strong }: { children: ReactNode; strong?: boolean }) => (
  <span
    style={{
      background: strong ? 'var(--osd-accent)' : panel,
      color: strong ? '#fff' : 'var(--osd-text)',
      borderRadius: 16,
      padding: '14px 28px',
      fontSize: 34,
      fontWeight: 700,
    }}
  >
    {children}
  </span>
);

const Arrow = ({ children = '→' }: { children?: string }) => (
  <span style={{ fontSize: 40, color: muted }}>{children}</span>
);

const FlowRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <span style={{ fontSize: 34, fontWeight: 800, minWidth: 300 }}>{label}</span>
    {children}
  </div>
);

const TaskHeader = ({ tag, children }: { tag: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
    <Pill color="var(--osd-text)">{tag}</Pill>
    <H>{children}</H>
  </div>
);

const steps = {
  fontSize: 'var(--osd-size-body)',
  lineHeight: 1.6,
  margin: '56px 0 0',
  paddingLeft: 56,
} as const;

const SectionDivider = ({ no, title, time, sub }: { no: string; title: string; time: string; sub: string }) => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div style={{ fontSize: 160, fontWeight: 900, color: 'var(--osd-accent)', lineHeight: 1 }}>{no}</div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 110,
        fontWeight: 900,
        lineHeight: 1.15,
        margin: '40px 0 24px',
      }}
    >
      {title}
    </h2>
    <div style={{ fontSize: 36, color: muted }}>{time}</div>
    <div style={{ fontSize: 40, marginTop: 48 }}>{sub}</div>
  </div>
);

const InteractPage = ({
  section,
  tool,
  title,
  code,
}: {
  section: string;
  tool: string;
  title: string;
  code: string;
}) => (
  <Frame section={section}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Pill color="var(--osd-accent)">{tool}</Pill>
      <div style={{ fontSize: 120, fontWeight: 900, marginTop: 40 }}>{title}</div>
      <div style={{ fontSize: 40, color: muted, marginTop: 32 }}>{code}</div>
    </div>
  </Frame>
);

const BreakPage = ({ back }: { back: string }) => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-text)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div style={{ fontSize: 140, fontWeight: 900 }}>休息 10 分鐘</div>
    <div style={{ fontSize: 44, color: '#b8bcc4', marginTop: 32 }}>{back} 回來</div>
  </div>
);

// ── 開場 ──────────────────────────────────────────

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div style={{ fontSize: 28, color: muted, letterSpacing: '0.1em' }}>北科大 AI 新秀課 · 2026.11.26</div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        fontWeight: 900,
        lineHeight: 1.1,
        margin: '40px 0',
      }}
    >
      為什麼、為什麼不、
      <br />
      有沒有更好的
    </h1>
    <div style={{ fontSize: 48, fontWeight: 700 }}>AI 時代的提問力</div>
    <div style={{ display: 'flex', gap: 24, marginTop: 64 }}>
      <Pill color={qWhy}>為什麼？</Pill>
      <Pill color={qWhyNot}>為什麼不用 X？</Pill>
      <Pill color={qBetter}>有沒有更好的方法？</Pill>
    </div>
  </div>
);
Cover.transition = settle;

const AgendaRow = ({ no, title, time, desc }: { no: string; title: string; time: string; desc: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 48, background: panel, borderRadius: 24, padding: '32px 48px' }}>
    <span style={{ fontSize: 64, fontWeight: 900, color: 'var(--osd-accent)' }}>{no}</span>
    <div>
      <div style={{ fontSize: 48, fontWeight: 800 }}>
        {title}
        <span style={{ fontSize: 30, fontWeight: 400, color: muted, marginLeft: 24 }}>{time}</span>
      </div>
      <div style={{ fontSize: 34, color: muted, marginTop: 8 }}>{desc}</div>
    </div>
  </div>
);

const Agenda: Page = () => (
  <Frame section="今天的課">
    <H>今天的三節課</H>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 56 }}>
      <AgendaRow no="01" title="思維：三個問題" time="09:00–09:50" desc="好奇 → 反轉攻防 → 優化" />
      <AgendaRow no="02" title="關鍵字：用三問學 AI" time="10:00–10:55" desc="Prompt / Context / Skill / MCP / Agent" />
      <AgendaRow no="03" title="討論與應用" time="11:05–12:00" desc="把三問用在你自己想學的技能" />
    </div>
  </Frame>
);

// ── 第一節：思維 ──────────────────────────────────────────

const S1: Page = () => (
  <SectionDivider no="01" title="思維：三個問題" time="09:00–09:50" sub="先不談工具，先談你怎麼問" />
);

const S1Poll: Page = () => (
  <Frame section="01 思維">
    <Pill color="var(--osd-accent)">Slido 投票</Pill>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, marginTop: 48 }}>
      <div>
        <H>上課時，你有過有問題卻沒舉手的經驗嗎？</H>
        <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
          <Option label="A">有</Option>
          <Option label="B">沒有</Option>
          <Option label="C">常常</Option>
        </div>
      </div>
      <div>
        <H>學一個新技能，你通常怎麼開始？</H>
        <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
          <Option label="A">找線上課從頭看</Option>
          <Option label="B">先動手做</Option>
          <Option label="C">問人</Option>
          <Option label="D">問 AI</Option>
        </div>
      </div>
    </div>
  </Frame>
);

const Past: Page = () => (
  <Frame section="01 思維">
    <H>以前：提問發生在課堂上</H>
    <ul style={steps}>
      <li>全班都看著你舉手</li>
      <li>怕問題太簡單、怕被笑</li>
      <li>所以「敢問」是一種優點</li>
    </ul>
  </Frame>
);

const Now: Page = () => (
  <Frame section="01 思維">
    <H>現在：提問發生在你和 AI 之間</H>
    <div style={{ marginTop: 56 }}>
      <Steps>
        <Step>
          <Bubble from="me">這個問題會不會很白癡？</Bubble>
        </Step>
        <Step>
          <div style={{ marginTop: 28 }}>
            <Bubble from="ai">不會。我們一起拆解看看。</Bubble>
          </div>
        </Step>
        <Step>
          <div style={{ marginTop: 64 }}>
            <Note>不用是大 E 人，也沒有人會笑你。</Note>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Reversal: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
      fontFamily: 'var(--osd-font-display)',
      fontSize: 110,
      fontWeight: 900,
      lineHeight: 1.3,
    }}
  >
    <Steps>
      <div style={{ color: muted }}>以前缺的是勇氣，</div>
      <Step>
        <div>
          現在缺的是<span style={{ color: 'var(--osd-accent)' }}>好問題</span>。
        </div>
      </Step>
    </Steps>
  </div>
);
Reversal.transition = settle;

const GoodBad: Page = () => (
  <Frame section="01 思維">
    <H>好問題 vs 壞問題</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
      <Card color={qBetter} title="好問題">
        拋磚引玉，讓討論往下走
      </Card>
      <Card color={qWhyNot} title="壞問題">
        讓人覺得沒內容，對話就停了
      </Card>
    </div>
    <div style={{ marginTop: 64 }}>
      <Note>差距在於：你會不會判斷什麼是好問題。</Note>
    </div>
  </Frame>
);

const Three: Page = () => (
  <Frame section="01 思維">
    <H>好問題，來自三個問法</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 64 }}>
      <Card color={qWhy} title="為什麼？">
        好奇心
        <br />
        驅動你不斷探索
      </Card>
      <Card color={qWhyNot} title="為什麼不用 X？">
        反轉攻防
        <br />
        挑戰理所當然
      </Card>
      <Card color={qBetter} title="有沒有更好的方法？">
        優化思維
        <br />
        好還要更好
      </Card>
    </div>
  </Frame>
);

const QDetail = ({
  color,
  tag,
  q,
  ai,
  me,
  note,
}: {
  color: string;
  tag: string;
  q: string;
  ai: string;
  me: string;
  note: string;
}) => (
  <Frame section="01 思維">
    <Pill color={color}>{tag}</Pill>
    <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.15, marginTop: 24, color }}>{q}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 48 }}>
      <Bubble from="ai">{ai}</Bubble>
      <Bubble from="me" tint={color}>
        {me}
      </Bubble>
    </div>
    <div style={{ marginTop: 48 }}>
      <Note>{note}</Note>
    </div>
  </Frame>
);

const Why: Page = () => (
  <QDetail
    color={qWhy}
    tag="第一問 · 好奇心"
    q="為什麼？"
    ai="建議你先做一個小作品。"
    me="為什麼？先做有什麼好處？"
    note="多問一個為什麼，答案就從「結論」變成「理由」。"
  />
);

const WhyNot: Page = () => (
  <QDetail
    color={qWhyNot}
    tag="第二問 · 反轉攻防"
    q="為什麼不用 X？"
    ai="這份報表可以用 Excel 函數完成。"
    me="很明顯可以用 Python 自動化，那為什麼不用？"
    note="反轉一下，逼出取捨與限制。"
  />
);

const Better: Page = () => (
  <QDetail
    color={qBetter}
    tag="第三問 · 優化思維"
    q="有沒有更好的方法？"
    ai="這是一份三個月的學習計畫。"
    me="有沒有更好的方法？幫我找出最弱的地方。"
    note="好的再更好，不好的就汰換。"
  />
);

const Multiply: Page = () => (
  <Frame section="01 思維">
    <H>好奇心 × 優化思維</H>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 64 }}>
      <Steps>
        <Step>
          <NumRow color={qWhy} q="只好奇，不優化">
            到處看看
          </NumRow>
        </Step>
        <Step>
          <NumRow color={qBetter} q="只優化，不好奇">
            原地打磨
          </NumRow>
        </Step>
        <Step>
          <NumRow color="var(--osd-accent)" q="兩個相乘">
            越問越深，越做越好
          </NumRow>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const CaseCompare: Page = () => (
  <Frame section="01 思維">
    <H>案例：學一個新技能</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
      <Card color={muted} title="我的學法">
        找一套線上課，從頭看到尾
      </Card>
      <Card color="var(--osd-accent)" title="AI 的學法">
        先做一個小作品，卡住再查
      </Card>
    </div>
    <div style={{ marginTop: 64 }}>
      <Note>你有自己的做法，AI 給了你不知道的做法，問題就出現了。</Note>
    </div>
  </Frame>
);

const CaseAsk: Page = () => (
  <Frame section="01 思維">
    <H>這時候，三問就派上用場</H>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 48 }}>
      <Bubble from="ai">建議你先做一個小作品，卡住再查。</Bubble>
      <Steps>
        <Step>
          <Bubble from="me" tint={qWhy}>
            為什麼要先做？
          </Bubble>
        </Step>
        <Step>
          <Bubble from="me" tint={qWhyNot}>
            為什麼不先看完課？
          </Bubble>
        </Step>
        <Step>
          <Bubble from="me" tint={qBetter}>
            有沒有更快的學法？
          </Bubble>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const PracticeV1: Page = () => (
  <Frame section="01 思維">
    <TaskHeader tag="實作 · 8 分鐘">你的學習計畫 v1</TaskHeader>
    <ol style={steps}>
      <li>寫下一個你想學的技能</li>
      <li>問 AI：「我該怎麼學 ＿＿？」</li>
      <li>把回答存起來，這就是 v1</li>
      <li>先不要改，第三節會回來升級</li>
    </ol>
  </Frame>
);

const S1Vote: Page = () => (
  <Frame section="01 思維">
    <Pill color="var(--osd-accent)">Slido 投票</Pill>
    <div style={{ marginTop: 28 }}>
      <H>哪個問法比較好？</H>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 48 }}>
      <Bubble from="me">A：怎麼學 Python？</Bubble>
      <Bubble from="me">B：我會 Excel，想三個月內做出自動化報表。為什麼你建議先做小作品，而不是先看課？</Bubble>
    </div>
    <div style={{ marginTop: 48 }}>
      <Steps>
        <Step>
          <Note>B 好在：有背景、有目標，還帶了一個「為什麼」。</Note>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Break1: Page = () => <BreakPage back="10:00" />;

// ── 第二節：關鍵字 ──────────────────────────────────────────

const S2: Page = () => (
  <SectionDivider no="02" title="關鍵字：用三問學 AI" time="10:00–10:55" sub="這一節，就是一次「學新技能」的示範" />
);

const Warmup: Page = () => (
  <InteractPage section="02 關鍵字" tool="Wayground 搶答" title="暖身搶答" code="4 題 · 加入代碼：＿＿＿＿" />
);

const PromptContext: Page = () => (
  <Frame section="02 關鍵字">
    <Pill color={qWhy}>為什麼？</Pill>
    <div style={{ marginTop: 28 }}>
      <H>為什麼同一個 AI，有人問得出好答案？</H>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 64 }}>
      <Term name="Prompt">你給 AI 的指令</Term>
      <Term name="Context">你給 AI 的背景</Term>
    </div>
    <div style={{ marginTop: 64 }}>
      <Note>問題講得越清楚，答案就越好。</Note>
    </div>
  </Frame>
);

const ContextPractice: Page = () => (
  <Frame section="02 關鍵字">
    <TaskHeader tag="小練習 · 4 分鐘">幫 v1 補上背景</TaskHeader>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 48 }}>
      <Bubble from="me" tint={muted}>
        我該怎麼學 Python？
      </Bubble>
      <Steps>
        <Step>
          <Bubble from="me">我是剛畢業的商管系學生，會 Excel，想三個月內做出自動化報表。我該怎麼學 Python？</Bubble>
        </Step>
      </Steps>
    </div>
    <div style={{ marginTop: 48 }}>
      <Note>補上三件事：我是誰、我會什麼、目標是什麼。</Note>
    </div>
  </Frame>
);

const SkillPage: Page = () => (
  <Frame section="02 關鍵字">
    <Pill color={qWhyNot}>為什麼不只靠 Prompt？</Pill>
    <div style={{ marginTop: 28 }}>
      <H>每次重打一長串背景，為什麼不打包起來？</H>
    </div>
    <div style={{ marginTop: 64 }}>
      <Term name="Skill">把一套好問法，打包成可重複用的能力</Term>
    </div>
    <ul style={steps}>
      <li>同一類問題重複問，就該打包</li>
      <li>下次一句話就能叫出來</li>
    </ul>
    <div style={{ marginTop: 'auto' }}>
      <p style={{ fontSize: 28, color: muted, margin: 0 }}>
        補充：Gemini 的 Gems 預計 11/17 改名為 Gemini Skills
      </p>
    </div>
  </Frame>
);

const McpAgent: Page = () => (
  <Frame section="02 關鍵字">
    <Pill color={qBetter}>有沒有更好的方法？</Pill>
    <div style={{ marginTop: 28 }}>
      <H>問完還要自己查、自己貼？</H>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 56 }}>
      <FlowRow label="Prompt">
        <Node>你</Node>
        <Arrow />
        <Node strong>AI</Node>
      </FlowRow>
      <FlowRow label="Skill">
        <Node>你</Node>
        <Arrow />
        <Node>打包好的問法</Node>
        <Arrow />
        <Node strong>AI</Node>
      </FlowRow>
      <FlowRow label="MCP / Agent">
        <Node>你</Node>
        <Arrow />
        <Node strong>AI</Node>
        <Arrow>⇄</Arrow>
        <Node>工具與資料</Node>
      </FlowRow>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 56 }}>
      <Term name="MCP">讓 AI 接上外部工具和資料的插座</Term>
      <Term name="Agent">讓 AI 自己規劃步驟、自己去做</Term>
    </div>
  </Frame>
);

const Demo: Page = () => (
  <Frame section="02 關鍵字">
    <H>Demo：這堂課是怎麼備出來的</H>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 44 }}>
      <Steps>
        <Step>
          <Bubble from="ai">這裡有五個主題候選，A 到 E。</Bubble>
        </Step>
        <Step>
          <Bubble from="me" tint={qWhyNot}>
            都不夠「是我」。為什麼不先挖我的觀點？
          </Bubble>
        </Step>
        <Step>
          <Bubble from="ai">建議先講關鍵字，再講思維。</Bubble>
        </Step>
        <Step>
          <Bubble from="me" tint={qBetter}>
            有沒有更好的順序？先講思維，開場才是我。
          </Bubble>
        </Step>
      </Steps>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <Note>AI 用 memory 記住上次討論到哪，下次直接接續。</Note>
    </div>
  </Frame>
);

const Review: Page = () => (
  <InteractPage section="02 關鍵字" tool="Wayground 搶答" title="關鍵字複習" code="5 題 · 加入代碼：＿＿＿＿" />
);

const Break2: Page = () => <BreakPage back="11:05" />;

// ── 第三節:討論與應用 ──────────────────────────────────────────

const S3: Page = () => (
  <SectionDivider no="03" title="討論與應用" time="11:05–12:00" sub="把三問用在你自己想學的技能" />
);

const S3Poll: Page = () => (
  <Frame section="03 討論與應用">
    <Pill color="var(--osd-accent)">Slido 投票</Pill>
    <div style={{ marginTop: 28 }}>
      <H>同一類問題，你重複問過 AI 幾次？</H>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 56, alignItems: 'flex-start' }}>
      <Option label="A">1 次</Option>
      <Option label="B">2–5 次</Option>
      <Option label="C">5 次以上</Option>
      <Option label="D">沒注意過</Option>
    </div>
  </Frame>
);

const MainPractice: Page = () => (
  <Frame section="03 討論與應用">
    <TaskHeader tag="主實作 · 15 分鐘">v1 → v3：用三問跟 AI 攻防</TaskHeader>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 56 }}>
      <NumRow color={qWhy} q="為什麼？">
        追問 AI 建議背後的理由
      </NumRow>
      <NumRow color={qWhyNot} q="為什麼不用 X？">
        拿你原本的學法挑戰 AI
      </NumRow>
      <NumRow color={qBetter} q="有沒有更好的方法？">
        要 AI 自我批判、給第二版
      </NumRow>
    </div>
  </Frame>
);

const PairTalk: Page = () => (
  <Frame section="03 討論與應用">
    <TaskHeader tag="兩兩討論 · 10 分鐘">互相挑戰對方的計畫</TaskHeader>
    <ol style={steps}>
      <li>交換你們的學習計畫</li>
      <li>用「為什麼不用 X？」挑戰對方</li>
      <li>選出一個「最佳攻防」</li>
      <li>準備給全班投票</li>
    </ol>
  </Frame>
);

const MySkill: Page = () => (
  <Frame section="03 討論與應用">
    <TaskHeader tag="實作 · 10 分鐘">把三問寫成你的個人 Skill</TaskHeader>
    <div
      style={{
        marginTop: 48,
        background: 'var(--osd-text)',
        color: '#f2f3f5',
        borderRadius: 'var(--osd-radius)',
        padding: '44px 56px',
        fontSize: 36,
        lineHeight: 1.6,
      }}
    >
      <div>我想學 ＿＿。我的背景是 ＿＿，目標是 ＿＿。</div>
      <div>
        每次給建議時，請說明<span style={{ color: qWhy }}>為什麼</span>；
      </div>
      <div>
        列出一個常見替代做法，說明<span style={{ color: qWhyNot }}>為什麼不選它</span>；
      </div>
      <div>
        最後告訴我<span style={{ color: qBetter }}>有沒有更好的方法</span>。
      </div>
    </div>
  </Frame>
);

const ExitVote: Page = () => (
  <Frame section="03 討論與應用">
    <Pill color="var(--osd-accent)">Slido 投票</Pill>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64, marginTop: 48 }}>
      <H>選出今天的「最佳攻防」</H>
      <div>
        <H>出口票：今天你最記得哪一問？</H>
        <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
          <Pill color={qWhy}>為什麼？</Pill>
          <Pill color={qWhyNot}>為什麼不用 X？</Pill>
          <Pill color={qBetter}>有沒有更好的方法？</Pill>
        </div>
      </div>
    </div>
  </Frame>
);

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 160px',
    }}
  >
    <div style={{ fontSize: 36, color: muted }}>還記得開場那一題嗎？</div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 96,
        fontWeight: 900,
        lineHeight: 1.3,
        marginTop: 40,
      }}
    >
      <Steps>
        <div>那個沒舉手的你，</div>
        <Step>
          <div>
            現在不用勇氣了，只需要<span style={{ color: 'var(--osd-accent)' }}>好問題</span>。
          </div>
        </Step>
      </Steps>
    </div>
    <div style={{ display: 'flex', gap: 24, marginTop: 72 }}>
      <Pill color={qWhy}>為什麼？</Pill>
      <Pill color={qWhyNot}>為什麼不用 X？</Pill>
      <Pill color={qBetter}>有沒有更好的方法？</Pill>
    </div>
  </div>
);
Closing.transition = settle;

const QA: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-text)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div style={{ fontSize: 'var(--osd-size-hero)', fontWeight: 900 }}>Q &amp; A</div>
    <div style={{ fontSize: 48, color: '#b8bcc4', marginTop: 32 }}>現在，換你問了。</div>
  </div>
);
QA.transition = settle;

export const meta: SlideMeta = {
  title: '為什麼、為什麼不、有沒有更好的：AI 時代的提問力',
  createdAt: '2026-10-19T04:55:02.428Z',
};

export default [
  Cover,
  Agenda,
  S1,
  S1Poll,
  Past,
  Now,
  Reversal,
  GoodBad,
  Three,
  Why,
  WhyNot,
  Better,
  Multiply,
  CaseCompare,
  CaseAsk,
  PracticeV1,
  S1Vote,
  Break1,
  S2,
  Warmup,
  PromptContext,
  ContextPractice,
  SkillPage,
  McpAgent,
  Demo,
  Review,
  Break2,
  S3,
  S3Poll,
  MainPractice,
  PairTalk,
  MySkill,
  ExitVote,
  Closing,
  QA,
] satisfies Page[];
