import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layouts } from './html-layouts.mjs';
import { makeNative } from './native.mjs';
import { pages, palette } from './job-site-content.mjs';
import { esc } from './html-kit.mjs';

// 這幾頁已不在簡報裡，版型還留著；物件原樣取自改版前的內容檔，讓版型測試繼續有對象
const FIXTURES = {
  "s1-install-win": {
    "id": "s1-install-win",
    "layout": "copyMock",
    "section": "工具一次到位",
    "title": "安裝：Windows",
    "notes": "開始鍵輸入 PowerShell → 右鍵貼上 → Enter。winget 不能用的電腦，改走上一頁的官方安裝檔。跳出藍色警告：其他資訊 → 仍要執行。",
    "tag": "安裝 · Windows",
    "heading": "安裝：Windows 一行就好",
    "cardTitle": "複製 → 開始鍵輸入 PowerShell → 右鍵貼上 → Enter",
    "mockTitle": "Windows PowerShell",
    "mock": [
      [
        [
          "PS C:\\Users\\你> "
        ],
        [
          "在這裡按右鍵貼上 → Enter",
          "y"
        ]
      ],
      [
        [
          "正在安裝 Node.js …  "
        ],
        [
          "完成",
          "g"
        ]
      ],
      [
        [
          "正在安裝 OpenCode Desktop …  "
        ],
        [
          "完成",
          "g"
        ]
      ],
      [
        [
          "全部裝好：關掉 PowerShell，再打開一次",
          "m"
        ]
      ]
    ],
    "prompt": "winget install --id OpenJS.NodeJS.LTS -e; winget install --id SST.OpenCodeDesktop -e"
  },
  "s1-hello": {
    "id": "s1-hello",
    "layout": "copyMock",
    "section": "工具一次到位",
    "title": "OpenCode 打招呼＝檢查點",
    "notes": "09:36 打招呼卡＝全班檢查點(4)。OpenCode 左邊「新增專案」→ 選桌面的 my-site → 貼上 → 傳送 → 看懂再按「允許一次」。看到模型名稱、看到 我的基本資料.md、看到 node 版本號，三個都過就舉手。講師示範修最常見的錯：沒選對資料夾、node 找不到要重開。沒過的留給助教。",
    "tag": "全班檢查點 · 三個都過就舉手",
    "heading": "OpenCode 上工：三個都過就舉手",
    "cardTitle": "打招呼 → 複製 → 貼到 OpenCode → 傳送",
    "mockTitle": "OpenCode · my-site",
    "mock": [
      [
        [
          "你  ",
          "m"
        ],
        [
          "1 你是哪個模型？看得到哪些檔案？ 2 node 是什麼版本？"
        ]
      ],
      [
        [
          "需要權限 · Bash  node --version   ",
          "m"
        ],
        [
          "[ 允許一次 ]",
          "y"
        ]
      ],
      [
        [
          "AI  ",
          "m"
        ],
        [
          "我是 Gemini Flash Lite，看得到：我的基本資料.md",
          "g"
        ]
      ],
      [
        [
          "AI  ",
          "m"
        ],
        [
          "node 是 v22，可以開始了。",
          "g"
        ]
      ]
    ],
    "prompt": "1 你是哪個模型？看得到哪些檔案？\n2 node 是什麼版本？沒有的話告訴我，先不要裝"
  },
  "s1-vercel-login": {
    "id": "s1-vercel-login",
    "layout": "copyMock",
    "section": "工具一次到位",
    "title": "叫 OpenCode 登入 Vercel",
    "notes": "一律用 npx，不要 npm i -g（Mac 會要管理員密碼）。第一次跑 npx 要下載，約 30–60 秒。最後 1 分鐘拋懸念：休息後，換 AI 反過來訪問你。",
    "tag": "上線前準備",
    "heading": "叫 OpenCode 幫你登入 Vercel",
    "cardTitle": "登入 → 複製 → 貼到 OpenCode → 傳送 → 瀏覽器按授權",
    "mockTitle": "OpenCode · my-site",
    "mock": [
      [
        [
          "AI  ",
          "m"
        ],
        [
          "Vercel CLI 已可用，版本號出來了。"
        ]
      ],
      [
        [
          "AI  ",
          "m"
        ],
        [
          "請打開這個網址登入：",
          "g"
        ],
        [
          "https://vercel.com/…",
          "y"
        ]
      ],
      [
        [
          "你  ",
          "m"
        ],
        [
          "（瀏覽器按授權，回到 OpenCode）"
        ]
      ],
      [
        [
          "AI  ",
          "m"
        ],
        [
          "登入成功。",
          "g"
        ]
      ]
    ],
    "prompt": "1 跑 npx vercel@latest --version，看到版本號就好\n2 跑 npx vercel@latest login，把網址給我，我在瀏覽器登入"
  }
};
const page = (id) => FIXTURES[id] ?? pages.find((x) => x.id === id);
const run = (id) => {
  const p = page(id);
  return [p, layouts[p.layout](p, { palette, n: makeNative(p.id, palette.accent) })];
};

test('copyMock：膠囊、複製卡標題、loop', () => {
  const [p, r] = run('s1-install-win');
  assert.equal(r.loop, true);
  assert.match(r.body, /<b>1<\/b>複製[\s\S]*<b>4<\/b>Enter/);
  const cc = r.natives.filter((e) => e.type === 'copycard');
  assert.equal(cc.length, 1);
  assert.equal(cc[0].title, '安裝 · Windows');
  assert.equal(cc[0].content, p.prompt);
  assert.match(r.body, /PS C:\\Users\\你&gt;/);
  assert.match(r.body, /示意畫面/);
  assert.match(r.body, /class="done[^"]*"[^>]*>全部裝好/);
});

