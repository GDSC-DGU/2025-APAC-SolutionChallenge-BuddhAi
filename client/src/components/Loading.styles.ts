import styled from 'styled-components';

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const Script = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  font-family: var(--font-main);
  font-style: italic;
  font-weight: 200;
  p {
    margin: 0;
  }
  gap: 0.6rem;
`;
