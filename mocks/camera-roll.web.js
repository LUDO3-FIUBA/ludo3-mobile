// Mock for @react-native-camera-roll/camera-roll on web
export const CameraRoll = {
  save: () => Promise.resolve(''),
  getPhotos: () => Promise.resolve({ edges: [], page_info: {} }),
  deletePhotos: () => Promise.resolve(),
};
export const useCameraRoll = () => [{ photos: [] }, () => {}];

export default CameraRoll;
