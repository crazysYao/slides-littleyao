import type { OpenSlideConfig } from '@open-slide/core';
import { zhTW } from '@open-slide/core/locale';

declare const process: { env: Record<string, string | undefined> };

// 老師版另外建置：OPEN_SLIDE_SLIDES_DIR=teacher-slides(見 package.json 的 build:teacher)
const openSlideConfig: OpenSlideConfig = { locale: zhTW, slidesDir: process.env.OPEN_SLIDE_SLIDES_DIR ?? 'slides' };

export default openSlideConfig;
