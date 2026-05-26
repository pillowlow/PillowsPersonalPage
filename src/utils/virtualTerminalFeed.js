import terminalData from '../data/virtualTerminal.json';

const INTRO_COLOR = terminalData.palette?.porcelain_blue ?? '#2F5F9E';

function buildFeed() {
  const intro = {
    text: terminalData.marquee_sequence?.[0] ?? terminalData.title ?? '',
    color: INTRO_COLOR,
  };

  const fruits = (terminalData.fruits ?? []).map((fruit) => ({
    text: fruit.marquee_text ?? `${fruit.name_en} // ${fruit.name_zh}`,
    color: fruit.color ?? INTRO_COLOR,
  }));

  return [intro, ...fruits];
}

export const VIRTUAL_TERMINAL_FEED = buildFeed();
