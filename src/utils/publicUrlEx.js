const getPublicIdFromUrl = (url) => {
  return url
    .split("/")
    .pop()      
    .split(".")[0];  
};
export { getPublicIdFromUrl };