test('copyMock：s1-hello、s1-vercel-login 的卡名與膠囊', () => {
  const [, hello] = run('s1-hello');
  assert.equal(hello.natives[0].title, '打招呼');
  assert.match(hello.body, /<b>1<\/b>複製[\s\S]*<b>3<\/b>傳送/);
  assert.match(hello.body, /class="slot"[^>]*>\[ 允許一次 \]/);
  const [, login] = run('s1-vercel-login');
  assert.equal(login.natives[0].title, '登入');
  assert.match(login.body, /<b>4<\/b>瀏覽器按授權/);
});

test('copyMock：複製卡在畫面內且不壓到示意視窗', () => {
  for (const id of ['s1-install-win', 's1-hello', 's1-vercel-login']) {
    const [, r] = run(id);
    const cc = r.natives[0];
    const winLeft = Number(r.body.match(/class="win[^"]*" style="left:(\d+)px/)[1]);
    assert.ok(cc.x >= 0 && cc.y >= 150 && cc.y + cc.height <= 540, id);
    assert.ok(cc.x + cc.width <= winLeft, `${id} 複製卡壓到視窗`);
  }
});

// 頁面裡所有要給人看的字串（排除設定欄位、顏色代號、交給原生元件的欄位）
const SKIP = new Set(['id', 'layout', 'section', 'title', 'notes']);
// 說話者代號、圖示名稱是設定，不是要顯示的字
const CONFIG = new Set(['ai', 'me', 'chat', 'bot', 'alert', 'eye', 'tag', 'pen']);
const visibleStrings = (p, skip = []) => {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') { if (!(v in palette) && !CONFIG.has(v)) out.push(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  for (const [k, v] of Object.entries(p)) if (!SKIP.has(k) && !skip.includes(k)) walk(v);
  return out;
};
export const assertAllShown = (p, r, skip) => {
  for (const s of visibleStrings(p, skip)) assert.ok(r.body.includes(esc(s)), `${p.id} 少了「${s}」`);
};

test('代表頁：cover、rows、linkTask 文字齊全、不循環', () => {
  for (const id of ['cover', 's1-gf-3', 's3-drop']) {
    const [p, r] = run(id);
    assertAllShown(p, r, ['link']);
    assert.ok(!r.loop, id);
  }
});

test('linkTask：只有一個原生 link，網址與內容檔相同', () => {
  const [p, r] = run('s3-drop');
  assert.deepEqual(r.natives.map((e) => e.type), ['link']);
  assert.equal(r.natives[0].linkUrl, p.link[0]);
});

const STATIC = ['divider', 'story', 'reveal', 'bigPrompt', 'three', 'compare', 'grid', 'steps', 'loop', 'split', 'whoDoes', 'iconSplit', 'skillTemplate', 'break', 'qa', 'closing'];
const NATIVE_ONLY = { goalShot: ['link'], iconLinks: ['links'], iconSplit: ['link'], taskDownload: ['file'], copyFull: ['prompt', 'cardTitle'], copyPrompt: ['prompt', 'cardTitle'], siteMock: ['sites'], loop: ['shots'] };

test('靜態版型：所有頁文字齊全、不循環', () => {
  for (const p of pages.filter((x) => STATIC.includes(x.layout))) {
    const r = layouts[p.layout](p, { palette, n: makeNative(p.id, palette.accent) });
    assertAllShown(p, r, NATIVE_ONLY[p.layout]);
    assert.ok(!r.loop, p.id);
  }
});

test('loop：三站截圖框是原生 svg，標題在 HTML', () => {
  const [p, r] = run('s3-recap');
  assert.equal(r.natives.filter((e) => e.type === 'svg').length, 3);
  for (const [t] of p.shots) assert.ok(r.body.includes(esc(t)));
});

test('原生版型：每個要給人看的字在 HTML 或原生元件裡', () => {
  for (const p of pages.filter((x) => ['goalShot', 'iconLinks', 'copyFull', 'copyPrompt', 'taskDownload', 'siteMock', 'homework'].includes(x.layout))) {
    const r = layouts[p.layout](p, { palette, n: makeNative(p.id, palette.accent) });
    const all = r.body + JSON.stringify(r.natives);
    for (const s of visibleStrings(p, ['cardTitle', 'hwId'])) assert.ok(r.body.includes(esc(s)) || all.includes(JSON.stringify(s).slice(1, -1)) || s.split('\n').every((l) => all.includes(l)), `${p.id} 少了「${s}」`);
  }
});

test('copyMock：每輪都重新逐行出現（不靠 animation-delay，每行有自己的時間軸）', () => {
  for (const id of ['s1-install-win', 's1-hello', 's1-vercel-login']) {
    const [p, r] = run(id);
    assert.doesNotMatch(r.body, /animation-delay/, id);
    for (let i = 1; i < p.mock.length; i++) assert.match(r.body, new RegExp(`class="[^"]*\\bln r${i}\\b`), `${id} 第 ${i} 行`);
  }
});

test('skillTemplate：視窗標題可設定，沒給就寫「聊天 AI」', () => {
  const base = { tag: 't', heading: 'h', lines: [] };
  assert.match(layouts.skillTemplate({ ...base, app: 'Gemini' }, { palette }).body, /<\/i>Gemini</);
  assert.match(layouts.skillTemplate(base, { palette }).body, /<\/i>聊天 AI</);
});
