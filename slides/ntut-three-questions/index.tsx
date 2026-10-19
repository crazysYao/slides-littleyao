// 學生版：學生用手機或電腦開這頁作答。老師版在 teacher-slides/ntut-three-questions。
import type { SlideMeta } from '@open-slide/core';
import { makeStudentDeck } from '../../live/client/StudentShell.tsx';
import { deck, design, meta as contentMeta } from './content.tsx';

export { design };

export const meta: SlideMeta = contentMeta;

export default makeStudentDeck(deck, design);
