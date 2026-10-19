import type { InteractionStatus, Nav, TeacherView } from '../shared/protocol.ts';
import type { LiveDeck } from './deck.ts';
import { createLiveStore, type LiveStore, setCurrentStore } from './store.ts';

type PresenterState = { index: number; stepIndex: number };

export function navFromPresenter(deck: LiveDeck, notes: (string | undefined)[], state: PresenterState): Nav {
  const index = Math.max(0, Math.min(deck.pages.length - 1, state.index));
  const page = deck.pages[index];
  return {
    pageId: page.id,
    step: state.stepIndex,
    teacherOnly: Boolean(page.teacherOnly),
    title: page.id,
    note: notes[index] ?? '',
    ...(page.interaction ? { interaction: page.interaction } : {}),
  };
}

export function shouldAutoOpen(deck: LiveDeck, iid: string | undefined, status: InteractionStatus | undefined): boolean {
  if (!iid || status !== 'idle') return false;
  return deck.interactions.find((i) => i.id === iid)?.kind === 'poll';
}

type BridgeOpts = {
  deck: LiveDeck;
  answers: Record<string, number>;
  notes: (string | undefined)[];
  apiBase: string;
};

let started: Promise<void> | null = null;

// 老師版：從 open-slide 播放器的 BroadcastChannel 讀頁碼/分步並上傳；手機遙控的翻頁指令再轉回播放器
export function startTeacherBridge(opts: BridgeOpts): Promise<void> {
  if (started) return started;
  started = run(opts);
  return started;
}

async function run({ deck, answers, notes, apiBase }: BridgeOpts) {
  const channel = new BroadcastChannel(`open-slide:presenter:${deck.deckId}`);
  let store: LiveStore | null = null;
  let lastNav: Nav | null = null;
  const defs = deck.interactions.map((d) => (d.id in answers ? { ...d, correct: answers[d.id] } : d));

  // 每題只自動開一次；reset 後要由老師手動開始
  const autoOpened = new Set<string>();
  const maybeAutoOpen = () => {
    const iid = lastNav?.interaction;
    if (!store || !iid || autoOpened.has(iid)) return;
    const view = store.getState().view as TeacherView | null;
    if (!view) return;
    if (shouldAutoOpen(deck, iid, view.interactions[iid]?.status)) {
      autoOpened.add(iid);
      store.send({ t: 'open', iid });
    }
  };

  const sendNav = (nav: Nav) => {
    if (!store) return;
    store.send({ t: 'nav', nav });
    maybeAutoOpen();
  };

  const connect = async () => {
    const res = await fetch(`${apiBase}/api/teacher/decks/${deck.deckId}/current`, { credentials: 'include' });
    const { code } = (await res.json()) as { code: string };
    store?.close();
    const ws = apiBase.replace(/^http/, 'ws');
    const next = createLiveStore({
      url: `${ws}/api/teacher/ws?code=${code}`,
      role: 'teacher',
      onOpen: () => {
        next.send({ t: 'define', defs });
        if (lastNav) next.send({ t: 'nav', nav: lastNav });
        channel.postMessage({ type: 'request-state' });
      },
      onRemote: (cmd) => {
        if (cmd === 'switch-session') void connect();
        else channel.postMessage({ type: cmd });
      },
    });
    next.subscribe(maybeAutoOpen);
    store = next;
    autoOpened.clear();
    setCurrentStore(next);
  };

  channel.addEventListener('message', (e: MessageEvent) => {
    const msg = e.data as { type?: string; state?: PresenterState };
    if (msg?.type !== 'state' || !msg.state) return;
    const nav = navFromPresenter(deck, notes, msg.state);
    if (lastNav && lastNav.pageId === nav.pageId && lastNav.step === nav.step) return;
    lastNav = nav;
    sendNav(nav);
  });

  await connect();
}
