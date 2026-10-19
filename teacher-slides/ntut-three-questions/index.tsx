// 老師版：完整簡報＋Demo＋講稿＋搶答正解。只部署在 Access 保護的 teach.littleyao.me。
import { type Page, type SlideMeta, Step, Steps } from '@open-slide/core';
import { startTeacherBridge } from '../../live/client/bridge.ts';
import type { DeckPage, LiveDeck } from '../../live/client/deck.ts';
import {
  Bubble,
  deck as publicDeck,
  design,
  Frame,
  H,
  meta as contentMeta,
  Note,
  qBetter,
  qWhyNot,
  transition,
} from '../../slides/ntut-three-questions/content.tsx';

// 公開建置(slides.littleyao.me)不得出現的字串；live/scripts/check-public-build.mjs 讀取
export const LEAK_MARKERS = ['Demo：這堂課是怎麼備出來的', '這裡有五個主題候選', '/api/teacher/'];

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

const pages: DeckPage[] = [];
for (const p of publicDeck.pages) {
  pages.push(p);
  if (p.id === 'mcp-agent') pages.push({ id: 'demo', Page: Demo, teacherOnly: true });
}

const __TEACHER_ANSWERS__: Record<string, number> = {
  's2-quiz-warmup-1': 0,
  's2-quiz-warmup-2': 1,
  's2-quiz-warmup-3': 0,
  's2-quiz-warmup-4': 0,
  's2-quiz-review-1': 1,
  's2-quiz-review-2': 2,
  's2-quiz-review-3': 2,
  's2-quiz-review-4': 3,
  's2-quiz-review-5': 1,
};

// 講稿重點，整理自 docs/ntut-ai-course/lesson-plan.md
export const NOTES: Record<string, string> = {
  cover: '開場：今天不教工具，教你怎麼問。主標語先放著，最後回來。',
  agenda: '三節都照「好奇 → 反轉 → 優化」走：思維、關鍵字、討論與應用。',
  's1-poll-hands': '先不評論結果，只說「等一下會回來看這兩題」。投完按下一步看第二題。',
  's1-poll-start': '先不評論，記住大家的學法，案例段會回來對照。',
  past: '回扣第一題：舉手要勇氣，所以過去「敢問」是一種優點。',
  now: '提問從課堂移到「你和 AI 之間」，不用是大 E 人，沒人會笑你。',
  reversal: '勇氣不再是門檻，差距只剩問題的品質。帶出主標語：以前缺的是勇氣，現在缺的是好問題。',
  'good-bad': '好問題會拋磚引玉，壞問題讓人覺得沒內容。',
  three: '三問：為什麼？為什麼不用 X？有沒有更好的方法？',
  why: '好奇心驅動探索，「多問一個為什麼」。',
  'why-not': '反轉與攻防：「很明顯可以用 X，那為什麼不用？」',
  better: '優化思維：好還要更好，不好的被汰換。',
  multiply: '乘法關係：只好奇＝到處看看；只優化＝原地打磨。',
  'case-compare': '我的學法：找一套線上課從頭看到尾；AI 的學法：先做小作品，卡住再查。',
  'case-ask': '示範三問。重點：你有自己的做法，AI 給了你不知道的做法，問題就出現了。',
  'practice-v1': '寫下想學的技能，問 AI「我該怎麼學 ＿＿？」存下來就是 v1，先不要改。',
  's1-poll-better': '等大家投完再公布，下一頁解析。',
  's1-vote-analysis': 'B 好在有背景、有目標，還帶了一個「為什麼」。按一下顯示解析。',
  s2: '這一節本身就是「學新技能」示範：用三問把 AI 關鍵字一個一個問出來。',
  'prompt-context': '先拋問題：同一個 AI 答案差很多，差在哪？再講 Prompt 是指令、Context 是背景。',
  'context-practice': '小練習 4 分鐘：把 v1 補上「我是誰、我會什麼、目標是什麼」，比較回答差在哪。',
  skill: '反轉：每次都重打一長串背景，為什麼不打包？Gemini Gems 已改名 Gemini Skills。',
  'mcp-agent': '優化：問了還要自己查、自己貼，有沒有更好的？MCP 是插座，Agent 自己規劃去做。',
  demo: '展示備課對話：A–E 主題被否決，因為不夠「是我」；順序從工具→思維改成思維→工具。學生畫面這頁顯示「老師正在示範」。',
  s3: '把三問用在自己想學的技能。',
  's3-poll-repeat': '重複問很多次的，就是值得打包成 Skill 的。',
  'main-practice': '拿出 v1，依序問三問，產出 v3。',
  'pair-talk': '交換計畫，用「為什麼不用 X」挑戰對方，選出最佳攻防。',
  'my-skill': '把三問寫成個人 Skill，定稿學習計畫。',
  's3-poll-best': '組別選項當天依分組改(在 content.tsx 的 POLL_BEST)。',
  's3-poll-exit': '出口票。投完發三問卡。',
  closing: '回扣開場：那個沒舉手的你，現在不用勇氣了，只需要好問題。',
  qa: 'QA 10 分鐘。',
};

export const notes = pages.map((p) => NOTES[p.id]);

const fullDeck: LiveDeck = { ...publicDeck, pages };

if (typeof window !== 'undefined') {
  void startTeacherBridge({ deck: fullDeck, answers: __TEACHER_ANSWERS__, notes, apiBase: location.origin });
}

export { design, transition };

export const meta: SlideMeta = { ...contentMeta, title: `${contentMeta.title}(老師版)` };

export default pages.map((p) => p.Page);
