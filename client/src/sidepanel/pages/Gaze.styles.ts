import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-contnet: center;
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
