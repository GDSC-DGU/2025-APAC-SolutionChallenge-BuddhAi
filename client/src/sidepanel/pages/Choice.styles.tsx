import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const LogoWrapper = styled.div`
  margin-bottom: 2rem;
`;

export const Text = styled.p`
  font-size: 1.25rem;
  font-family: var(--font-main);
  font-style: italic;
  font-weight: 200;
  color: #212121;
  margin-bottom: 2.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 280px;
`;
