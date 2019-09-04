import {Storage} from "aws-amplify";


const saveCurrentLayoutImage = async (userId: string, layoutId: string) => {
  const dataUrl = window.CANVAS.toDataURL('image/png')
  const blobData = dataURItoBlob(dataUrl);
  return await Storage.put(getLayoutImageFileName(userId, layoutId), blobData, {level: 'private'})
}

const saveBackgroundImage = async (userId: string, layoutId: string, dataUrl: string) => {
  const blobData = dataURItoBlob(dataUrl);
  return await Storage.put(backGroundImageName(userId, layoutId), blobData, {level: 'private'})
}

const fetchLayoutImage = async (userId: string, layoutId: string) => {
  return await Storage.get(getLayoutImageFileName(userId, layoutId), {level: 'private'})
}


export const getLayoutImageFileName = (userId: string, layoutId: string) => {
  return `${userId}-${layoutId}.png`  //`
}

export const backGroundImageName = (userId: string, layoutId: string) => {
  return `${userId}-${layoutId}-bg.png`  //`
}


const dataURItoBlob = (dataURI) => {
  let binary = atob(dataURI.split(',')[1]);
  let array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}


export default {
  saveCurrentLayoutImage,
  fetchLayoutImage,
  saveBackgroundImage,
}
