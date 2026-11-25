// 北科大求職網站課「聽課版」：學員只聽不做，講師示範全部操作；統計互動改現場舉手。
// 內容沿用 job-site-content.mjs，這裡只寫頁序、覆寫與新頁。用法同原版：
//   node build-deck-html.mjs <輸出路徑> ./listen-content.mjs
import { readFileSync } from 'node:fs';
import * as base from './job-site-content.mjs';

const jpg = (name) => `data:image/jpeg;base64,${readFileSync(new URL(`assets/${name}.jpg`, import.meta.url)).toString('base64')}`;

export const { brand, palette } = base;


const CHAT = 'Synora 連不上時，請大家在 Meet 聊天室打選項字母。';
const V = '03 上線';
const VERCEL = [
  {
    id: 'v-ways', layout: 'three', section: V, title: '讓網站上線的三種方式',
    notes: '三種上線方式，接在 localhost 後一句帶過、不另算時間。網站做好只在自己電腦裡，別人看不到。讓它上線有三種方式：拖進去、打一行指令、推到 GitHub 自動上線。今天現場做第一種，後兩種是工程師常用的，看動畫知道有這條路就好。',
    heading: '網站做好了，怎麼讓別人打得開？',
    cards: [
      ['accent', '① Drop：拖進去', '把 HTML 檔拖進瀏覽器，幾秒就有網址。不用裝任何東西'],
      ['accent', '② CLI：打一行指令', '在終端機打 vercel --prod，改完再打一次就更新'],
      ['dark', '③ GitHub：推了就上線', '程式碼放 GitHub，每次推上去 Vercel 自動重新上線'],
    ],
  },
  {
    id: 'v-cli', layout: 'opDemo', demo: 'vercel-cli-demo', section: V, title: 'CLI：一行指令上線',
    notes: '11:10 工程師怎麼上線：CLI(2)。只播動畫、不切出畫面。工程師會在終端機打一行 vercel --prod 就上線，改完再打一次就更新。你們不用學，回家用 Drop 就夠。',
    heading: 'CLI：在終端機打一行就上線',
  },
  {
    id: 'v-github', layout: 'opDemo', demo: 'github-deploy-demo', section: V, title: 'GitHub：推了就自動上線',
    notes: '11:12 工程師怎麼上線：GitHub(2)，看動畫、口述帶過。程式碼放在 GitHub，Vercel 連上之後，每次推上新版本就自動上線，這叫 CI/CD（自動部署）。等一下要給你們看的日文 PK 網站，就是這樣上線的。',
    heading: 'GitHub：推上去，Vercel 自動上線',
  },
];

// 資安頁前的開場短片：工程師直播寫程式漏金鑰，先問再揭曉，回扣「分享畫面也是公開」
const SECURITY = [
  {
    id: 'v-token', layout: 'linkTask', section: '03 改更好', title: '短片：工程師直播',
    notes: '10:25 短片：直播漏 token(1)。播放前先問：知名工程師實況主 ThePrimeagen 正在直播寫程式，猜猜他的畫面上出現了什麼不該出現的東西？播 26 秒揭曉：他把秘密金鑰秀在畫面上，觀眾比他先發現。接下一頁：分享畫面也是公開。我現在就是用 Meet 分享畫面，所以開任何檔案、切任何視窗之前，我都會先想一下畫面上有什麼。',
    tag: '短片 · 26 秒',
    heading: '工程師正在直播寫程式，猜猜畫面上出現了什麼？',
    link: ['https://www.youtube.com/shorts/WhC6iSFDtZk', '看短片', '在 YouTube 開啟'],
  },
];

