import Spinner from '../../public/icons/loading.gif';
import { LoadingWrapper, Script } from './Loading.styles';

export const Loading = () => {
  return (
    <LoadingWrapper>
      <Script>
        <p>Using the gaze to create a fake cursor</p>
        <p>Please wait a minute.</p>
      </Script>
      <img src={Spinner} alt="로딩" width="70%" />
    </LoadingWrapper>
  );
};
