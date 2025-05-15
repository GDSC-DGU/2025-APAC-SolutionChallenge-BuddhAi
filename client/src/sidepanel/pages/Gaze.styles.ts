import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 70px;
`;

export const StyledVideo = styled.video`
  width: 1px;
  height: 1px;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: -1;
`;

export const SubmitButton = styled.button`
  font-size: 1.1rem;
  background-color: rgba(163, 199, 243, 0.3);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  width: 267px;
  height: 46px;
  font-family: var(--font-main);
  font-weight: 400;
  transition: background-color 0.1s ease;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #a6c0de;
  }
`;

export const Submit = styled.div`
  textalign: 'center';
`;

export const SubmitWord = styled.span`
  font-size: 1.3rem;
  font-family: var(--font-main);
  font-weight: 500;
  margin: 0.3rem;
`;
