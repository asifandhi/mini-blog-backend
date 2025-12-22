import {v2 as cloudinary} from 'cloudinary';
// this by default imports the 'fs' module from Node.js stand for file system operations
import fs from 'fs';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath){
            return null;

        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log('Cloudinary upload response:', response.url);

        fs.unlinkSync(localFilePath); // Delete the local file after upload

        return response


    }catch(error){
        console.error('Error uploading to Cloudinary:', error);
        fs.unlinkSync(localFilePath); // Delete the local file even if upload fails
        return null;
    }
}

export { uploadOnCloudinary };