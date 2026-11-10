// 主題候選 F「讓 AI 一開口就懂你」的簡報內容：每頁文字、講稿、投票與搶答。版面共用 build-deck.mjs。
// 產生：node build-deck.mjs <輸出路徑> topic-f-content.mjs
// 教案見 ../topic-f-agent-knowledge-resume.md

import { readFileSync } from 'node:fs';

export const brand = '讓 AI 一開口就懂你';

const VAULT_URL = 'https://github.com/crazysYao/slides-littleyao/raw/main/docs/ntut-ai-course/topic-f-vault/knowledge-vault-template.zip';

const YELLOW = '#f5b400';
const INK = '#16161a';

// 黃黑求職風(參考 Pinterest「簡報設計」的日系招募簡報)：黃色只當填色，上面一律放黑字
export const palette = {
  bg: '#fbfaf7',
  text: INK,
  accent: YELLOW,
  muted: '#62646b',
  line: '#ebe7de',
  why: YELLOW,
  whyNot: INK,
  better: YELLOW,
  dark: INK,
  darkSub: '#c9c6bd',
  ink: { [YELLOW]: INK },
  hue: { [YELLOW]: INK },
  bgFor: { cover: YELLOW, divider: YELLOW },
  dot: YELLOW,
  titleBar: YELLOW,
  mark: YELLOW,
};

const PILLS = [
  ['text', '知識庫'],
  ['text', 'Agent'],
  ['text', '個人網站'],
];

const LOOP = {
  layout: 'loop',
  heading: '問題迴圈：講得越具體，改得越好',
  start: '發現問題',
  steps: [
    ['① 具體描述', '現在的狀況＋感受'],
    ['② 執行', '交給 AI 動手'],
    ['③ 驗證', '結果對不對？'],
    ['↺ 優化', '把落差講得更具體'],
  ],
  center: '一輪不夠\n就再跑一輪',
  cardsTitle: '《青之蘆葦》葦人的兩個階段',
  cards: [
    ['選拔面試', '講不太出來，還是硬把自己進球的過程講給福田聽 → 講出來，才被看見'],
    ['升上 A 隊', '「言語化的次元不一樣！」→ 講得越細，進步越快'],
  ],
  compareTitle: '今天的網站',
  compare: ['「不好看」→ 改不動', '「標題太小、第一眼看不出我會什麼」→ AI 改得動'],
};

// 「這個網頁怎麼用」三張示意圖(220×120)：模擬學員畫面上的樣子
const LINE = '#ebe7de';
const BLUE = '#2f7bf6';
const PIC_REVIEW = `<rect x="1" y="1" width="218" height="78" rx="8" fill="#fbfaf7" stroke="${LINE}" stroke-width="2"/>
<rect x="16" y="16" width="110" height="10" rx="5" fill="${INK}"/><rect x="16" y="36" width="150" height="7" rx="3.5" fill="${LINE}"/><rect x="16" y="50" width="120" height="7" rx="3.5" fill="${LINE}"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="${12 + i * 42}" y="94" width="34" height="22" rx="4" fill="${i < 3 ? (i === 2 ? YELLOW : '#fff') : '#fff'}" stroke="${i < 3 ? INK : LINE}" stroke-width="2" ${i > 2 ? 'stroke-dasharray="4 3"' : ''}/>`).join('')}
<path d="M113 91 C113 81 29 81 29 89" stroke="${INK}" stroke-width="2.5" fill="none"/><path d="M24 85 L29 91 L34 85" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<text x="200" y="66" font-size="11" fill="#62646b" text-anchor="end">講過的可回看</text>`;
const PIC_LINK = `<rect x="1" y="2" width="218" height="50" rx="8" fill="${BLUE}"/>
<rect x="16" y="16" width="96" height="9" rx="4.5" fill="#fff"/><rect x="16" y="32" width="130" height="6" rx="3" fill="#fff" opacity="0.6"/>
<path d="M186 34 L200 20 M190 20 L200 20 L200 30" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="1" y="66" width="218" height="50" rx="8" fill="#fff" stroke="${LINE}" stroke-width="2"/>
<rect x="14" y="78" width="26" height="26" rx="5" fill="${YELLOW}"/><text x="27" y="95" font-size="9" font-weight="bold" fill="${INK}" text-anchor="middle">ZIP</text>
<rect x="50" y="82" width="90" height="8" rx="4" fill="${INK}"/><rect x="50" y="96" width="56" height="6" rx="3" fill="${LINE}"/>
<path d="M193 79 L193 97 M185 90 L193 98 L201 90 M183 104 L203 104" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const PIC_VOTE = `<rect x="1" y="1" width="218" height="46" rx="8" fill="#fff" stroke="${LINE}" stroke-width="2"/>
<rect x="14" y="14" width="110" height="7" rx="3.5" fill="${LINE}"/><rect x="14" y="27" width="84" height="7" rx="3.5" fill="${LINE}"/>
<rect x="160" y="12" width="48" height="24" rx="6" fill="${INK}"/><text x="184" y="28" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">複製</text>
<rect x="1" y="58" width="218" height="26" rx="13" fill="${YELLOW}"/><text x="20" y="75" font-size="11" font-weight="bold" fill="${INK}">這在講我</text>
<path d="M190 71 L196 77 L206 66" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="1" y="92" width="218" height="26" rx="13" fill="#fff" stroke="${LINE}" stroke-width="2"/><text x="20" y="109" font-size="11" fill="${INK}">不是我</text>`;

