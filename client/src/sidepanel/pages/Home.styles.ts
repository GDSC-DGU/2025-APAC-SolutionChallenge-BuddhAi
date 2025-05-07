import styled from 'styled-components';

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
`;

export const Text = styled.p`
  font-size: 1.2rem;
  font-family: var(--font-main);
  font-style: italic;
  font-weight: 200;
  margin: 0.25rem 0;
`;

export const Gaze = styled.span`
 color: #B020D3;

`;

export const Voice = styled.span`
 color: #0970E7;

`;

export const ButtonWrapper = styled.div`
  margin-top: 3rem;
`;
