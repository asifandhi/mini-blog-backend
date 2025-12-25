const getPublicIdFromUrl = (url) => {
  return url
    .split("/")
    .pop()        // wywhp4r94jrm7bvgdtji.png
    .split(".")[0]; // wywhp4r94jrm7bvgdtji
};
export { getPublicIdFromUrl };