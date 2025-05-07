import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
`;

export const TextBox = styled.div`
  margin-top: 18rem;
  text-align: center;
`;

export const Text = styled.p`
  font-size: 1.25rem; /* 20px */
  font-family: var(--font-main);
  line-height: 3.125rem; /* 50px */
`;

export const Spoken = styled.span`
  color: #000000;
  font-weight: 400;
`;

export const Suggested = styled.span`
  color: rgba(9, 112, 231, 0.61);
  font-weight: 200;
`;


export const WaveWrapper = styled.div`
  position: center;
  width: 100%;
  height: 120px;
  margin-top: auto;
`;