const J = '03 我的學習系統';
const JAPANESE = [
  {
    id: 'jp-bridge', layout: 'divider', section: J, title: '轉場：同一套方法換個題目',
    notes: '轉場，不另算時間。網站上線告一段落。最後這段換個題目：同樣是基本資料、Skill、Context，我拿來準備日檢。下一頁先看成品。',
    no: '分享',
    heading: '同一套方法，還能做什麼？',
    time: '11:14–11:28',
    sub: '網站上線了。接下來看我怎麼用 Agent＋Obsidian 準備日檢',
  },
  {
    id: 'jp-why', layout: 'opDemo', demo: 'jp-why-demo', section: J, title: '我為什麼學日文',
    notes: '11:16 動機(2)。我報名了 12 月的日檢 N3，聽力是我最弱的一科；但我每週只有 8 小時能讀。時間這麼少，每一分鐘都不能花在已經會的東西上。最後一句：先把自己講清楚，AI 才幫得上忙。避開：不講分數、不講過去的進度。',
    heading: '我在準備日檢 N3',
  },
  {
    id: 'jp-loop', layout: 'opDemo', demo: 'agent-loop-demo', section: J, title: '我、Agent、Skills、Obsidian',
    notes: '11:18 規劃動線(4)，兩頁。只講三樣東西：我的資料（Obsidian 裡的複習清單）、手冊（Skill）、AI（Agent）。動畫會自己跑：我說「今天練什麼？」→ Agent 拿「測驗」這本手冊 → 讀我的複習清單出題 → 我答錯，它把錯題寫回清單，下次再考。畫面上的 MCP、Google Drive 不用解釋。對回今天：複習清單就是基本資料，手冊就是 Skill，只讀需要的那幾份就是 Context。',
    heading: '我、Agent、Skills 和我的資料，怎麼一起動',
  },
  {
    id: 'jp-skills', layout: 'grid', section: J, title: '一件事一個 Skill',
    notes: '我幫 Agent 寫了好幾個 Skill（還有單字筆記、解題、Anki 同步，口頭帶過），每個只管一件事，也只能改自己負責的檔案，不會互相弄亂。就像第二節咖啡店的工作手冊：說清楚什麼時候用、怎麼做、規則是什麼。',
    heading: '一件事一個 Skill，各管各的',
    tiles: [
      ['打卡', '寫今天的學習紀錄'],
      ['測驗', '從筆記出題，錯的進複習清單'],
      ['改句子', '我寫日文句子，它幫我改'],
    ],
  },
  {
    id: 'jp-scene', layout: 'split', section: J, title: '依自己的弱點做練習情境',
    notes: '11:22 專屬練習情境(5)，現場示範。學員看不懂日文沒關係，只要看得出「題目裡的字＝我清單上的字」。① 0:00 打開 Obsidian 的複習清單，指出 3 個卡點（ちゃ＝ては、ちゃう＝てしまう、貯める／稼ぐ）。② 0:45 在 Claude Code 打：「讀我的複習清單和最近一次學習紀錄，出一段便利商店的對話，裡面藏 3 個我常錯的縮約形，讓我還原成完整的說法。先不要給答案。」讓大家看它讀了哪兩個檔。③ 1:30 一個一個圈出題目裡的縮寫，不唸日文、不講文法。④ 2:30 當場還原一題，故意答錯一個，讓 AI 指出錯在哪。⑤ 3:30 回 Obsidian，看錯題被寫回複習清單。⑥ 4:30 收尾：它出得了這種題目，是因為讀了我的資料；沒給資料只會出一般題，這就是 Context。網路或 Claude Code 出狀況就直接播課前錄好的這 5 分鐘，不要現場除錯。',
    kicker: '講師示範 · 現場跑一次',
    heading: '依自己的弱點\n做練習情境',
    items: [
      '我常搞混日文的口語縮寫',
      '請 Agent 讀複習清單＋最近的學習紀錄',
      '出一段便利商店對話，藏 3 個縮約形讓我還原',
    ],
  },
  {
    id: 'jp-map', layout: 'opDemo', demo: 'jp-map-demo', link: ['https://japanes-pk.littleyao.me', '打開日文 PK 網站', '點了會開新分頁'], section: J, title: '同一套方法，換個題目',
    notes: '11:27 對照(1)。求職網站和學日文，用的是同一套：基本資料、Skill、Context。下一頁換你們想。',
    heading: '同一套方法，換個題目',
  },
];

