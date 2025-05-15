import { useState } from 'react';
import { TextChar, StyledInput } from './keyBoard.styles';
import { useSuggestion } from '../sidepanel/hooks/useSuggestion';

type CircularSelectorProps = {
  onWordComplete?: (word: string) => void;
};

const groups = [
  [
    '@',
    '+',
    '-',
    '*',
    ...Array.from({ length: 13 }, (_, i) => String.fromCharCode(65 + i)),
  ],
  [
    '@',
    '+',
    '-',
    '*',
    ...Array.from({ length: 13 }, (_, i) => String.fromCharCode(78 + i)),
  ],
  ['@', '+', '-', '*', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
];

export default function CircularSelector({
  onWordComplete,
}: CircularSelectorProps) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const currentGroup = groups[groupIndex];

  // 🔽 추천어 가져오기
  const suggestion = useSuggestion(inputValue);

  const handleCharClick = (char: string) => {
    if (char === '*') {
      setGroupIndex((prev) => (prev + 1) % groups.length);
    } else if (char === '-') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (char === '+') {
      if (inputValue.trim()) {
        onWordComplete?.(inputValue);
        setInputValue('');
      }
    } else if (char === '@') {
      // 🔽 @ 클릭 시 추천어 확정
      if (suggestion && suggestion !== inputValue) {
        onWordComplete?.(suggestion);
        setInputValue('');
      }
    } else {
      setInputValue((prev) => prev + char);
    }
  };

  const radius = 110;
  const centerX = 133.5;
  const centerY = 139;

  return (
    <svg
      width="267"
      height="273"
      viewBox="0 0 267 273"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M266.175 136.5C266.175 211.887 206.59 273 133.087 273C59.5853 273 0 211.887 0 136.5C0 61.1131 59.5853 0 133.087 0C206.59 0 266.175 61.1131 266.175 136.5ZM45.6107 136.5C45.6107 186.051 84.7754 226.22 133.087 226.22C181.4 226.22 220.564 186.051 220.564 136.5C220.564 86.9491 181.4 46.7802 133.087 46.7802C84.7754 46.7802 45.6107 86.9491 45.6107 136.5Z"
        fill="url(#paint0_linear_149_27)"
        fillOpacity="0.1"
      />
      <defs>
        <linearGradient
          id="paint0_linear_149_27"
          x1="133.087"
          y1="0"
          x2="133.087"
          y2="273"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B020D3" />
          <stop offset="1" stopColor="#0970E7" />
        </linearGradient>
      </defs>

      <foreignObject x={centerX - 40} y={centerY - 15} width={80} height={40}>
        {suggestion && suggestion !== inputValue && (
          <StyledInput>
            <span>{inputValue}</span>
            <span style={{ color: 'rgba(9, 112, 231, 0.61)' }}>
              {suggestion.slice(inputValue.length)}
            </span>
          </StyledInput>
        )}
      </foreignObject>

      {/* 문자 버튼들 */}
      {currentGroup.map((char, idx) => {
        const angle = (2 * Math.PI * idx) / currentGroup.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return (
          <TextChar
            key={`${char}-${idx}`}
            x={x}
            y={y}
            onClick={() => handleCharClick(char)}
          >
            {char}
          </TextChar>
        );
      })}
    </svg>
  );
}
