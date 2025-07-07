import { getCroppedImg } from './cropUtils';

export const getCroppedImgBlob = async (
  imageSrc,
  crop,
  zoom,
  croppedAreaPixels
) => {
  const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
  return croppedImage;
};
