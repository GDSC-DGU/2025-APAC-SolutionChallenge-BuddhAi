import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  height: 100vh;
  padding: 3rem 1rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
`;

export const TextBox = styled.div`
  margin-top: 4rem;
  text-align: center;
`;

export const Text = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.8;
`;

export const Spoken = styled.span`
  color: #000000;
`;

export const Suggested = styled.span`
  color: #0970E7;
`;

export const WaveWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  margin-top: auto;
`;