// 頁序是白名單：原版之後新增的頁不會自動跑進聽課版
export const ORDER = [
  // 第一節：講清楚＋做出 v1
  'cover',
  {
    id: 'intro', layout: 'photoWall', section: '開始之前', title: '講師自我介紹',
    heading: '我是 David（CrazyYao），在這些地方教過 AI',
    notes: '09:00 講師自我介紹(2)。照片一張一張出來，每張講一句：安東社大教中高齡學員用 AI；開南大學電腦教室帶大學生實作；聰電站對外開課，學員自帶筆電；超級聰電站跟來參加的人聊求職和 AI。右邊收尾：本業是後端工程師 7 年多，現在是 WPORT 後端負責人，教過的學員超過 49 位。最後一句：今天不是要你們變工程師，是要你們學會讓 AI 一開口就懂你。',
    photos: [
      { src: jpg('exp-shequ'), label: '安東社大', sub: 'AI 課程' },
      { src: jpg('exp-kainan'), label: '開南大學', sub: '電腦教室實作', pos: 'center 25%' },
      { src: jpg('exp-congdian'), label: '聰電站', sub: '對外開課' },
      { src: jpg('exp-supercd'), label: '超級聰電站', sub: '社群交流' },
    ],
    facts: [
      ['身份', '後端工程師 7+ 年 · WPORT 後端負責人'],
      ['學員', '49+ 名'],
    ],
  },
  's1-outline', {
    id: 'l-synora', layout: 'opDemo', demo: 'synora-student-demo', section: '開始之前', title: '手機怎麼用 Synora',
    notes: '學員手機怎麼用（約 1 分）。讓動畫跑一輪，邊播邊講三件事：一、相機掃 QR 或輸入加入碼 AIORRCFD 加入；二、我翻到投票或問答，你的手機會自動跳到同一頁，點一下就送出；三、看到 Prompt 卡按「複製」，回家貼給自己的 AI 就能用。講完直接進下一頁，馬上用手機回答第一個問題。',
    heading: '今天你的手機這樣用',
  }, {
    id: 'l-expect-1', layout: 'openTextPair', section: '開始之前', title: '開放問答：你想帶走什麼',
    notes: '學員期待 1/2（約 1 分，用第一節緩衝的時間）。請大家用手機回答，不用寫長，一兩句就好。邊等邊念幾則出來，告訴大家今天哪一段會回應到。Synora 連不上時，請大家在 Meet 聊天室打字。',
    heading: '開始之前，先聽聽你的（1/2）',
    questions: [['今天這 3 小時，你最想帶走什麼？', '例如：寫出像樣的自我介紹、做出自己的網站']],
  }, {
    id: 'l-expect-2', layout: 'openTextPair', section: '開始之前', title: '開放問答：想讓 AI 幫你解決什麼',
    notes: '學員期待 2/2（約 1 分，用第一節緩衝的時間）。一樣一兩句就好。念幾則出來；跟今天內容無關的，留到最後 QA 一起聊。Synora 連不上時，請大家在 Meet 聊天室打字。',
    heading: '開始之前，先聽聽你的（2/2）',
    questions: [['最近有什麼事讓你卡住，想試試看讓 AI 幫忙？', '例如：寫履歷沒頭緒、報告整理不完']],
  },
  's1', 's1-goal', 's1-login', 's1-paid', 's1-ai-exp',
  's1-problem', 's1-problem-reveal', {
    id: 'l-desc-title', layout: 'divider', section: '01 具體描述', title: '標題：具體描述',
    notes: '先秀大標題「具體描述」，停一拍再進例子：接下來這段講的就是它。',
    no: '概念', heading: '具體描述', sub: '把你要的講清楚，AI 才不用猜',
  },
  's1-drink', 's1-drink-reveal', 's1-gf-1', 's1-gf-2', 's1-gf-3',
  's1-interview',
  {
    id: 's1-interview-card', layout: 'copyFull', section: '01 具體描述', title: '看 AI 怎麼訪問我',
    tag: "講師示範 · 你只要看 · 卡片可以從手機複製帶走",
    heading: 'Prompt ①：看 AI 怎麼訪問我',
    cardTitle: '讓 AI 訪問你 → 複製帶回家 → 貼到聊天 AI',
    prompt: base.pages.find((p) => p.id === 's1-interview').prompt,
    notes: '把卡片貼給 Claude，現場回答前兩題，讓大家看 AI 一次問一題、答太短會追問；後面三題切到課前跑好的對話，直接看整理出來的「我的基本資料」和它追問的「？」。邊做邊講：AI 不會主動問，所以讓它來問你。這張卡大家可以從手機複製，回家自己跑一次約 25 分鐘。',
  },
  's1-save',
  {
    id: 'l-reader-title', layout: 'divider', section: '01 給誰看', title: '標題：給誰看',
    notes: '先秀大標題「給誰看」，停一拍再進例子：接下來這段講的就是它。',
    no: '概念', heading: '給誰看', sub: '先想清楚：誰會看？他最急著知道什麼？',
  },
  's2-typhoon-video', 's2-roof', 's2-typhoon', 's2-typhoon-poll', 's2-typhoon-reveal', 's2-interview', 's2-style', 's2-prompt-2',
  'break1',
  // 第二節：Skill＋改更好＋Context
  's2',
  {
    id: 'l-quiz-s2', layout: 'quizSet', section: '02 暖身', label: '暖身搶答',
    firstNote: `10:00 暖身搶答(3)。考第一節，學員用手機搶答。${CHAT}`,
    items: [
      ['「幫我寫自我介紹」為什麼寫得很空泛？', ['我什麼都沒說，AI 只能猜', 'AI 不夠聰明', '要付費版才會寫', '網路太慢'], 0],
      ['颱風天你打給 B 師傅，因為他的網站寫的是什麼？', ['你最需要知道的事', '最多的照片', '最炫的動畫', '最便宜的價格'], 0],
      ['聊天 AI 什麼時候會追問你？', ['你要它問的時候', '每次都會', '付費版才會', '永遠不會'], 0],
    ],
  },
  {
    id: 'l-skill-title', layout: 'divider', section: '02 Skill', title: '標題：Skill',
    notes: '先秀大標題「Skill」，停一拍再進例子：接下來這段講的就是它。',
    no: '概念', heading: 'Skill', sub: 'AI 的工作手冊',
  },
  {
    id: 'v-exact', layout: 'linkTask', section: '02 Skill', title: '短片：照字面做三明治',
    notes: '10:03 短片：照字面做三明治(1)。播放前一句：小孩寫步驟，爸爸完全照字面做。播 31 秒，笑完接：指令沒寫清楚，做的人只能照字面猜。AI 也一樣，所以要給它一本寫清楚的手冊。下一頁咖啡店就是這本手冊，在 AI 上叫 Skill。',
    tag: '短片 · 31 秒',
    heading: '照著指令做，為什麼還是做錯？',
    link: ['https://youtu.be/7vZ9bGW5WoI', '看短片', '在 YouTube 開啟'],
  },
  's2-skill-1', 's2-skill-2', 's2-skill-3', 's2-skill-4', 's2-skill-5', 's2-skill-6', 's2-skill-7',
  's2-skill-make', 's2-skill-save', 's2-skill-find',
  's3-reel',
  {
    id: 'l-reel-poll', layout: 'poll', section: '03 改更好', title: '投票：誰真的看過內容',
    notes: `短片播完先投票，算在短片的 3 分鐘裡。等長條圖出來再翻下一頁揭曉。${CHAT}`,
    question: '這一整圈，老師出題、學生寫、老師改，誰真的看過內容？',
    options: ['老師', '學生', 'AI', '沒有人'],
  },
  's3-reel-reveal', 's3-review', 's3-fix', ...SECURITY, 's3-public',
  {
    id: 'l-ctx-title', layout: 'divider', section: '03 Context', title: '標題：Context',
    notes: '先秀大標題 Context，停一拍再進八堂課的例子：接下來這段講的就是它。',
    no: '概念', heading: 'Context', sub: 'AI 這一輪看得到的範圍',
  },
  's3-ctx-classes', 's3-ctx-teachers', 's3-ctx-window', 's3-ctx-reveal', 's3-newchat',
  { id: 's2-qa', layout: 'qa', section: '02 改更好', title: '舉手 QA', notes: '10:41 舉手 QA(9)。', heading: '舉手 QA', sub: '到這裡有聽不懂的地方，現在問。' },
  'break2',
  // 第三節：上架＋我的學習系統
  's3',
  {
    id: 'l-quiz-s3', layout: 'quizSet', section: '03 回想', label: '回想搶答',
    firstNote: `11:00 回想搶答(1)。考第二節的 Context。${CHAT}`,
    items: [['對話越聊越長，AI 開始忘記前面講過的事，最好的做法是？', ['開新對話，只貼需要的東西', '一直往下問', '換付費版', '把整段對話重貼一次'], 0]],
  },
  {
    id: 'l-localhost', layout: 'reveal', section: '03 上線', title: '反諷：傳 localhost 給面試官',
    notes: '11:01 反諷：localhost(1)。情境：網站做好了，很得意地把網址傳給面試官，網址是 http://localhost:3000。先問台下：面試官打得開嗎？再翻出答案。收尾：localhost 的意思就是「我自己這台電腦」，別人永遠打不開。做好不等於上線，接下來看三種讓別人打得開的方式。',
    ask: '網站做好了！傳給面試官：http://localhost:3000',
    lead: '面試官：',
    punch: '打不開耶？',
    sub: 'localhost＝你自己這台電腦，別人永遠打不開',
  },
  ...VERCEL.slice(0, 1), 's3-drop', ...VERCEL.slice(1), ...JAPANESE.slice(0, 1),
  {
    id: 'l-pk-first', layout: 'linkTask', section: J, title: '先看成品：日文 PK 網站',
    notes: '11:14 先看成品(2)。打開日文 PK 網站，在畫面上玩幾秒。不要先解釋怎麼做的，只說：這個網站是我用今天同一套方法做出來的，也是用剛剛 GitHub 那種方式上線的。接下來看它是怎麼來的。最後 PK 時間會邀一位同學跟我對戰。',
    tag: '先看成品',
    heading: '這個網站，是怎麼做出來的？',
    link: ['https://japanes-pk.littleyao.me', '日文 PK 網站', '講師先玩幾秒給大家看'],
  },
  ...JAPANESE.slice(1),
  {
    id: 'l-your-turn', layout: 'wordcloud', section: J, title: '換你想：你想用這套方法做什麼',
    notes: `11:28 換你想(6)。請大家用手機在文字雲打一個詞：你想用基本資料＋Skill＋Context 做什麼？挑 3 個回應，現場講它的基本資料、Skill、Context 各會是什麼。沒人打就用備用例子：準備多益、記帳、寫社團企劃。Synora 連不上時，請大家在 Meet 聊天室打字。`,
    question: '你想用這套方法做什麼？（打一個詞）',
    maxWords: 3,
  },
  's3-recap',
  {
    id: 'jp-pk', layout: 'linkTask', section: J, title: '跟講師 PK',
    notes: '11:35 PK(10)。邀一位自願的同學用手機打開 japanes-pk.littleyao.me，跟講師對戰一局；講師分享自己的畫面，全班一起看。今天用的方法做出來的網站，最後一起玩一次。',
    tag: '自願一位 · 用手機就能玩',
    heading: '誰要來跟我 PK？',
    link: ['https://japanes-pk.littleyao.me', '日文 PK 網站', '用手機打開，跟講師同一局對戰'],
    items: ['自願的同學用手機打開網站', '跟講師同一局對戰', '大家看講師分享的畫面'],
  },
  'qa',
];

