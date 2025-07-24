import React from 'react';

function parseEmotesInText(
  text: string,
  lineIndex: number,
  baseIndex: number,
  insideSpoiler: boolean = false
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const emotesRegex = /\[7tv\](.*?)\[\/7tv\]/g;
  let lastIndex = 0;
  let match;

  while ((match = emotesRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <img
        key={`emote-${lineIndex}-${baseIndex}-${parts.length}`}
        src={match[1]}
        alt="emote"
        className={`inline-block h-6 mx-1 align-middle ${
          insideSpoiler ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''
        }`}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function parseReview(text: string) {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const spoilerRegex = /\[spoiler\](.*?)\[\/spoiler\]/g;
    let spoilerMatch;

    while ((spoilerMatch = spoilerRegex.exec(line)) !== null) {
      if (spoilerMatch.index > lastIndex) {
        const textBefore = line.slice(lastIndex, spoilerMatch.index);
        parts.push(...parseEmotesInText(textBefore, lineIndex, parts.length));
      }

      const spoilerContent = spoilerMatch[1];
      const spoilerParts = parseEmotesInText(spoilerContent, lineIndex, parts.length, true);

      parts.push(
        <span
          key={`spoiler-${lineIndex}-${parts.length}`}
          className="bg-white/5 text-transparent hover:text-current transition-colors cursor-pointer px-1 rounded inline-block break-words max-w-full group"
        >
          {spoilerParts}
        </span>
      );

      lastIndex = spoilerMatch.index + spoilerMatch[0].length;
    }

    if (lastIndex < line.length) {
      const remainingText = line.slice(lastIndex);
      parts.push(...parseEmotesInText(remainingText, lineIndex, parts.length));
    }

    result.push(...parts);

    if (lineIndex < lines.length - 1) {
      result.push(<br key={`br-${lineIndex}`} />);
    }
  });

  return result;
}
