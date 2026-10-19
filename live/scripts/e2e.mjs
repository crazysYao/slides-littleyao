// 本機端到端：老師版(wrangler dev 8787)＋手機遙控＋學生(open-slide dev 5173)
// 需求：pnpm build:teacher、pnpm dev:worker、pnpm dev 都已啟動
// 執行：PLAYWRIGHT_PATH=<playwright index.mjs> SHOTS=<截圖資料夾> node live/scripts/e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright');
const TEACH = process.env.TEACH_BASE ?? 'http://localhost:8787';
const STUDENT = process.env.STUDENT_BASE ?? 'http://localhost:5173/s';
const SHOTS = process.env.SHOTS ?? '.';
const DECK = 'ntut-three-questions';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const ok = (c, m) => {
  console.log(c ? 'PASS' : 'FAIL', m);
  if (!c) failed++;
};

// 每次都從新場次開始，避免沿用上一輪已公布的題目
await fetch(`${TEACH}/api/teacher/decks/${DECK}/sessions`, { method: 'POST', headers: { Origin: TEACH } });

const b = await chromium.launch({ channel: 'chrome' });
const errors = [];
const watch = (p, who) => p.on('pageerror', (e) => errors.push(`${who}: ${e.message}`));

const teacher = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
watch(teacher, 'teacher');
await teacher.goto(`${TEACH}/s/${DECK}`);
await teacher.waitForTimeout(2500);
await teacher.keyboard.press('f');
await teacher.waitForTimeout(1500);

const remote = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
watch(remote, 'remote');
await remote.goto(`${TEACH}/s/live-remote`);
await remote.getByText('手機遙控').first().waitFor();
await remote.waitForTimeout(1500);
const code = (await (await fetch(`${TEACH}/api/teacher/decks/${DECK}/current`)).json()).code;
ok(/^[A-Z2-9]{6}$/.test(code), `場次代碼 ${code}`);

async function student(name, viewport) {
  const ctx = await b.newContext({ viewport });
  const p = await ctx.newPage();
  watch(p, name);
  await p.goto(`${STUDENT}/${DECK}?s=${code}`);
  await p.getByLabel('暱稱').fill(name);
  await p.getByRole('button', { name: '加入' }).click();
  return { ctx, p };
}
const s1 = await student('手機一', { width: 390, height: 844 });
const s2 = await student('手機二', { width: 390, height: 844 });
const s3 = await student('電腦', { width: 1440, height: 900 });
await sleep(1500);
ok(await remote.getByText('3 人').isVisible(), '遙控看到 3 人加入');

const currentPage = async () => (await remote.getByText(/^目前頁：/).innerText()).replace('目前頁：', '').split(' · ')[0].trim();
async function gotoPage(id, max = 120) {
  for (let i = 0; i < max; i++) {
    if ((await currentPage()) === id) return true;
    await teacher.keyboard.press('ArrowRight');
    await sleep(120);
  }
  return false;
}

// 投票：翻頁同步＋自動開題
ok(await gotoPage('s1-poll-hands'), '老師翻到第一題投票');
const t0 = Date.now();
await s1.p.getByRole('button', { name: /常常/ }).waitFor({ timeout: 3000 });
ok(Date.now() - t0 < 1000, `學生 1 秒內跟上並出現作答按鈕(${Date.now() - t0}ms)`);
await s1.p.getByRole('button', { name: /^A\s*有$/ }).click();
await s2.p.getByRole('button', { name: /常常/ }).click();
await s3.p.getByRole('button', { name: /常常/ }).click();
await sleep(800);
ok((await teacher.getByText('已作答 3 / 加入 3').count()) > 0, '投影顯示已作答 3 人');
ok((await s1.p.getByText('%').count()) === 0, '學生公布前看不到比例');
await teacher.screenshot({ path: `${SHOTS}/e2e-teacher-poll.png` });
await remote.getByRole('button', { name: '公布結果' }).click();
await sleep(800);
ok((await s1.p.getByText('67%').count()) > 0, '遙控公布後學生看到比例');
await s1.p.screenshot({ path: `${SHOTS}/e2e-phone-poll.png` });
await remote.screenshot({ path: `${SHOTS}/e2e-remote-poll.png` });

