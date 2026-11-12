import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, splitSteps, chips, pageHtml } from './html-kit.mjs';

test('esc 跳脫特殊字元並轉換行', () => {
  assert.equal(esc('PS C:\\Users\\你> a&b "x"\n下一行'), 'PS C:\\Users\\你&gt; a&amp;b &quot;x&quot;<br>下一行');
});

test('splitSteps：第一段是「複製」時沒有卡名，用 fallback', () => {
  assert.deepEqual(splitSteps('複製 → 開始鍵輸入 PowerShell → 右鍵貼上 → Enter', '安裝 · Windows'), {
    label: '安裝 · Windows',
    steps: ['複製', '開始鍵輸入 PowerShell', '右鍵貼上', 'Enter'],
  });
});

test('splitSteps：第一段不是「複製」就當卡名', () => {
  assert.deepEqual(splitSteps('打招呼 → 複製 → 貼到 OpenCode → 傳送', 'x'), { label: '打招呼', steps: ['複製', '貼到 OpenCode', '傳送'] });
  assert.deepEqual(splitSteps('讓 AI 訪問你 → 貼到 ChatGPT 或 Gemini → 一題一題回答', 'x'), {
    label: '讓 AI 訪問你',
    steps: ['貼到 ChatGPT 或 Gemini', '一題一題回答'],
  });
});

test('splitSteps：沒有箭頭就原樣當卡名、無步驟', () => {
  assert.deepEqual(splitSteps('複製後，先填好三個空格再送出', 'x'), { label: '複製後，先填好三個空格再送出', steps: [] });
});

test('chips 依序編號', () => {
  const h = chips(['複製', '傳送']);
  assert.match(h, /<b>1<\/b>複製/);
  assert.match(h, /<b>2<\/b>傳送/);
});

test('pageHtml：有 reduced-motion、capture、無外部資源、非 loop 頁沒有 infinite', () => {
  const h = pageHtml({ brand: 'B', section: 'S', palette: { accent: '#f5b400' }, body: '<h1>t</h1>' });
  assert.match(h, /prefers-reduced-motion:\s*reduce/);
  assert.match(h, /__SYNORA_CAPTURE__/);
  assert.doesNotMatch(h, /<link|<script[^>]+src|url\(\s*["']?http/);
  assert.doesNotMatch(h, /infinite/);
  assert.match(h, /B · S/);
});

test('pageHtml：loop 頁才帶 infinite', () => {
  assert.match(pageHtml({ brand: 'B', section: 'S', palette: {}, body: '', loop: true }), /infinite/);
});

test('pageHtml：loop 頁截圖時動作格顯示亮起狀態', () => {
  assert.match(pageHtml({ brand: 'B', section: 'S', palette: {}, body: '', loop: true }), /\.cap \.slot\{background:/);
});