// 09:45 翻轉題的示意圖(820×390)：兩個網站、屋頂被吹走
const browser = (x, label, body) => `<text x="${x}" y="22" font-size="20" font-weight="bold" fill="${INK}">${label}</text>
<g transform="translate(${x} 34)"><rect width="390" height="340" rx="10" fill="#fff" stroke="${LINE}" stroke-width="2"/><circle cx="16" cy="14" r="4" fill="${LINE}"/><circle cx="30" cy="14" r="4" fill="${LINE}"/><circle cx="44" cy="14" r="4" fill="${LINE}"/>${body}</g>`;
const PIC_SITES = browser(0, 'A', `<rect x="1" y="28" width="388" height="311" fill="#f4f4f1"/>
<text x="30" y="60" font-size="11" letter-spacing="3" fill="#8b8b86">STUDIO</text><text x="360" y="60" font-size="11" letter-spacing="3" fill="#8b8b86" text-anchor="end">ABOUT  WORKS</text>
<rect x="30" y="80" width="330" height="150" fill="#c9c9c4"/><path d="M30 230 L170 120 L250 180 L300 145 L360 200 L360 230Z" fill="#8b8b86"/>
<text x="30" y="290" font-size="27" font-weight="300" letter-spacing="5" font-family="serif" fill="#2a2a2a">流動的居住哲學</text>`)
  + browser(430, 'B', `<rect x="1" y="28" width="388" height="311" fill="#ffd400"/>
<text x="195" y="135" font-size="60" font-weight="900" fill="#d0121b" text-anchor="middle">24H 服務</text>
<text x="195" y="205" font-size="38" font-weight="bold" fill="${INK}" text-anchor="middle">0912-345-678</text>
<text x="195" y="275" font-size="42" font-weight="900" fill="#d0121b" text-anchor="middle">半小時到</text>`);
const ROOF_PHOTO = readFileSync(new URL('./assets/roof-home.jpg', import.meta.url)).toString('base64');
const PIC_ROOF = `<image width="820" height="390" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${ROOF_PHOTO}"/>`;

const CONFIDENCE = {
  layout: 'scale',
  section: '開始之前',
  question: '你有幾分把握，讓 AI 一次寫出像你的自我介紹？',
  min: 1,
  max: 10,
  labelLeft: '完全沒把握',
  labelRight: '很有把握',
};