// 分步同步(投票解析頁)
ok(await gotoPage('s1-vote-analysis'), '翻到投票解析');
await sleep(600);
const hint = s1.p.getByText('B 好在：有背景、有目標');
ok(!(await hint.isVisible()), '老師未按前學生看不到解析');
await remote.getByRole('button', { name: '下一步 →' }).click();
await hint.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
ok(await hint.isVisible(), '遙控按下一步後學生看到解析');

// 搶答
ok(await gotoPage('s2-quiz-warmup-1'), '翻到暖身搶答第 1 題');
await sleep(600);
await remote.getByRole('button', { name: '開始作答' }).click();
await sleep(600);
await s1.p.getByRole('button', { name: /勇氣/ }).click();
await s2.p.getByRole('button', { name: /時間/ }).click();
await sleep(400);
await s3.p.getByRole('button', { name: /勇氣/ }).click();
await sleep(600);
ok((await teacher.getByText('%').count()) === 0, '搶答公布前投影不顯示比例');
await teacher.screenshot({ path: `${SHOTS}/e2e-teacher-quiz.png` });
await remote.getByRole('button', { name: '結束作答' }).click();
await remote.getByRole('button', { name: '公布結果' }).click();
await sleep(800);
ok(await s1.p.getByText('答對了！').isVisible(), '學生看到答對');
ok(await s2.p.getByText('答錯了').isVisible(), '學生看到答錯');
await remote.getByRole('button', { name: '排行榜' }).click();
await sleep(800);
ok(await s1.p.getByText('你是第 1 名').isVisible(), '最快答對的學生第 1 名');
ok(await s3.p.getByText('你是第 2 名').isVisible(), '較慢答對的學生第 2 名');
await teacher.screenshot({ path: `${SHOTS}/e2e-teacher-leader.png` });
await s1.p.screenshot({ path: `${SHOTS}/e2e-phone-leader.png` });

// Demo(老師專屬)
ok(await gotoPage('demo'), '翻到 Demo');
await sleep(600);
ok(await s1.p.getByText('老師正在示範').isVisible(), '學生顯示老師正在示範');
ok((await s1.p.getByText('Demo：這堂課是怎麼備出來的').count()) === 0, '學生看不到 Demo 內容');
ok((await remote.getByText('學生看不到').count()) > 0, '遙控提示這頁學生看不到');
ok((await remote.getByText(/展示備課對話/).count()) > 0, '遙控顯示講稿');

// 自己翻
await s3.p.getByRole('button', { name: '自己翻' }).click();
await sleep(300);
ok(await s3.p.getByRole('button', { name: '下一頁' }).isDisabled(), '自己翻不能超過老師');
await s3.p.getByRole('button', { name: '上一頁' }).click();
await sleep(300);
await s3.p.getByRole('button', { name: '回到老師目前頁' }).click();
await sleep(300);
ok(await s3.p.getByText('老師正在示範').isVisible(), '回到跟隨後回到老師目前頁');

// 斷線重連
await s2.ctx.setOffline(true);
await sleep(3000);
await s2.ctx.setOffline(false);
await sleep(8000);
ok(await s2.p.getByText('手機二').first().isVisible(), '重連後不需重輸暱稱');
ok((await s2.p.getByLabel('暱稱').count()) === 0, '重連後沒有出現暱稱輸入框');
ok((await remote.getByText('3 人').count()) > 0, '重連後人數不變');

ok(errors.length === 0, `沒有頁面錯誤 ${errors.join(' | ')}`);
await b.close();
console.log(failed ? `E2E FAILED (${failed})` : 'E2E OK');
process.exit(failed ? 1 : 0);
