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
        console.log("\nUploading file to Cloudinary...0%\n");
        
        if(!localFilePath){
            return null;

        }

        // Upload the file to Cloudinary
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log("File uploaded to Cloudinary 100%\n");

        fs.unlinkSync(localFilePath); // Delete the local file after upload

        return response


    }catch(error){
        console.error('Error uploading to Cloudinary:', error);
        fs.unlinkSync(localFilePath); // Delete the local file even if upload fails
        return null;
    }
}
// this is for the delete function from cloudinary
const deleteFromCloudinary = async(FilePath) => {
    try {
        if(!FilePath){
            return null;
        }
        const response = await cloudinary.uploader.destroy(FilePath, {
            resource_type:'image'

        });
        return response;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null;
        
    }

}

export { 
    uploadOnCloudinary,
    deleteFromCloudinary
 };