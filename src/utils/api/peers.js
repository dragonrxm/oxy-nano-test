import { loadingStarted, loadingFinished } from '../../utils/loading';

// eslint-disable-next-line import/prefer-default-export
export const requestToActivePeer = (activePeer, path, urlParams) => {
  loadingStarted(path);
  return activePeer.rawRequest({
    noApiPrefix: true,
    params: urlParams,
    path,
  }).then((data) => {
    loadingFinished(path);
    return data;
  }).catch((err) => {
    loadingFinished(path);
    return Promise.reject(err);
  });
};

