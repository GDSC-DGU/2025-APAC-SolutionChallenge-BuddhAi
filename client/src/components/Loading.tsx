import { ClipLoader } from 'react-spinners';
import { LoadingWrapper, Script } from './Loading.styles';

export const Loading = () => {
  return (
    <LoadingWrapper>
      <Script>
        <p>Using the gaze to create a cursor</p>
        <p>Please wait a minute.</p>
      </Script>
      <div>
        <ClipLoader color="#808080" size={35} />
      </div>
    </LoadingWrapper>
  );
};
