import styled, { keyframes } from 'styled-components';

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  background-color: #fff;
`;

export const LogoWrapper = styled.div`
`;

export const TextBox = styled.div`
  text-align: center;
  margin-top: 2rem;
  min-height: 80px;
  line-height: 1.5;
`;

export const Text = styled.p`
  font-size: 1.2rem;
  font-family: var(--font-main);
  font-style: italic;
  font-weight: 200;
  margin: 0.25rem 0;
`;

export const TypingText = styled.p`
  font-size: 1.2rem;
  font-family: var(--font-main);
  font-style: italic;
  font-weight: 200;
  margin: 0.25rem 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  opacity: 1;
`;

export const Gaze = styled.span`
 color: #B020D3;

`;

export const Voice = styled.span`
 color: #0970E7;

`;

export const ButtonWrapper = styled.div`
animation: ${scaleIn} 0.8s ease-out forwards;
margin-top: 3rem;
`;
