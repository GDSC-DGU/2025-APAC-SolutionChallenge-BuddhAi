import styled from 'styled-components';

interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: string; 
  textColor?: string; 
}

export default function CommonButton({ text, onClick, color = 'linear-gradient(to right, #B020D3, #0970E7)', textColor = '#FFFFFF' }: ButtonProps) {
  return (
    <StyledButton style={{ background: color, color: textColor }} onClick={onClick}>
      {text}
    </StyledButton>
  );
}

const StyledButton = styled.button`
 font-family: var(--font-main);
  width: 300px;
  height: 48px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 200;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  opacity: 0.35;

  &:hover {
    opacity: 0.9;
  }
`;
