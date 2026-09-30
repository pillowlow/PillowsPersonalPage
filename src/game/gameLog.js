export function gameLog(label, detail) {
  const line = detail === undefined
    ? `[game] ${label}`
    : `[game] ${label} ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
  console.log(line);
}
