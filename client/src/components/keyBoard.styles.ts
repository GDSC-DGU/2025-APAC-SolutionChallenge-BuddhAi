import styled from 'styled-components';

export const TextChar = styled.text`
  text-anchor: middle;
  font-size: 16px;
  fill: #000;
  font-family: var(--font-main);
  font-weight: 200;
  dominant-baseline: middle;
  cursor: pointer;
  user-select: none;
  &:hover {
    fill: #b020d3;
    font-weight: bold;
    text-shadow: 0 0 2px rgba(176, 32, 211, 0.5);
  }
`;

export const StyledInput = styled.div`
  font-size: 1.2rem;
  text-align: center;
  border: none;
  font-family: var(--font-main);
  font-weight: 300;
`;