export const pages = [
  {
    id: 'cover',
    layout: 'cover',
    title: '封面',
    notes: '開場：今天下課，你會帶走一個自己的個人網站。',
    date: '北科大 AI 新秀課 · 2026.11.26',
    heading: '讓 AI 一開口就懂你',
    subtitle: '建一個個人知識庫 → 讓 Agent 做出你的網站',
    pills: PILLS,
  },
  {
    id: 's1-poll-agent',
    layout: 'poll',
    section: '開始之前',
    title: '投票：有在用 Agent 嗎',
    notes: '09:00 投票(1)。第一題順便確認大家都進得來，加入碼 AIJ3FPVG。只用過 ChatGPT 的選「沒有」。「沒有」居多：今天會講慢一點，只看也沒關係。有不少人選「有」：請他們舉手，等一下卡關可以問旁邊的人。',
    question: '你有在用 Claude Code、Codex 這類會自己動手的 AI 嗎？',
    options: ['有', '沒有'],
  },
  {
    ...CONFIDENCE,
    id: 's1-scale-before',
    title: '量表：開場',
    notes: '09:00 投票後接著量(30 秒，和投票共用這 1 分鐘)。「沒有標準答案，憑感覺選。下課前會再量一次同一題。」不評論分數，記下平均就好。',
  },
  {
    id: 's1-goal',
    layout: 'goal',
    section: '開始之前',
    title: '終點長這樣',
    notes: '09:01 先秀終點(3)。左邊打開 hi.littleyao.me/zh，右邊打開課前用今天流程重做的單頁版。不要說左邊是用今天的流程做的。右邊的單頁版做好後，改成連結。',
    heading: '終點長這樣',
    link: ['https://hi.littleyao.me/zh', '講師的網站', '之後可以一直長大的樣子'],
    card: ['better', '今天的版本', '3 小時做得到的單頁網站'],
    note: '今天的目標是右邊；左邊是之後可以繼續長的方向。',
  },
  {
    id: 'blueprint',
    layout: 'blueprint',
    section: '今天的藍圖',
    title: '今天的藍圖',
    notes: '開場藍圖：資料從你身上流進知識庫，Agent 讀筆記做出網站，再驗證、優化。主角是知識庫和 Agent(黃色)。上方是三節。',
    heading: '今天要做的事：一張圖',
    sections: [
      ['01 發現問題，具體描述', '09:00–09:50', 0, 1],
      ['02 執行', '10:00–10:55', 2, 3],
      ['03 驗證與優化', '11:05–12:00', 4, 4],
    ],
    nodes: [
      ['你的經歷', '作業、專題\n打工、社團'],
      ['知識庫', 'Obsidian\n五個資料夾', 'key'],
      ['Agent', 'Claude Code\n任何 Agent 都行', 'key'],
      ['個人網站', 'site/\nindex.html'],
      ['v2 → v3', '讀者審稿\n第一直覺'],
    ],
    arrows: ['寫筆記', '讀筆記', '寫出', '驗證'],
    loop: '↺ 不滿意就把落差講具體，再跑一輪',
    note: '網站是練習題，迴圈才是你帶走的方法。',
  },

  // ── 第一節 ──
  {
    id: 's1-synora',
    layout: 'steps',
    section: '開始之前',
    title: '這個網頁怎麼用',
    notes: '開場先教 Synora 學員畫面怎麼用：今天的下載連結、複製卡片、投票都在這裡。加入碼 AIJ3FPVG。講過的頁面可以自己切回去看。',
    heading: '這個網頁怎麼用？',
    items: [
      ['自由回看', '可以自由切換到\n已經講過的頁面', PIC_REVIEW],
      ['點連結、下載', '藍色卡片點了就開\n下載卡拿檔案', PIC_LINK],
      ['複製、投票', '複製卡片點一下\n選項直接點', PIC_VOTE],
    ],
  },
  {
    id: 's1-join',
    layout: 'compare',
    section: '開始之前',
    title: '今天怎麼參與',
    notes: '09:04 今天怎麼參與(1)。不強迫實作：講師用自己付費的 Claude Code 把整個流程跑一遍，只聽也能帶走迴圈。想跟著做的人，用自己的 Agent 就行，Codex、Cursor 都可以；沒有付費的，裝免費的 OpenCode Desktop。',
    heading: '今天怎麼參與？',
    cards: [
      ['accent', '只想看', '講師用 Claude Code\n把整個流程跑一遍\n看懂迴圈就值得'],
      ['accent', '想跟著做', '用你自己的 Agent\nCodex、Cursor 都可以\n沒有付費的，裝免費的 OpenCode'],
    ],
    note: '不強迫實作；每個「可跟做」的步驟，跟不上就先看講師的畫面。',
  },
  {
    id: 's1-install',
    section: '開始之前',
    title: '安裝：想跟著做再裝',
    notes: '09:05 先按下載(1)。想跟著做的人才需要裝。Obsidian 必裝；Agent 挑一個：已經有 Claude Code、Codex、Cursor 的人用手上的，沒有付費的裝免費的 OpenCode Desktop。下載完就能裝，來不及的休息時裝。',
    layout: 'iconLinks',
    tag: '安裝 · 選配',
    heading: '想跟著做？先按下載',
    links: [
      [
        ['📝', 'https://obsidian.md/download', 'Obsidian', '放資料的地方，必裝、不用註冊'],
        ['🤖', 'https://opencode.ai/download', 'OpenCode Desktop', '沒有付費 Agent 的人裝這個，免費'],
      ],
    ],
    dark: ['💡', '已經有 Claude Code、Codex、Cursor？用手上的就好', '一個放資料，一個幫你動手；Agent 不用再裝'],
  },
  {
    id: 's1-install-os',
    layout: 'compare',
    section: '開始之前',
    title: '下載：Mac／Windows 選哪個',
    notes: 'Mac 看晶片；Windows 一般選 x64，ARM 機種才選 ARM64。每個工具的下載頁都一樣。按完下載就回來聽。',
    heading: '下載哪個版本？',
    cards: [
      ['accent', 'Mac', '蘋果選單 →「關於這台 Mac」\nApple M 系列選 Apple Silicon\n下載 .dmg，拖進「應用程式」'],
      ['accent', 'Windows', '一般筆電選 x64\n跳出藍色警告：「其他資訊」\n→「仍要執行」'],
    ],
    note: '下載完就能裝，來不及也沒關係，休息時再裝。我們先來看一個問題。',
  },
  {
    id: 's1',
    layout: 'divider',
    title: '第一節：發現問題，具體描述',
    notes: '09:00–09:50。',
    no: '01',
    heading: '發現問題，具體描述',
    time: '09:00–09:50',
    sub: 'AI 寫的，真的在講你嗎？\n收穫：知識庫 v1',
  },
  {
    id: 's1-problem-cloud',
    layout: 'wordcloud',
    section: '01 發現問題',
    title: '文字雲：猜 AI 會怎麼形容你',
    notes: '09:06 發現問題(3)。文字雲約 1 分鐘：「AI 還沒開始寫。請你猜，它幫你寫自我介紹，會用哪個詞形容你？」大家送出後先不評論，下一頁直接現場打。',
    question: '猜猜看：AI 幫你寫自我介紹，會用哪個詞形容你？',
    maxWords: 1,
  },
  {
    id: 's1-problem',
    layout: 'bigPrompt',
    section: '01 發現問題',
    title: '發現問題：幫我寫自我介紹',
    notes: '現場示範約 2 分鐘。切到 AI 畫面，只打「幫我寫自我介紹」，不給任何資料。唸出結果，唸到文字雲上有的詞就停一下。\n收尾：「我還沒打，你們已經幫它寫完了。」\nAI 回範本或先問資料時：「它連你叫什麼都不知道。」\n現場出狀況就放事先產生的結果截圖。',
    caption: '你們剛剛猜的詞，會中幾個？',
    prompt: '幫我寫自我介紹',
  },
  {
    id: 's1-problem-reveal',
    layout: 'reveal',
    section: '01 發現問題',
    title: '揭曉：空泛是我造成的',
    notes: '先口頭問「問題出在誰？AI 不夠強嗎？」再翻到這頁。收尾：覺得哪裡怪怪的，就是發現問題，接下一頁迴圈。',
    ask: '問題出在誰？',
    lead: 'AI 的空泛，',
    punch: '是我造成的',
    sub: '它不認識你，因為你什麼都沒說',
  },
  {
    ...LOOP,
    core: true,
    id: 's1-loop-core',
    section: '01 發現問題',
    title: '問題迴圈',
    notes: '09:09 問題迴圈(7)，這頁只放迴圈。\n0:00–0:40 回到剛剛的自我介紹：問題不是 AI 爛，是我們講得不夠具體，這就是發現問題。\n0:40–2:00 沿著圖走一圈：具體描述 → 執行 → 驗證 → 優化；第一節在具體描述、第二節在執行、第三節在驗證與優化。',
  },
  {
    ...LOOP,
    id: 's1-loop',
    section: '01 發現問題',
    title: '問題迴圈：兩個例子',
    notes: '問題迴圈第二頁(2:00–7:00)。\n2:00–3:10 例子：回媽媽，對應具體描述。講成「你們一定遇過」，語氣是一起自嘲。AI 回答是示意，上台前實跑一次，用實際結果。\n「媽媽問你工作找得怎樣，你請 AI 幫你回。只打一句：幫我回我媽，她問我工作找得怎樣。AI 說：親愛的媽媽，感謝您的關心，我會繼續努力。」(停一下等笑)「你媽會以為你被盜帳號。」\n「換個講法：我媽其實是擔心我，但她只要提到表哥在台積電，我就會爆炸。回一句讓她安心，又不會再提表哥。AI 說：媽，我這週有兩間在談，有結果第一個跟妳說。表哥的薪水就先不要幫我算了。」\n收：同一個 AI，差別只在你有沒有把狀況講出來。\n3:10–4:40 青之蘆葦①：(片段待補，30 秒內)選拔最後，葦人講不好，還是把自己怎麼進球講給福田聽，因此被看見。對應具體描述。\n4:40–5:40 青之蘆葦②：(片段待補，30 秒內)升上 A 隊才發現「言語化的次元不一樣」，每一輪講得更細，就前進一階。對應優化。\n5:40–7:00 右下對照：「不好看」vs「標題太小、看不出我會什麼」。寫履歷、準備面試也是同一個迴圈。',
  },
  {
    id: 's1-obsidian',
    section: '01 發現問題',
    title: '介紹 Obsidian',
    notes: '09:16 介紹 Obsidian(3)。講到 🔗 可切講師 vault 秀關係圖 5 秒；最後扣回：這就是迴圈裡「具體描述」的倉庫。重點是最後一點：檔案在自己電腦、任何 AI 都讀得懂，資料主控權在自己手上。',
    layout: 'iconSplit',
    kicker: '認識工具',
    heading: 'Obsidian',
    tagline: '把你寫下的東西，\n變成 AI 讀得懂的資料',
    cards: [
      ['💻', '免費、跨平台', 'Mac、Windows、手機都能用'],
      ['📄', '一則筆記 = 一個 .md 檔', '純文字，存在你自己的電腦'],
      ['🔗', '筆記可以互相連結', '打 [[ ]] 就能連，還有關係圖'],
    ],
    dark: ['🤖', '任何 AI 都讀得懂，換工具也帶得走', '今天講師用 Claude Code，你用 Codex、Cursor 也一樣'],
  },
  {
    id: 's1-note-elements',
    layout: 'grid',
    section: '01 發現問題',
    title: '一則筆記可能有的元素',
    notes: '09:19 筆記的元素(2)，和下一頁合計。快速帶過，讓大家知道一則筆記可以長什麼樣子，不用記。',
    heading: '一則筆記，可能會有這些',
    tiles: [
      ['標題', '一則筆記講一件事\n例：餐廳訂位網站'],
      ['屬性', '類型、日期、狀態\n放在筆記最上面'],
      ['標籤', '#專題 #前端\n之後比較好找'],
      ['連結', '[[技能]] 連到別則筆記\n關係圖就長出來了'],
      ['內容', '做了什麼、我負責哪塊\n有什麼數字'],
      ['待補', '想不起來先寫「？」\n之後 Agent 會回來問'],
    ],
  },
  {
    id: 's1-auto-format',
    layout: 'taskDownload',
    section: '01 發現問題',
    title: '現在不用自己排',
    notes: '接上一頁。這些現在都不用自己排：講清楚目的、筆記類型、要 Obsidian 的格式，AI 就會排好。下一頁的基本資料 Prompt 就是這樣寫的。範本裡已經開好五個資料夾：關於我、學歷、專題、經歷、技能。',
    tag: '現在不用自己排',
    heading: '講清楚，AI 自動排好',
    file: [VAULT_URL, '我的知識庫(範本).zip', '2 KB', 'zip'],
    items: ['目的：這份筆記要拿來做什麼', '筆記類型：專題、經歷，或讀書筆記', '格式：要 Obsidian 的屬性、標籤、連結\n範本解壓縮後，用 Obsidian 開啟這個資料夾；還沒裝好就先貼進記事本'],
  },
  {
    id: 's1-prompt-basic',
    layout: 'copyPrompt',
    section: '01 發現問題',
    title: '基本資料 Prompt',
    notes: '09:21 講師示範＋可跟做(24)。0–5 分講師下載範本、用 Obsidian「開啟資料夾作為 vault」打開，貼這支 Prompt 給聊天 AI 示範一輪；5–19 分學員貼 Prompt、回答，用複製鈕把結果貼進一則「我的基本資料」筆記，不用自己分資料夾；19–24 分自己檢查有沒有寫到「我負責」。只看的人看講師畫面。\n用的是 09:06 寫自我介紹的同一個聊天 AI：這次讓它先問你再寫，結果就具體了。「？」是第二節 Prompt ① 會回來問的地方，先空著沒關係；分進五個資料夾也交給第二節的 Agent。有舊履歷的人，可以一起貼給 AI。',
    tag: '可跟做 · 24 分鐘 · 聊天 AI',
    heading: '基本資料 Prompt：先寫出 v1',
    cardTitle: '貼給任何聊天 AI，回答完貼進新筆記「我的基本資料」',
    prompt:
      '我要建求職用的知識庫。請列出下面 5 題，等我一次回答完：\n1. 學校、科系、年級\n2. 想做什麼工作\n3. 一個專題或作業：做了什麼、我負責哪塊\n4. 一段打工、實習或社團經歷\n5. 會用的工具，各做過什麼\n我答完後，整理成一則 Obsidian 筆記，放在程式碼區塊裡讓我複製：最上面用屬性標註類型和標籤，內容分成關於我、學歷、專題、經歷、技能五段，用短條列。只用我說的，沒提到的寫「？」，不要編。',
  },
  {
    id: 's1-site-compare',
    layout: 'picture',
    section: '01 發現問題',
    title: '網頁比較：A 和 B',
    notes: '09:45 投票(5)，這頁和後面三頁合計 5 分鐘。\n0:00–0:20「兩個網站，憑第一直覺，哪個比較好？」直接翻下一頁投票。兩個網站都是示意，電話是虛構號碼。',
    heading: '兩個網站，憑第一直覺',
    svg: PIC_SITES,
  },
  {
    id: 's1-poll-note',
    layout: 'poll',
    section: '01 發現問題',
    title: '投票：哪個網站比較好',
    notes: '0:20–1:00 投票。\n1:00–1:40 公布結果，問選多數的同學為什麼，聽一位就好。\n1:40–2:10「公布一下，這兩個都是修房子師傅的網站。」\n第一輪就是 B 多：「你們家屋頂也被吹走過嗎？」再問：「換成蓋夢想中的家，還選 B 嗎？」\n投票打不開：唸出兩個選項，第一輪也改舉手。',
    question: '兩個網站，哪個比較好？',
    options: ['A：留白、細字、黑白照片，標語「流動的居住哲學」', 'B：黃底紅字，整頁只有「24H 服務 0912-345-678 半小時到」'],
  },
  {
    id: 's1-roof',
    layout: 'picture',
    section: '01 發現問題',
    title: '照片：我家的屋頂',
    notes: '2:10–3:20「我小時候颱風來，我家屋頂真的被風吹走了。站在家裡抬頭，直接看到天空，雨就這樣下進屋裡。如果那天是你家，你要打給誰？A 的舉手。B 的舉手。」\n舉手時還有人選 A：「屋頂都沒了，你還在看居住哲學。」\n這張是我家的屋頂照片。',
    heading: '那天，抬頭就是天空',
    svg: PIC_ROOF,
  },
  {
    id: 's1-site-reveal',
    layout: 'reveal',
    section: '01 發現問題',
    title: '揭曉：好網站是什麼',
    notes: '3:20–4:00「剛剛說 A 比較好的人，手去哪了？那天我們家要的，不是居住哲學。」(等笑)「但如果你要蓋夢想中的家，想找有品味的設計師，A 反而贏。A 和 B 沒有誰比較好。」翻到這頁。\n4:00–5:00「想 30 秒：你的網站，第一個看的人是誰？」點兩位回答。「第二節你要回答的第一題，就是這個。先休息 10 分鐘。」',
    ask: 'A 和 B，誰比較好？',
    lead: '好網站不是好看，',
    punch: '是跟看的人連上線',
    sub: '第二節的第一題：你的網站，是給誰看的？',
  },
  {
    id: 'break1',
    layout: 'break',
    title: '休息',
    notes: '休息 09:50–10:00。想跟做但還沒裝好的人可以補裝。\n休息前說：你已經有知識庫 v1 了。等一下，換 Agent 反過來問你問題。',
    heading: '休息 10 分鐘',
    back: '10:00',
  },

  // ── 第二節 ──
  {
    id: 's2',
    layout: 'divider',
    title: '第二節：執行',
    notes: '10:00–10:55。',
    no: '02',
    heading: '執行',
    time: '10:00–10:55',
    sub: '為什麼要讓 AI 自己動手？\n收穫：補齊的知識庫＋網站 v1',
  },
  {
    id: 's2-quiz-warmup',
    layout: 'quizSet',
    section: '02 執行',
    label: '暖身搶答',
    firstNote: '10:00 暖身搶答(5)。',
    items: [
      ['AI 給的結果很空泛，迴圈的下一步是什麼？', ['換一個更貴的 AI', '重按一次重新產生', '把狀況講得更具體', '放棄自己寫'], 2],
      ['上一節屋頂那題，B 為什麼贏？', ['黃色比較醒目', '它給了當下那個人要的東西', '字比較大', '電話比較好記'], 1],
    ],
  },
  {
    id: 's2-what-agent',
    section: '02 執行',
    title: 'Agent 是什麼',
    notes: '10:05 講解(8)前段：先講清楚 Agent 是什麼，下一頁再並排比較。講師用自己付費的 Claude Code 示範；學員接自己的 Agent 服務也能完成今天的流程，Codex、Cursor 都可以，沒有付費的用 OpenCode。',
    layout: 'iconSplit',
    kicker: '先搞懂',
    heading: 'Agent\n是什麼？',
    tagline: '會自己動手\n把事情做完的 AI',
    cards: [
      ['🗣️', '你交代任務', '例如「幫我補齊筆記」'],
      ['📂', '它打開資料夾', '自己讀檔'],
      ['✍️', '它動手改', '改檔、寫新檔'],
      ['✅', '做完回報', '做了什麼、哪裡要你確認'],
    ],
    dark: ['🔁', '換哪個 Agent 都一樣', '講師用 Claude Code，你接自己的也行', ['Claude Code', 'Codex', 'Cursor', 'OpenCode']],
  },
  {
    id: 's2-agent',
    section: '02 執行',
    title: '聊天 AI vs Agent',
    notes: '10:05 講解(8)後段。講師示範用 Claude Code，換成 Codex、Cursor、OpenCode 等任何 Agent，流程都一樣。',
    layout: 'whoDoes',
    heading: '同一個任務，誰在動手？',
    task: '幫我的專題筆記補上數字成果',
    left: {
      icon: '💬',
      name: '聊天 AI',
      count: '你動手 4 次',
      steps: [
        ['你', '複製筆記，貼進對話框送出'],
        ['AI', '回你一段改好的文字'],
        ['你', '貼回筆記存檔，下一則再來一次'],
      ],
    },
    right: {
      icon: '🤖',
      name: 'Agent',
      count: '你動手 1 次',
      steps: [
        ['你', '說一句話，交代任務'],
        ['AI', '自己讀完所有筆記，改好檔案'],
        ['AI', '回報：「已補上 120 筆訂位，請確認數字」'],
      ],
    },
    bottom: ['差別不在誰比較聰明，而在', '誰去碰你的檔案'],
  },
  {
    id: 's2-poll-predict',
    layout: 'poll',
    section: '02 執行',
    title: '投票：Agent 第一題會問什麼',
    notes: '10:13 預測投票(1)。先不公布，直接進 Demo 看答案：Prompt ① 要它先從「？」問起。',
    question: 'Agent 讀完筆記，第一題會問你什麼？',
    options: ['你的名字和科系', '筆記裡標「？」的地方', '你想要什麼風格的網站'],
  },
  {
    id: 's2-demo-interview',
    layout: 'split',
    section: '02 執行',
    title: 'Demo：Agent 訪問你',
    notes: '10:14 講師 Demo(5)。左邊 Claude Code、右邊 Obsidian 並排，貼 Prompt ①，只跑前 2 個問答，對照剛剛的預測：它從「？」問起，讓大家看著筆記變多。',
    kicker: '講師 Demo',
    heading: 'Agent\n訪問你',
    items: ['左邊 Claude Code，右邊 Obsidian', 'Agent 讀完筆記，一次問你一題', '你回答完，筆記自己變多了'],
  },
  {
    id: 's2-prompt-1',
    layout: 'copyPrompt',
    section: '02 執行',
    title: 'Prompt ①：Agent 訪問你',
    notes: '10:19 講師續跑＋可跟做(14)。這一次給完整 Prompt，講師把剩下的問題跑完；想跟做的人在自己畫面按複製，貼進自己的 Agent。Agent 會先追問第一節留「？」的地方，並把「我的基本資料」拆進五個資料夾：第一節先求有，這裡再求具體。沒跟做的看講師畫面，挑出 Agent 問得最具體的一題，等一下講出來。',
    tag: '可跟做 · 14 分鐘 · 完整版',
    heading: 'Prompt ①：讓 Agent 訪問你',
    cardTitle: '照貼就好｜沒跟做的：挑出 Agent 問得最具體的一題',
    prompt:
      '請讀這個資料夾裡所有 .md 筆記。你是求職顧問，先從標了「？」的地方問起，一次問我一個問題，幫我補齊缺的細節：我負責什麼、用了什麼工具、有沒有數字成果。\n我回答後，把答案寫進對應資料夾的筆記。問完 5 題就停。',
  },
  {
    id: 's2-compare',
    layout: 'split',
    section: '02 執行',
    title: '前後對照：補完差在哪',
    notes: '10:33 前後對照(2)。在 Obsidian 切給大家看講師的基本資料筆記補完前後；請 1–2 位沒跟做的講剛剛挑的那一題。10:19 實作時間不夠的話跳過這頁，把 2 分鐘還給實作。',
    kicker: '前後對照 · 2 分鐘',
    heading: '同一則筆記\n差在哪？',
    items: ['看講師同一則筆記，補完前和補完後', '沒跟做的：Agent 哪一題問得最具體？'],
  },
  {
    id: 's2-demo-site',
    layout: 'blanks',
    section: '02 執行',
    title: 'Demo：三個空格',
    notes: '10:35 講師 Demo(3)。示範怎麼想三個空格：誰會看、什麼風格、最想讓對方記住什麼。風格下一頁去 Pinterest 找。',
    heading: 'Demo：Prompt ② 的三個空格',
    prompt: ['讀我的筆記，做一個給 ①＿＿＿ 看的個人網站，', '風格是 ②＿＿＿，最想讓對方記住的一件事是 ③＿＿＿。'],
    items: [
      ['誰會看？', '面試官、客戶\n還是社團學弟妹'],
      ['什麼風格？', '簡潔、活潑、專業\n下一頁去 Pinterest 找'],
      ['最想被記住的事', '只選一件\n其他都是配角'],
    ],
  },
  {
    id: 's2-style',
    section: '02 執行',
    title: '找風格：Pinterest',
    notes: '10:38 找風格(3)。風格說不出來很正常，先用看的。Agent 不一定看得懂圖，所以要把喜歡的地方翻成文字。',
    layout: 'iconSplit',
    kicker: '找風格 · 3 分鐘',
    heading: '風格說不出來？\n先去看',
    link: ['https://www.pinterest.com/search/pins/?q=personal%20website%20design', '📌 Pinterest：personal website design', '滑一滑，挑 1–2 個你喜歡的個人網站'],
    cards: [
      ['👀', '挑 1–2 個', '你最喜歡的設計'],
      ['🏷️', '用三個詞說出來', '例：留白多、深色、大標題'],
      ['✍️', '這三個詞 = Prompt ② 的「風格」空格', 'Agent 不一定看得懂圖，要翻成文字＝具體描述'],
    ],
  },
  {
    id: 's2-style-cloud',
    layout: 'wordcloud',
    section: '02 執行',
    title: '文字雲：你的風格',
    notes: '10:41 文字雲(1)。大家同時送出，看全班的風格分布；撞詞很正常，同一個詞也能做出不同網站。',
    question: '用一個詞告訴我：你想要的網站風格？',
    maxWords: 1,
  },
  {
    id: 's2-prompt-2',
    layout: 'copyPrompt',
    section: '02 執行',
    title: 'Prompt ②：做出網站 v1',
    notes: '10:42 講師示範＋可跟做(10)。這一次是填空版，複製後要先把三個空格換成自己的答案再送出。打開方式：Obsidian 對 site 資料夾按右鍵，在檔案管理員中顯示，雙擊 index.html。',
    tag: '可跟做 · 10 分鐘 · 填空版',
    heading: 'Prompt ②：做出網站 v1',
    cardTitle: '複製後，先填好三個空格再送出｜沒跟做的：想想你會怎麼填',
    prompt:
      '讀這個資料夾的所有筆記，做一個給＿＿看的個人網站，風格是＿＿，最想讓對方記住的一件事是＿＿。\n只能用筆記裡的內容，不要編造經歷。\n存成 site/index.html，CSS 寫在同一個檔案，手機看也要好看。',
  },
  {
    id: 's2-poll-v1',
    layout: 'poll',
    section: '02 執行',
    title: '投票：30 秒找得到嗎',
    notes: '10:52 投票(3)。\n「還記得屋頂被吹走那天嗎？那天我們要的東西，B 網站一眼就給了。現在換你的網站。不要問自己喜不喜歡，用你在第一格填的那個人的眼睛看，30 秒內找得到他要的東西嗎？」\n公布後：「選找一下才有和找不到的不用難過，這就是第三節要處理的。先休息 10 分鐘。」',
    question: '你填的讀者打開 v1，30 秒內找得到他要的東西嗎？沒跟做的就看講師的',
    options: ['馬上找到', '找一下才有', '找不到'],
  },
  {
    id: 'break2',
    layout: 'break',
    title: '休息',
    notes: '休息 10:55–11:05。\n休息前說：你已經有網站 v1 了。回來第一件事：為什麼不讓 AI 一次做完？',
    heading: '休息 10 分鐘',
    back: '11:05',
  },

  // ── 第三節 ──
  {
    id: 's3',
    layout: 'divider',
    title: '第三節：驗證與優化',
    notes: '11:05–12:00。',
    no: '03',
    heading: '驗證與優化',
    time: '11:05–12:00',
    sub: '第一次做不好，怎麼辦？\n收穫：網站 v3＋帶得走的迴圈',
  },
  {
    id: 's3-quiz-recap',
    layout: 'quizSet',
    section: '03 驗證與優化',
    label: '回顧搶答',
    firstNote: '11:05 回顧搶答(3)。第 2 題揭曉後放動圖，再接判斷時刻。',
    items: [
      ['Prompt ② 的三個空格是哪三個？', ['名字、學校、科系', '顏色、字體、版面', '標題、內文、照片', '誰會看、什麼風格、最想被記住的事'], 3],
      ['為什麼不讓 AI 一次把網站做完？', ['一次做完的網站比較醜', 'AI 一次只能寫一個檔案', '一次做完，不對就要全部重來', '分開做比較省錢'], 2],
    ],
  },
  {
    id: 's3-meme-fix',
    layout: 'meme',
    section: '03 驗證與優化',
    title: '梗圖：幫我修好它',
    notes: '第 2 題揭曉後放這張動圖，不用講話，讓它循環一次(約 8 秒)，笑完直接翻下一頁買菜。動圖取自團隊內容庫。',
    heading: '一次叫它全部修好，結果……',
    src: 'https://lrypleluliwfgjdcbvoq.supabase.co/storage/v1/object/public/slides/images/17e9f39b-bab8-46e8-a49a-3706f2b7d3fa/77dfacb7-8819-40ce-a6ef-ad274fab033e.webp',
    width: 335,
  },
  {
    id: 's3-why-not',
    layout: 'darkQuestion',
    section: '03 驗證與優化',
    title: '為什麼不讓 AI 一次做完？',
    notes: '11:08 判斷時刻(2)。承接搶答第 2 題，用迴圈回答。時間緊，超過就先拿掉剪頭髮。\n「媽媽說：去買點菜回來。你出門，買了一顆高麗菜、三包泡麵、一盒草莓。媽媽打開袋子：這什麼？今天要煮咖哩欸。你再跑一趟，買了馬鈴薯。媽媽說：紅蘿蔔呢？第三趟回來，媽媽已經叫外送了。」(停一下等笑)\n「這就是一次做完，大型的抽抽樂。抽到你要的還好說，不是你要的，就要不斷地抽，不只燒錢也燒時間。」\n「更慘的是剪頭髮。你說幫我剪帥一點，設計師一刀剪完才給你看鏡子。AI 抽錯還能重抽，頭髮不會長回來。」\n「換個做法。出門前先問：今天煮什麼？幾個人吃？這是具體描述。去買，這是執行。在菜攤傳張照片：這顆馬鈴薯可以嗎？這是驗證。媽媽回：太小顆，挑大一點。這是優化。一趟就買對。」\n「今天在座的都是媽媽，AI 就是那個被叫去買菜的小孩。你只說幫我做個網站，就等於只說去買點菜。」\n時間夠再補：先補資料再產出；知識庫是本體，網站只是其中一種輸出。',
    tag: '判斷時刻',
    question: '為什麼不讓 AI\n一次做完？',
    bubbles: [
      ['me', '幫我做一個個人網站。', 'accent'],
      ['ai', '好的！這是陳小明，熱愛挑戰的工程師。'],
    ],
    note: '先講清楚，再一輪一輪改，每一輪都更接近你要的。',
  },
  {
    id: 's3-tf-done',
    layout: 'truefalse',
    section: '03 驗證與優化',
    title: '是非題：它說做完了',
    notes: '11:10 是非題(1)，進入驗證。答案是「不對」：「Agent 會做完，不保證做對。它說好了，你要自己打開網頁走一遍，因為網站上掛的是你的名字。」揭曉後翻下一頁動圖。',
    question: 'Agent 說「網站做好了」，我就不用再打開看了？',
    answer: false,
  },
  {
    id: 's3-meme-teach',
    layout: 'meme',
    section: '03 驗證與優化',
    title: '梗圖：手把手教還是做不好',
    notes: '動圖循環一次(約 13 秒)。「所以要驗證。下一個 Prompt，就是讓 Agent 先當你的讀者，自己挑自己的毛病。」動圖取自團隊內容庫。',
    heading: '你以為交給 AI 就好了……',
    src: 'https://lrypleluliwfgjdcbvoq.supabase.co/storage/v1/object/public/slides/images/8971a5c0-7da4-4d8d-baad-160746bc7ed9/c3bedaa4-4d13-4e02-bb03-70e803c31c2e.webp',
    width: 390,
  },
  {
    id: 's3-prompt-3',
    layout: 'skillTemplate',
    section: '03 驗證與優化',
    title: 'Prompt ③：讀者審稿',
    notes: '11:11 講師示範＋可跟做(14)。只給骨架，學員自己補完再送出。讀者就填 Prompt ② 的第一個空格。Agent 列完意見後只挑一點叫它改，重新整理看 v2；覺得它說得沒道理，就反問「為什麼？」。',
    tag: '可跟做 · 14 分鐘 · 骨架版',
    heading: 'Prompt ③：讓 Agent 當你的讀者',
    lines: [
      ['why', '你是 ＿＿＿＿＿＿，打開這個網站看 30 秒。', '填 Prompt ② 的讀者，例：你是面試官'],
      ['bg', '告訴我：你記住了什麼？想跳過哪裡？還想知道什麼？'],
      ['better', '我挑一點請你改：＿＿＿＿＿＿。', '例：第一屏看不出我做過什麼，把訂位網站專題放上來'],
    ],
    note: '只改一個地方，重新整理看 v2；它說得沒道理，就反問「為什麼？」\n沒跟做的：猜猜 Agent 會挑講師網站哪裡的毛病。',
  },
  {
    id: 's3-pair',
    layout: 'split',
    section: '03 驗證與優化',
    title: '自己看：第一直覺',
    notes: '11:25 自己看(8)。不讀內容、不想太久，看畫面的第一個感覺最準。說出原因後直接丟給 Agent 改，重新整理確認。',
    kicker: '自己看 · 8 分鐘',
    heading: '第一直覺',
    items: [
      '打開網站，直接看畫面，先不讀內容\n沒跟做的，看講師的網站',
      '憑第一直覺：哪裡最想改？',
      '用一句話說原因\n例：字太小、看不出重點、顏色太亂',
      '把這句話丟給 Agent，請它改，重新整理看看',
    ],
  },
  {
    ...LOOP,
    core: true,
    id: 's3-loop-core',
    section: '03 驗證與優化',
    title: '回到迴圈',
    heading: '回到迴圈：今天跑了幾輪？',
    center: '每跑一輪\n就更接近你',
    notes: '11:33 回到迴圈(7)，這頁只放迴圈。先問台下：今天跑了哪幾步、哪一輪改最多？聽完答案再翻下一頁對照。',
  },
  {
    ...LOOP,
    id: 's3-loop-review',
    section: '03 驗證與優化',
    title: '回到迴圈：今天跑了幾輪',
    heading: '回到迴圈：今天跑了幾輪？',
    center: '每跑一輪\n就更接近你',
    cardsTitle: '今天跑過的兩輪',
    cards: [
      ['第一輪：知識庫', '「幫我寫自我介紹」太空泛 → 把自己寫進知識庫，AI 才認識你'],
      ['第二輪：網站', 'Agent 做出 v1 → 讀者審稿、第一直覺 → 一輪一輪改到 v3'],
    ],
    notes: '回到迴圈第二頁：對照今天跑過的兩輪。換題目的例子留到收尾再講。',
  },
  {
    ...CONFIDENCE,
    id: 's3-scale-after',
    section: '03 驗證與優化',
    title: '量表：收尾',
    notes: '11:40 收尾開頭，再量一次同一題(30 秒)。「早上量過一次，現在呢？」跟開場的平均比，講一句：「分數變高，是因為你現在知道怎麼把自己講清楚。」',
  },
  {
    id: 's3-recap',
    layout: 'rows',
    section: '03 驗證與優化',
    title: '收尾：今天的四句話',
    notes: '11:40 重點(2)，量表後接著講，一句一句念，不展開。「早上的自我介紹為什麼空泛？不是 AI 笨，是我們沒講。」',
    heading: '今天帶走的四句話',
    rows: [
      ['accent', '空泛', 'AI 給得空泛，是因為我沒講清楚'],
      ['accent', '迴圈', '具體描述 → 執行 → 驗證 → 優化'],
      ['accent', '好網站', '不是好看，是跟看的人連上線'],
      ['accent', '一輪一輪', '不要一次做完，每一輪都更接近你要的'],
    ],
  },
  {
    id: 's3-bricks',
    layout: 'bricks',
    section: '03 驗證與優化',
    title: '收尾：拋磚引玉',
    notes: '11:43 拋磚(3)：「今天做的是網站，但同一個迴圈，什麼都能用。」四個例子各講一句，重點都是「把自己講清楚」：考前助教要知道你哪章最弱；闖關遊戲要知道一關考什麼；冰箱管家要知道冰箱有什麼、幾個人吃；一年前的自己要讀得到你的知識庫。\n11:46 引玉(4)：「我丟的只是磚。你的第一個迴圈，要用在哪裡？」給 1 分鐘寫在手機或紙上，請 2–3 人分享，每人一句。講師只回一句：這一題，第一步要講清楚什麼？\n11:50 前若還有時間當緩衝，直接接 Q&A。',
    heading: '同一個迴圈，什麼都能用',
    cards: [
      ['📚 考前魔鬼助教', '「幫我整理重點」', '「照我的筆記出 10 題，我答錯就追問到我懂」'],
      ['🎮 課本變闖關遊戲', '「幫我讀這章」', '「把這章變成 5 關，每關一個觀念，答對才過關」'],
      ['🧊 冰箱管家', '「今天煮什麼？」', '「冰箱有蛋、高麗菜、豆腐，兩個人吃，20 分鐘內」'],
      ['🪞 一年前的自己', '「幫我寫心得」', '「讀我去年這個月的筆記：我變了什麼、還卡在哪？」'],
    ],
    ask: '我丟的只是磚。你的第一個迴圈，要用在哪裡？',
    write: '寫下來：我下一個用迴圈處理的是＿＿',
  },
  {
    id: 'qa',
    layout: 'qa',
    title: 'Q & A',
    notes: '11:50 QA(10)。',
    heading: 'Q & A',
    sub: '現在，換你問了。',
  },
];
