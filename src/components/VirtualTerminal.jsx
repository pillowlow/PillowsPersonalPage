import { useEffect, useMemo, useRef, useState } from 'react';
import { VIRTUAL_TERMINAL_FEED } from '../utils/virtualTerminalFeed';

const VISIBLE_LINES = 4;
const CHAR_MS = 28;
const LINE_PAUSE_MS = 650;

function formatTerminalTimestamp(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
}

export default function VirtualTerminal() {
  const [lines, setLines] = useState([]);
  const lineIdRef = useRef(0);
  const [activeLine, setActiveLine] = useState({
    text: '',
    color: VIRTUAL_TERMINAL_FEED[0]?.color ?? '#F4F4F4',
    timestamp: '',
  });
  const [showCursor, setShowCursor] = useState(true);
  const entryIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const activeTimestampRef = useRef('');
  const pauseUntilRef = useRef(0);
  const viewportRef = useRef(null);
  const scrollRef = useRef(null);

  const feed = useMemo(() => VIRTUAL_TERMINAL_FEED, []);

  useEffect(() => {
    const blink = window.setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => window.clearInterval(blink);
  }, []);

  useEffect(() => {
    if (feed.length === 0) return undefined;

    const tick = () => {
      const now = performance.now();
      if (now < pauseUntilRef.current) return;

      const entry = feed[entryIndexRef.current % feed.length];
      const fullText = entry.text ?? '';
      const nextCharIndex = charIndexRef.current + 1;

      if (nextCharIndex <= fullText.length) {
        if (charIndexRef.current === 0) {
          activeTimestampRef.current = formatTerminalTimestamp();
        }
        charIndexRef.current = nextCharIndex;
        setActiveLine({
          text: fullText.slice(0, nextCharIndex),
          color: entry.color,
          timestamp: activeTimestampRef.current,
        });
        return;
      }

      setLines((prev) => {
        lineIdRef.current += 1;
        const next = [
          ...prev,
          {
            id: lineIdRef.current,
            text: fullText,
            color: entry.color,
            timestamp: activeTimestampRef.current || formatTerminalTimestamp(),
          },
        ];
        return next.length > VISIBLE_LINES ? next.slice(-VISIBLE_LINES) : next;
      });
      activeTimestampRef.current = '';
      setActiveLine({
        text: '',
        color: feed[(entryIndexRef.current + 1) % feed.length]?.color ?? entry.color,
        timestamp: '',
      });

      entryIndexRef.current = (entryIndexRef.current + 1) % feed.length;
      charIndexRef.current = 0;
      pauseUntilRef.current = now + LINE_PAUSE_MS;
    };

    const id = window.setInterval(tick, CHAR_MS);
    return () => window.clearInterval(id);
  }, [feed]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const scroll = scrollRef.current;
    if (!viewport || !scroll) return;

    const overflow = scroll.scrollHeight - viewport.clientHeight;
    viewport.scrollTop = Math.max(0, overflow);
  }, [lines, activeLine.text]);

  const displayLines = lines.slice(-VISIBLE_LINES);

  return (
    <div className="virtual-terminal" aria-label="Virtual terminal">
      <div className="virtual-terminal__viewport" ref={viewportRef}>
        <div className="virtual-terminal__scroll" ref={scrollRef}>
          {displayLines.map((line) => (
            <p key={line.id} className="virtual-terminal__line">
              <span className="virtual-terminal__time">{line.timestamp}</span>
              <span className="virtual-terminal__message" style={{ color: line.color }}>
                {line.text}
              </span>
            </p>
          ))}
          <p className="virtual-terminal__line virtual-terminal__line--active">
            {activeLine.timestamp ? (
              <span className="virtual-terminal__time">{activeLine.timestamp}</span>
            ) : null}
            <span className="virtual-terminal__message" style={{ color: activeLine.color }}>
              {activeLine.text}
              <span className={`virtual-terminal__cursor${showCursor ? ' is-visible' : ''}`} aria-hidden>
                ▌
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
