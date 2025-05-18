navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(() => {
    window.parent.postMessage({ type: 'CAMERA_STREAM_GRANTED' }, '*');
  })
  .catch((error) => {
    console.error(error);
    window.parent.postMessage(
      { type: 'CAMERA_STREAM_DENIED', error: error.message },
      '*'
    );
  });
