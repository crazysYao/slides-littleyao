// 主題候選 F「讓 AI 一開口就懂你」的簡報內容：每頁文字、講稿、投票與搶答。版面共用 build-deck.mjs。
// 產生：node build-deck.mjs <輸出路徑> topic-f-content.mjs
// 教案見 ../topic-f-agent-knowledge-resume.md

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
    id: 's1-goal',
    layout: 'goal',
    section: '開始之前',
    title: '終點長這樣',
    notes: '09:00 先秀終點(3)。左邊打開 hi.littleyao.me/zh，右邊打開課前用今天流程重做的單頁版。不要說左邊是用今天的流程做的。右邊的單頁版做好後，改成連結。',
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
    notes: '09:03 今天怎麼參與(1)。不強迫實作：講師用自己付費的 Claude Code 把整個流程跑一遍，只聽也能帶走迴圈。想跟著做的人，用自己的 Agent 就行，Codex、Cursor 都可以；沒有付費的，裝免費的 OpenCode Desktop。',
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
    notes: '09:04 安裝(3)。想跟著做的人才需要裝。Obsidian 必裝；Agent 挑一個：已經有 Claude Code、Codex、Cursor 的人用手上的，沒有付費的裝免費的 OpenCode Desktop。安裝的同時聽下一段。',
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
    title: '安裝：Mac／Windows 選哪個',
    notes: 'Mac 看晶片；Windows 一般選 x64，ARM 機種才選 ARM64。每個工具的下載頁都一樣。',
    heading: '下載哪個版本？',
    cards: [
      ['accent', 'Mac', '蘋果選單 →「關於這台 Mac」\nApple M 系列選 Apple Silicon\n下載 .dmg，拖進「應用程式」'],
      ['accent', 'Windows', '一般筆電選 x64\n跳出藍色警告：「其他資訊」\n→「仍要執行」'],
    ],
    note: '要裝的人邊裝邊聽，我們先來看一個問題。',
  },
  {
    id: 's1',
    layout: 'divider',
    title: '第一節：發現問題，具體描述',
    notes: '09:00–09:50。',
    no: '01',
    heading: '發現問題，具體描述',
    time: '09:00–09:50',
    sub: '收穫：知識庫 v1',
  },
  {
    id: 's1-problem',
    layout: 'bigPrompt',
    section: '01 發現問題',
    title: '發現問題：幫我寫自我介紹',
    notes: '09:07 發現問題(3)。切到 AI 畫面，只打「幫我寫自我介紹」，不給任何資料。現場出狀況就放事先產生的結果截圖。',
    caption: '講師現場只打這一句',
    prompt: '幫我寫自我介紹',
  },
  {
    id: 's1-problem-poll',
    layout: 'poll',
    section: '01 發現問題',
    title: '投票：這在講你嗎',
    notes: '唸出 AI 的結果再開投票。長條圖一面倒時接：所以這是在座每一個人的自我介紹。',
    question: '這段自我介紹在講你嗎？',
    options: ['這在講我', '不是我'],
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
    notes: '09:10 問題迴圈(7)，這頁只放迴圈。\n0:00–1:00 回到剛剛的自我介紹：問題不是 AI 爛，是我們講得不夠具體，這就是發現問題。\n1:00–3:00 沿著圖走一圈：具體描述 → 執行 → 驗證 → 優化；第一節在具體描述、第二節在執行、第三節在驗證與優化。',
  },
  {
    ...LOOP,
    id: 's1-loop',
    section: '01 發現問題',
    title: '問題迴圈：兩個例子',
    notes: '問題迴圈第二頁(3:00–7:00)。\n3:00–4:30 青之蘆葦①：選拔最後，葦人講不好，還是把自己怎麼進球講給福田聽，因此被看見。對應具體描述。\n4:30–5:30 青之蘆葦②：升上 A 隊才發現「言語化的次元不一樣」，每一輪講得更細，就前進一階。對應優化。\n5:30–7:00 右下對照：「不好看」vs「標題太小、看不出我會什麼」。寫履歷、準備面試也是同一個迴圈。',
  },
  {
    id: 's1-obsidian',
    section: '01 發現問題',
    title: '介紹 Obsidian',
    notes: '09:17 介紹 Obsidian(3)。講到 🔗 可切講師 vault 秀關係圖 5 秒；最後扣回：這就是迴圈裡「具體描述」的倉庫。重點是最後一點：檔案在自己電腦、任何 AI 都讀得懂，資料主控權在自己手上。',
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
    id: 's1-folders',
    layout: 'grid',
    section: '01 發現問題',
    title: '知識庫的五個資料夾',
    notes: '範本 vault 每個資料夾都有一則範例。',
    heading: '知識庫的五個資料夾',
    tiles: [
      ['關於我', '一句話介紹自己\n想做什麼工作'],
      ['學歷', '學校、科系\n修過的關鍵課程'],
      ['專題', '做了什麼、你負責哪塊\n成果有多少'],
      ['經歷', '實習、打工\n社團、比賽'],
      ['技能', '會用的工具\n用它做過什麼'],
    ],
  },
  {
    id: 's1-good-note',
    layout: 'blanks',
    section: '01 發現問題',
    title: '好筆記的三個要素',
    notes: '一件事一則，盡量有數字。下一段用基本資料 Prompt 讓聊天 AI 先寫出來，不用自己從空白頁開始。',
    heading: '好筆記的三個要素',
    prompt: ['# 餐廳訂位網站', '3 人小組，我負責前端。上線兩週有 120 筆訂位。'],
    items: [
      ['做了什麼', '一件事寫一則\n例：餐廳訂位網站'],
      ['我負責哪塊', '團隊裡你的角色\n例：3 人小組，我負責前端'],
      ['有什麼數字', '人數、筆數、時間\n例：上線兩週 120 筆訂位'],
    ],
    note: '等一下用一支 Prompt，讓 AI 先幫你把這三點寫成筆記。',
  },
  {
    id: 's1-task-vault',
    layout: 'taskDownload',
    section: '01 發現問題',
    title: '示範：寫你的知識庫',
    notes: '09:20 講師示範＋可跟做(25)。0–5 分講師下載範本、用 Obsidian「開啟資料夾作為 vault」打開，貼下一頁的基本資料 Prompt 給聊天 AI 示範一輪；5–20 分學員貼 Prompt、回答，把整段貼進一則「我的基本資料」筆記，不用自己分資料夾；20–25 分自己檢查有沒有寫到「我負責」。只看的人看講師畫面。',
    tag: '講師示範 · 可跟做 · 25 分鐘',
    heading: '寫你的知識庫',
    file: [VAULT_URL, '我的知識庫(範本).zip', '2 KB', 'zip'],
    items: ['解壓縮，用 Obsidian 開啟這個資料夾', '不用自己寫：複製下一頁的 Prompt，貼給任何聊天 AI', '回答 5 題，把 AI 回的整段貼進一則新筆記「我的基本資料」'],
  },
  {
    id: 's1-prompt-basic',
    layout: 'copyPrompt',
    section: '01 發現問題',
    title: '基本資料 Prompt',
    notes: '接上一頁。用的是 09:07 寫自我介紹的同一個聊天 AI：這次讓它先問你再寫，結果就具體了。「？」是第二節 Prompt ① 會回來問的地方，先空著沒關係；分進五個資料夾也交給第二節的 Agent。有舊履歷的人，可以一起貼給 AI。',
    tag: '可跟做 · 聊天 AI · 基本資料',
    heading: '基本資料 Prompt：先寫出 v1',
    cardTitle: '貼給任何聊天 AI',
    prompt:
      '我要建求職用的知識庫。請列出下面 5 題，等我一次回答完：\n1. 學校、科系、年級\n2. 想做什麼工作\n3. 一個專題或作業：做了什麼、我負責哪塊\n4. 一段打工、實習或社團經歷\n5. 會用的工具，各做過什麼\n我答完後，整理成一則 Markdown 筆記，分成關於我、學歷、專題、經歷、技能五段，內容用短條列。只用我說的，沒提到的寫「？」，不要編。',
  },
  {
    id: 's1-poll-note',
    layout: 'poll',
    section: '01 發現問題',
    title: '投票：哪一則最像網站素材',
    notes: '09:45 投票(5)。公布後點出：有角色、有數字的那則最好用。',
    question: '哪一則筆記最像網站素材？',
    options: ['我很認真、很負責', '做過一個 App 專題', '社團活動組長，辦了 3 場活動，共 200 人參加'],
  },
  {
    id: 'break1',
    layout: 'break',
    title: '休息',
    notes: '休息 09:50–10:00。想跟做但還沒裝好的人可以補裝。',
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
    sub: '收穫：補齊的知識庫＋網站 v1',
  },
  {
    id: 's2-quiz-warmup',
    layout: 'quizSet',
    section: '02 執行',
    label: '暖身搶答',
    firstNote: '10:00 暖身搶答(5)。',
    items: [
      ['AI 給的結果很空泛，迴圈的下一步是什麼？', ['把狀況講得更具體', '換一個更貴的 AI', '重按一次重新產生', '放棄自己寫'], 0],
      ['網站做出來後，「驗證」要做什麼？', ['檢查結果對不對、哪裡要改', '馬上上線', '請 AI 再做一個', '截圖分享'], 0],
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
    id: 's2-demo-interview',
    layout: 'split',
    section: '02 執行',
    title: 'Demo：Agent 訪問你',
    notes: '10:13 講師 Demo(10)。左邊 Claude Code、右邊 Obsidian 並排，讓大家看著筆記變多。',
    kicker: '講師 Demo',
    heading: 'Agent\n訪問你',
    items: ['左邊 Claude Code，右邊 Obsidian', 'Agent 讀完筆記，一次問你一題', '你回答完，筆記自己變多了'],
  },
  {
    id: 's2-prompt-1',
    layout: 'copyPrompt',
    section: '02 執行',
    title: 'Prompt ①：Agent 訪問你',
    notes: '10:23 講師示範＋可跟做(12)。這一次給完整 Prompt，講師貼進 Claude Code 跑一遍；想跟做的人在自己畫面按複製，貼進自己的 Agent。Agent 會先追問第一節留「？」的地方，並把「我的基本資料」拆進五個資料夾：第一節先求有，這裡再求具體。',
    tag: '可跟做 · 12 分鐘 · 完整版',
    heading: 'Prompt ①：讓 Agent 訪問你',
    cardTitle: '照貼就好',
    prompt:
      '請讀這個資料夾裡所有 .md 筆記。你是求職顧問，先從標了「？」的地方問起，一次問我一個問題，幫我補齊缺的細節：我負責什麼、用了什麼工具、有沒有數字成果。\n我回答後，把答案寫進對應資料夾的筆記。問完 5 題就停。',
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
    cardTitle: '複製後，先填好三個空格再送出',
    prompt:
      '讀這個資料夾的所有筆記，做一個給＿＿看的個人網站，風格是＿＿，最想讓對方記住的一件事是＿＿。\n只能用筆記裡的內容，不要編造經歷。\n存成 site/index.html，CSS 寫在同一個檔案，手機看也要好看。',
  },
  {
    id: 's2-poll-v1',
    layout: 'poll',
    section: '02 執行',
    title: '投票：v1 幾分',
    notes: '10:52 投票(3)。第三節開場回頭看。',
    question: '網站 v1 打幾分？沒跟做的就評講師的',
    options: ['1–2 分：還很陽春', '3 分：堪用', '4–5 分：可以給人看了'],
  },
  {
    id: 'break2',
    layout: 'break',
    title: '休息',
    notes: '休息 10:55–11:05。',
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
    sub: '收穫：網站 v3＋你自己的指令',
  },
  {
    id: 's3-quiz-recap',
    layout: 'quizSet',
    section: '03 驗證與優化',
    label: '回顧搶答',
    firstNote: '11:05 回顧搶答(3)。第 2 題答完直接接下一頁判斷時刻。',
    items: [
      ['Prompt ② 的三個空格是哪三個？', ['誰會看、什麼風格、最想被記住的事', '名字、學校、科系', '顏色、字體、版面', '標題、內文、照片'], 0],
      ['為什麼不讓 AI 一次把網站做完？', ['一次做完像抽抽樂，不對就只能重抽', '一次做完的網站比較醜', 'AI 一次只能寫一個檔案', '分開做比較省錢'], 0],
    ],
  },
  {
    id: 's3-why-not',
    layout: 'darkQuestion',
    section: '03 驗證與優化',
    title: '為什麼不讓 AI 一次做完？',
    notes: '11:08 判斷時刻(2)。承接搶答第 2 題，用迴圈回答：先具體描述，再執行、驗證、優化。先補資料再產出；知識庫是本體，網站只是其中一種輸出。\n\n一次做出來 那也就只是大型的抽抽樂\n抽到是你要的還好說\n不是你要的 你就要不斷的抽 抽到你滿意, 不只燒錢也燒時間\n',
    tag: '判斷時刻',
    question: '為什麼不讓 AI\n一次做完？',
    bubbles: [
      ['me', '幫我做一個個人網站。', 'accent'],
      ['ai', '好的！這是陳小明，熱愛挑戰的工程師。'],
    ],
    note: '一次做完是抽抽樂；跑迴圈，每一輪都更接近你要的。',
  },
  {
    id: 's3-prompt-3',
    layout: 'skillTemplate',
    section: '03 驗證與優化',
    title: 'Prompt ③：讀者審稿',
    notes: '11:10 講師示範＋可跟做(15)。只給骨架，學員自己補完再送出。讀者就填 Prompt ② 的第一個空格。Agent 列完意見後只挑一點叫它改，重新整理看 v2；覺得它說得沒道理，就反問「為什麼？」。',
    tag: '可跟做 · 15 分鐘 · 骨架版',
    heading: 'Prompt ③：讓 Agent 當你的讀者',
    lines: [
      ['why', '你是 ＿＿＿＿＿＿，打開這個網站看 30 秒。', '填 Prompt ② 的讀者，例：你是面試官'],
      ['bg', '告訴我：你記住了什麼？想跳過哪裡？還想知道什麼？'],
      ['better', '我挑一點請你改：＿＿＿＿＿＿。', '例：第一屏看不出我做過什麼，把訂位網站專題放上來'],
    ],
    note: '只改一個地方，重新整理看 v2；它說得沒道理，就反問「為什麼？」',
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
    compareTitle: '下次換個題目，同一個迴圈',
    compare: ['寫履歷：「不夠強」→ 講出哪一段看不出你做過什麼', '準備面試：「講不好」→ 挑一題，把落差講得更具體'],
    notes: '回到迴圈第二頁：對照今天跑過的兩輪，同一個迴圈換到寫履歷、準備面試。',
  },
  {
    id: 's3-my-prompt',
    layout: 'split',
    section: '03 驗證與優化',
    title: '寫你自己的指令',
    notes: '11:40 收尾(10)。這次空白，不給範本。Prompt 也是你的資料，一樣存進知識庫。',
    kicker: '收尾 · 自己寫',
    heading: '寫你自己\n的指令',
    items: ['在知識庫新增一則：我的指令.md', '寫下今天你最好用的一句 Prompt', '下次換任何 Agent，打開就能用'],
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