const DEMO = '講師示範 · 你只要看';
const PROMPT2 = base.pages.find((p) => p.id === 's2-prompt-2').prompt;

// 講稿開頭「HH:MM 名稱(分)」照聽課版時間表：第一節 47＋緩衝 3、第二節 50、第三節 50＋彈性 10
export const OVERRIDES = {
  // —— 第一節 ——
  cover: {
    notes: '進場時投影 Synora 加入碼 QR，請大家用手機加入，今天的 Prompt 都能從手機複製帶走。今天大家不用動手，看我從零做出一個求職網站，再讓它上線。',
    date: '北科大 AI 課 · 2026.11.26',
    subtitle: '說清楚你是誰 → 看 AI 做出求職網站 → 讓它上線',
    pills: [['text', '講清楚'], ['text', '做出來'], ['text', '上線']],
  },
  s1: { notes: '第一節 09:00–09:50。', sub: '看 AI 訪問我，做出網站 v1' },
  's1-outline': {
    notes: '09:02 課綱簡介＋秀終點(4)。今天三節，大家只要看、只要想，不用動手；每一張 Prompt 都能從手機複製帶回家。下一頁先看終點。',
    heading: '今天 3 小時：講清楚 → 改更好 → 上線',
    cards: [
      ['accent', '第一節｜講清楚＋做出來', '看 AI 為什麼回得空泛，讓 AI 訪問我，做出網站 v1'],
      ['accent', '第二節｜Skill＋改更好', '把做法收成 Skill，用讀者的眼光改成 v2，再認識 Context'],
      ['dark', '第三節｜上線＋我的學習系統', '三種方式讓網站上線，再看同一套方法怎麼拿來學日文'],
    ],
  },
  's1-goal': { heading: '今天你會看到，一個網站從零做到上線' },
  's1-login': {
    tag: '手機加入 Synora · 帶走今天的 Prompt',
    heading: '今天講師全程用付費版 Claude',
    notes: '09:06 加入＋講師用的 AI(3)。還沒加入 Synora 的現在用手機加入，等一下每張 Prompt 卡都能在手機上按複製帶走。今天我全程用付費版 Claude 示範；同樣的 Prompt 丟給 Codex 也做得到，免費的 Gemini 也可以先試。回家用免費版，額度比較少，今天會順便講怎麼省著用。',
    links: [[
      ['', 'https://claude.ai', 'Claude', '今天示範・講師用付費版'],
      ['', 'https://chatgpt.com/codex', 'Codex', '同樣的 Prompt 也做得到'],
      ['', 'https://gemini.google.com', 'Gemini', '免費版可以先試'],
    ]],
    dark: ['alert', '講師用的是付費版', '回家用免費版也做得到，只是額度較少；今天會教怎麼省著用'],
  },
  's1-ai-exp': {
    options: ['問問題', '寫報告／作業', '寫履歷或自傳', '還沒用過'],
    notes: `學員用手機複選。「還沒用過」多就講慢一點。${CHAT}`,
  },
  's1-paid': { options: ['ChatGPT 付費版', 'Gemini 付費版', 'Claude 付費版', '其他或都沒有'], notes: `09:09 投票兩題(2)。學員用手機複選，再現場問幾位：用哪一家、拿來做什麼。${CHAT}` },
  's2-typhoon-poll': { notes: `長條圖一面倒就是笑點。${CHAT}` },
  's1-gf-3': {
    layout: 'sameMove', mid: '同一招',
    left: { say: '好煩喔…', act: '你追問細節 → 她更氣', ok: false, verdict: '不解風情' },
    right: { say: '幫我寫自我介紹', act: '你給足細節 → 它才寫對', ok: true, verdict: '具體描述' },
    give: undefined,
    notes: '講稿：口述「你要主動給三件事：發生什麼事、要什麼結果、怎樣算做好」。人跟人之間，具體到附上 KPI 可能會被噴；但跟 AI 講話，越像我那晚那樣越好。聊天 AI 預設不追問，除非你要它問；它只會猜，猜出來就是剛剛那段誰都適用的自我介紹。銜接：所以下一頁，我讓 AI 反過來訪問我，把這些細節問出來。',
  },
  's1-problem': { caption: '一開始，對 AI Agent 只打一句目的', after: '然後就讓它自己跑', notes: '09:11 發現問題(4)。先講這個習慣：很多人一開始用 AI Agent，就是打一句目的、按 Enter，然後讓它自己跑。現場照做：切到 AI 畫面，只打「幫我寫自我介紹」，不給任何資料，讓它跑完，唸出結果。唸完直接接：這段放在誰身上都成立，所以這是在座每一個人的自我介紹。現場網路出狀況就放課前存好的截圖。' },
  's1-drink': { notes: '09:15 手搖飲(4)。你走進手搖飲店，只說「一杯奶茶」，店員只能照預設做。第二次多講兩個條件，第三次再換配料，才是你要的那杯。不滿意就再調一次。問台下：這跟剛剛那句「幫我寫自我介紹」像不像？' },
  's1-gf-1': { notes: '09:19 女朋友(4)，三頁依序揭曉。這是講師自己的一次經驗，不要講成男生都怎樣、女生都怎樣。講稿：我那時覺得自己很貼心，先蒐集需求、再量化程度，結果她差點當場炸開。（停一拍，讓台下笑完）' },
  's1-interview': {
    layout: 'opDemo', demo: 'prompt-anatomy-demo',
    title: '這張 Prompt 用了哪四招',
    tag: `${DEMO} · 8 分鐘`,
    heading: 'Prompt ①：這張卡用了哪四招',
    notes: '09:23 拆解＋示範訪問卡(8)。先讓動畫跑一輪（約 1 分鐘），講這張卡用了哪四招：給角色和用途、讓 AI 反過來發問（一次一題、附範例、太短就追問）、設護欄（不知道寫「？」、不編、不碰隱私）、固定欄位和輸出格式。下一頁是完整的卡片，接著現場示範。',
  },
  's1-save': { notes: '09:31 存副本(2)。動畫示範三步：整段複製 → 貼到手機備忘錄 → 標題寫「我的基本資料」。後面換工具、重開對話、做面試自介，都靠這一份；回家做的時候記得存。' },
  's2-typhoon-video': { link: ['https://www.youtube.com/shorts/qJVypjZNBF8', '看短片', '在 YouTube 開啟'], notes: '先問「颱風天，你最怕什麼？」再播短片暖場，笑完接下一頁講師家的屋頂。這兩頁加颱風題，算在「給誰看」的 5 分鐘裡，短片請控制在 1 分鐘內。' },
  's2-roof': {
    photos: [
      { src: jpg('roof-inside'), alt: '講師家的鐵皮屋頂（室內）', pos: 'center 15%' },
      { src: jpg('roof-outside'), alt: '講師家的鐵皮屋頂（室外）', pos: 'center 25%' },
    ],
  },
  's2-typhoon': { notes: '09:33 給誰看(5)。開頭承接：剛才是說清楚你要什麼，現在是想清楚誰在看。情境：颱風過後，你家屋頂被吹掉一塊，雨還在下。你搜「屋頂 緊急修繕」，跳出這兩個師傅的網站。兩個網站都是假的，店名和電話是編的。下一頁請大家用手機投票。' },
  's2-interview': { notes: '09:38 面試官在想什麼(1)。配合圖講：面試官打開網站只想知道兩件事，這個人做過類似的事嗎？能不能馬上上手？答案在職缺說明和公司官網查得到。把最對得上的專題放在第一眼。這就是 Prompt ② 第一格「給誰看」要想清楚的事。' },
  's2-style': { notes: '09:39 找風格(2)。風格說不出來很正常，先用看的。這 8 種都有名字，叫得出名字，AI 就做得出來。請台下喊一個，我就用它填進 Prompt ② 的「風格」空格。想看大圖和說明，點下面的 WPORT UI 風格。' },
  's2-prompt-2': {
    prompt: PROMPT2.replace('請用 Canvas（Claude 用 Artifact）', '請用 Artifact（Gemini、ChatGPT 用 Canvas）'),
    cardTitle: '帶回家做：複製後先填好空格再送出',
    tag: `${DEMO} · 7 分鐘 · 卡片可以從手機複製帶走`,
    heading: 'Prompt ②：看 AI 做出網站 v1',
    notes: '09:41 示範網站 v1(7)。在訪問的同一個對話貼上，現場填三個空格：給誰看填面試官、風格用台下剛剛喊的、最想讓對方記住的一件事。送出後 AI 開網頁預覽，等的時候問台下：你猜 v1 會長怎樣？超過 2 分鐘沒出來，就切到課前做好的 v1，不要乾等。',
  },
  break1: { notes: '休息 09:50–10:00。想先試的同學，可以用手機打開剛剛的訪問卡。' },
  // —— 第二節 ——
  s2: { notes: '第二節 10:00–10:50。', heading: 'Skill＋改更好', sub: '把做法收成 Skill，再把 v1 改成 v2' },
  's2-skill-1': { notes: '10:04 Skill(6)。（約 40 秒）想像一家咖啡店，客人說：「幫我做一杯拿鐵。」先看這位手上有店裡 SOP 的店員：步驟一樣、規則一樣，所以每一杯都比較像同一杯，還有餘力拉個愛心。要特別說清楚：有手冊不代表永遠不會失手，手冊是讓結果更穩定，不是保證百分之百正確。\n\n銜接：那如果把這本手冊拿走呢？切到「沒有 Skill」看看。' },
  's2-skill-make': {
    heading: '把剛剛的做法，整理成一份 Skill',
    tag: `${DEMO} · 3 分鐘 · 名稱＋說明＝Metadata，指示＝Instructions＋Rules`,
    notes: '10:10 示範做 Skill(3)。在做網站的那個對話貼上，讓 AI 從剛剛的對話整理成三欄：名稱、說明、指示。對回咖啡店第 5 頁：名稱和說明是 Metadata，指示是 Instructions，裡面的規則是 Rules。重點是「說明」那一句：寫清楚你說什麼的時候該用它，AI 就能自己判斷要不要拿出來。',
  },
  's2-skill-save': { demo: 'skill-save-demo-claude', heading: '把 Skill 收好', notes: '10:13 示範收好 Skill(1)。動畫依序示範：先把三欄存成文字放在基本資料副本旁邊；付費版 Claude 還可以把它建成真的 Skill。最後開新對話問「幫我做求職網站，先不要做，告訴我你會照哪些規則做」，AI 說得出規則就是成功。' },
  's2-skill-6': { notes: '（約 50 秒）客人說「幫我做一杯熱拿鐵」，這句話就是 Prompt。店員先聽懂需求：要熱的、要拿鐵。接著它去書架上找，發現有一本 make-latte 的手冊剛好符合，就打開 SKILL.md，照裡面的步驟和規則做。真正動手的時候要用設備，也就是 Tool，開咖啡機、打奶泡。最後檢查一下，確認沒問題再回報。整個流程記一句話：Prompt 說要做什麼，Skill 說怎麼做，Tool 負責真的做。兩個提醒：第一，Skill 會不會自動被找到，要看你用的 AI 平台怎麼設計；第二，如果 AI 手上沒有咖啡機這種工具，它只能教你怎麼做，沒辦法真的端出一杯咖啡。等一下我示範把手冊遞給 AI。\n\n銜接：咖啡只是例子，同一招可以用在你每天的生活和工作。' },
  's2-skill-7': { notes: '（約 1 分鐘）我常去同一家手搖飲，每次都點珍奶半糖少冰。去久了，店員一看到我就問「老樣子嗎？」我說對，他就直接做。這句「老樣子」就是 Skill 被啟動：店員是 Agent，手冊寫著珍奶半糖少冰。早上手搖飲那題點了三次才對，Skill 就是讓第四次只要說「老樣子」。\n\n銜接：發現自己對 AI 重複講同一段話，就該把它寫成 Skill。\n\n省額度第二招：把做法寫成手冊，就不用每次重打一大段。' },
  's2-skill-find': { notes: '10:14 Skill 去哪找(2)。自己做之外，也可以找別人做好的。技能市集上的 Skill 很多是給 Claude Code 這類工具用的，聊天 AI 不一定能直接裝；先逛、找靈感，照它的寫法改成你的。更簡單的方法：直接問你的 AI，請它幫你找。' },
  's3-reel': { notes: '10:16 短片：全部丟給 AI(3)，連同下一頁揭曉。這頁不放文字說明，先讓大家看。\n\n播放前：接下來要把網站改得更好。改之前，先看一支短片，看完我問大家一個問題。\n\n播完先不翻頁，問：這一整圈，老師出題、學生寫、老師改，誰真的看過內容？等台下回答「沒有人」，再翻下一頁。' },
  's3-reel-reveal': { notes: '點出重點：好笑的是，每個人都覺得自己有做事，其實只是把東西轉手。改網站也很容易變這樣：跟 AI 說「幫我改」，它改，你收下，結束。\n\n銜接下一頁：所以我會先自己看一眼網站，圈出最想改的一個地方，再請 AI 當讀者幫我挑。AI 可以給意見，最後決定改什麼的是自己。\n\n避開：不要講成「用 AI 寫作業不好」，今天整堂都在用 AI，重點是有沒有自己判斷；也不要點名或暗示在座的老師或學生。' },
  's3-review': {
    heading: 'Prompt ③：這次，我先看過',
    app: 'Claude',
    tag: `${DEMO} · 骨架版`,
    lines: [
      ['why', '你是 ＿＿＿＿＿＿，桌上有 30 份應徵資料，這個網站你只給 30 秒。', '填 Prompt ② 的讀者，例：要徵前端工程師的面試官'],
      ['bg', '每題一兩句：你記住了什麼？想跳過哪裡？還想知道什麼？'],
      ['bg', '最後只挑一處最該改的，說原因就好，先不要動網站。'],
    ],
    notes: '10:19 示範讀者審稿(4)。留在做網站的那個對話，照骨架現場打。先請台下幫我圈出 v1 最想改的一處，再看 AI 挑的，兩個對照。回扣女朋友第二輪：我第二次問完細節還是被噴，因為沒先想清楚對方要的是什麼。審稿就是先問讀者要什麼，再改。限一兩句、只挑一處，是為了讓回覆在畫面上讀得完；AI 只說原因不寫 fix:，下一頁的 fix: 由我自己寫。',
  },
  's3-fix': {
    heading: '看懂了，改哪裡我決定',
    app: 'Claude',
    tag: `${DEMO} · 只改一處`,
    notes: '10:23 示範 fix:(2)。用台下圈的那一處，現場寫一句 fix:、只改一處，預覽更新後就是 v2。它說得沒道理，就反問「為什麼？」。省額度：想改的地方先想好，一則訊息寫完再送，不要一句一句來回，也不要叫它整份重做。',
  },
  's3-public': {
    title: '資安：分享出去就是公開',
    heading: '資安：分享出去，就是公開',
    cards: [
      ['dark', '不要放上網站，也不要貼給 AI', '私人手機、身分證、住址、成績單\n密碼、公司或客戶的機密資料'],
      ['accent', '可以放', 'Email、LinkedIn\nGitHub、作品連結'],
    ],
    note: '分享連結沒有密碼，誰拿到都能打開；網站上線，全世界都看得到。',
    notes: '10:26 資安提醒(4)。兩件事。第一，分享就是公開：聊天 AI 的「分享」連結沒有密碼，誰拿到都能打開；網站上線後全世界都看得到，所以網站上不要放私人手機、身分證、住址、成績單。第二，貼給 AI 的資料也要挑：密碼、身分證字號、公司或客戶的機密不要貼進對話。今天的基本資料只放公開也無妨的內容，就是這個原因。',
  },
  's3-ctx-classes': { notes: '10:30 Context(7)。先問台下：一天上八堂課，第八堂剛下課，早上第一堂教了什麼？有的記得、有的模糊、有的完全想不起來，而且不是越早就一定越忘。對話越長，前面的內容越可能被忽略或擠掉。' },
  's3-ctx-window': { notes: '按「下一步」一則一則加，請大家看大螢幕。這個框就是 AI 這一輪看得到的全部。走到第七步：框塞滿了，最早的訪問問答沒有被送進去，AI 是真的看不到。最後一步：開新對話，只貼需要的東西，框很空。數字只是示意。' },
  's3-newchat': {
    tag: `${DEMO} · 4 分鐘 · 卡片可以從手機複製帶走`,
    notes: '10:37 示範開新對話(4)。開一個新對話，貼這張卡，填好面試的職缺，最後貼上基本資料副本。早上我只打「幫我寫自我介紹」，拿到一段誰都適用的話；現在同樣是自我介紹，因為給了它基本資料，它寫的就是我。回家做的時候，這段自介自己留著，面試前再拿出來改。',
  },
  break2: { notes: '休息 10:50–11:00。' },
  // —— 第三節 ——
  s3: { notes: '第三節 11:00–12:00。', heading: '上線＋我的學習系統', time: '11:00–12:00', sub: '三種方式讓網站上線，同一套方法拿來學日文' },
  's3-drop': {
    tag: DEMO,
    title: 'Drop：拖進去就上線',
    section: '03 上線',
    items: ['講師把剛剛做好的網站 v2 拖進這個頁面', '幾秒後拿到一個網址，手機也打得開', '沒登入的網址會過期；註冊免費帳號認領才會保留'],
    notes: '11:02 Drop 示範(8)。上架的是剛剛做的網站 v2。把 HTML 檔拖進 Vercel Drop，拿到網址，用手機打開給大家看。這就是開場那個網站的做法。提一句：沒登入的網址會過期，註冊免費帳號認領才會保留。',
  },
  's3-recap': {
    layout: 'three',
    heading: '回家帶走這三樣',
    cards: [
      ['accent', '四張 Prompt 卡', '手機上都能複製，回家自己跑一次'],
      ['accent', '一套流程', '講清楚 → 做 → 審 → 改，一輪不夠就再跑一輪'],
      ['dark', '三種上線方式', 'Drop、CLI、GitHub 推了就自動上線'],
    ],
    notes: '11:34 回顧(1)。今天跑了一圈問題迴圈：發現 AI 回得空泛 → 讓 AI 訪問、把自己講清楚 → 做出 v1 → 請讀者審稿 → 寫 fix 改成 v2 → 上線。手機上的 Prompt 卡都能帶回家，自己跑一次。課前把三站換成成品截圖。',
    shots: [
      ['第一節｜講清楚＋做出來（發現問題 → ① → ②）', '我的基本資料、網站 v1'],
      ['第二節｜Skill＋改更好（③ → ↺）', 'Skill、網站 v2'],
      ['第三節｜上線＋學習系統', '真網址、同一套方法學日文'],
    ],
    compareTitle: '回家帶走',
    compare: ['手機上的四張 Prompt 卡', '一套「講清楚 → 做 → 審 → 改」的流程', '三種讓網站上線的方式'],
  },
  qa: {
    notes: '11:45 QA(15)。最後秀聯絡方式：想繼續問、想看我後續的分享，掃 QR 追蹤我的 Instagram。沒人問可以提早下課。',
    sub: '現在，換你問了。',
    contact: { qr: readFileSync(new URL('assets/ig-qr.svg', import.meta.url), 'utf8'), label: '課後想問，追蹤我的 Instagram', handle: '@david.jhang.3979' },
  },
};

