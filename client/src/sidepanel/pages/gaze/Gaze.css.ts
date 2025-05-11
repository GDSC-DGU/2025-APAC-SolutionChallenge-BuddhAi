import styled from 'styled-components';

export const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
`;

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const StatusIndicator = styled.div<{ active: boolean }>`
  padding: 8px 12px;
  margin-bottom: 15px;
  background-color: ${(props) => (props.active ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.active ? '#155724' : '#721c24')};
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
`;
