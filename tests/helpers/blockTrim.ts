export default function blockTrim(text: string) {
  const lines = text.split('\n').map(
    line => line.trim() === '' ? '' : line,
  );

  while (lines[0].trim() === '') {
    lines.shift();
  }

  while (lines.at(-1)?.trim() === '') {
    lines.pop();
  }

  let minIndent = Infinity;

  for (const line of lines) {
    if (line === '') {
      continue;
    }

    let indent = 0;

    while (line[indent] === ' ') {
      indent++;
    }

    if (indent < minIndent) {
      minIndent = indent;
    }
  }

  return lines.map(
    line => line.slice(minIndent),
  ).join('\n');
}
