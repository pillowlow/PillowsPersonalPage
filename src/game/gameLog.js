export function gameLog(label, detail) {
  const line = detail === undefined
    ? `[game] ${label}`
    : `[game] ${label} ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(line);
  if (typeof window !== 'undefined') {
    const bucket = window.__gameLog ?? [];
    bucket.push(line);
    if (bucket.length > 80) bucket.shift();
    window.__gameLog = bucket;
  }
}
