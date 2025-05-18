navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    stream.getTracks().forEach((track) => track.stop());
    console.log('[iframe] CAMERA_GRANTED 메시지 전송 중');
    window.parent.postMessage({ type: 'CAMERA_STREAM_GRANTED' }, '*');
  })
  .catch((error) => {
    console.error(error);
    window.parent.postMessage(
      { type: 'CAMERA_STREAM_DENIED', error: error.message },
      '*'
    );
  });
