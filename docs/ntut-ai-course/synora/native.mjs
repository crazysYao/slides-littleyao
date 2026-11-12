// 原生互動元件：欄位與 build-deck.mjs 相同（那支載入即執行，不能 import，所以複製過來），多吃位置與大小。
const FULL = [70, 54, 820, 476];

export const makeNative = (slideId, accent = '#f5b400') => {
  let seq = 0;
  const el = (type, props) => ({ id: `${slideId}-${type}-${++seq}`, type, ...props });
  const opts = (prefix, list, extra = () => ({})) => list.map((text, i) => ({ id: `${prefix}-opt${i + 1}`, text, ...extra(i) }));

  return {
    poll: (question, options, multiSelect = false, [x, y, width, height] = FULL) =>
      el('poll', { x, y, width, height, question, options: opts(slideId, options), multiSelect, maxSelect: 0 }),
    quiz: (question, options, correct, [x, y, width, height] = FULL) =>
      el('quiz', {
        x, y, width, height, question,
        options: opts(slideId, options, (i) => ({ correct: i === correct })),
        multiple: false, points: 5, speedBonus: true, speedDecay: 0.02,
      }),
    link: (x, y, width, height, [linkUrl, linkLabel, linkDesc]) =>
      el('link', { x, y, width, height, linkUrl, linkLabel, linkDesc, linkColor: accent, linkIcon: 'open_in_new', linkImage: '' }),
    copycard: (x, y, width, height, title, content) => el('copycard', { x, y, width, height, title, content, copied: false }),
    fileDownload: (x, y, width, height, [fileUrl, fileName, fileSize, fileType]) =>
      el('fileDownload', { x, y, width, height, fileUrl, fileName, fileSize, fileType }),
    wordcloud: (question, maxWords, [x, y, width, height] = FULL) => el('wordcloud', { x, y, width, height, question, maxWords }),
    webProject: (question, enabledMethods = ['upload', 'url'], [x, y, width, height] = FULL) =>
      el('webProject', { x, y, width, height, question, enabledMethods, showVoting: true, peerVoteCount: 3 }),
    // showcase 以 linkedHomeworkId 綁定 homework，所以 homework 的 id 由內容檔指定
    homework: (id, x, y, width, height, title, description) => ({
      ...el('homework', { x, y, width, height, title, modeLabel: '全功能', description, submissionMode: '' }),
      id,
    }),
    showcase: (title, linkedHomeworkId, [x, y, width, height] = FULL) =>
      el('showcase', { x, y, width, height, title, points: 5, focusMode: false, showVoting: true, peerVoteCount: 3, linkedHomeworkId }),
    // 截圖佔位框：留原生 svg，講師課前在 Synora 直接換成真截圖
    shotFrame: (x, y, w, h, caption, muted = '#62646b', ink = '#16161a') => {
      const e = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return el('svg', {
        x, y, width: w, height: h, src: '', label: '',
        svgContent:
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
          `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="#fff" stroke="${muted}" stroke-width="2" stroke-dasharray="8 6"/>` +
          `<text x="${w / 2}" y="${h / 2 - 2}" font-size="15" fill="${ink}" text-anchor="middle" font-family="sans-serif" font-weight="bold">${e(caption)}</text>` +
          `<text x="${w / 2}" y="${h / 2 + 20}" font-size="12" fill="${muted}" text-anchor="middle" font-family="sans-serif">課前放入截圖</text></svg>`,
      });
    },
  };
};
