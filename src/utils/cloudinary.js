import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async function(localFilePath) {
   try {
     if(!localFilePath) return null;
 
     const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
     })
     //file is successfully uploaded on cloudinary
     console.log("File successfully uploaded on cloudinary", response.url);

     //ydi file successfully upload ho gyi hai cloudinary par to localPath(means server se => means public folder se) se files ko remove(unlink) kar do
     fs.unlinkSync(localFilePath)
     return response;

   } catch (error) {
    // ydi file upload nhi hui hai cloudinary par to local(local means server par file jo upload hai vo) se file ko remove kar do => ye kaam fileSystem karega
    //unlinkSync => method , file ko unlink kar do synchronously => means phle file ko unlink karo then aage jao
    fs.unlinkSync(localFilePath)      //remove the locally saved temporary file 
    return null;
    

   }
}


export { uploadOnCloudinary } ;