const byId = new Map(base.pages.map((p) => [p.id, p]));
const SECTION_STARTS = ['s1', 's2', 's3'];
let nth = 0;
// 搬了節次的頁，頁首「02 給誰看」要跟著改成聽課版的節次編號
// 2026-11-25 手機端：學生手機看到等比縮小的整張投影片，只放大這幾頁的字幕、步驟卡與步驟晶片（單頁樣式，其他頁不變）
const demoCss = (box, [t, s] = ['.rc .tt', '.rc .ss']) =>
  `#${box} .caption{font-size:18px}#${box} ${t}{font-size:17px}#${box} ${s}{font-size:13px;line-height:1.35;color:#6B6458}#${box} .rc.dark .ss{color:#c9c6bd}#${box} .btn{font-size:13px}`;
const CHIPS_CSS = '.chips span{font-size:17px;padding:5px 14px}.chips b{min-width:24px;height:24px;line-height:24px;border-radius:12px;font-size:15px}';
const CSS = {
  's1-save': demoCss('cpd', ['.step .t', '.step .s']),
  's1-interview': demoCss('pan'),
  's2-skill-save': demoCss('sks'),
  's2-skill-find': demoCss('skf'),
  'v-cli': demoCss('vcd'),
  'v-github': demoCss('vgh'),
  'jp-why': demoCss('jpw'),
  'jp-loop': demoCss('alp'),
  'jp-map': demoCss('jpm'),
  's1-interview-card': CHIPS_CSS,
  's2-skill-make': CHIPS_CSS,
  's3-newchat': CHIPS_CSS,
};

export const pages = ORDER.map((x) => {
  const raw = typeof x === 'string' ? { ...byId.get(x), ...OVERRIDES[x] } : x;
  const p = CSS[raw.id] ? { ...raw, css: CSS[raw.id] } : raw;
  if (SECTION_STARTS.includes(p.id)) nth += 1;
  return p.section?.match(/^0\d /) ? { ...p, section: `0${nth}${p.section.slice(2)}` } : p;
});
