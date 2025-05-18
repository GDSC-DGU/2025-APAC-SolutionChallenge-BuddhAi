import { useMemo } from 'react';
import Fuse from 'fuse.js';

const dummyPhrases = [
  "Send an email to asw4ever@naver.com with the subject 'Hi' and message 'How are you'",
  'Show me the latest news articles',
  'Open Gmail',
  'Google',
];

const fuse = new Fuse(dummyPhrases, {
  includeScore: true,
  threshold: 0.4,
});

export const useSuggestion = (spokenText: string): string => {
  return useMemo(() => {
    if (!spokenText.trim()) return '';

    const result = fuse.search(spokenText.trim());
    return result.length > 0 ? result[0].item : '';
  }, [spokenText]);
};
