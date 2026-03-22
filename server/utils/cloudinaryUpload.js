import cloudinary from "cloudinary";
import { BadRequestError } from "../request-errors/index.js";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinarySingleImageUpload = async (file, uploadPath) => {
    let imageUrl;
    if (!file) {
        throw new BadRequestError("Please upload an image.");
    }
    
    // TEMPORARY FIX: LOCAL UPLOAD (SKIP CLOUDINARY)
    try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.originalname || 'image.jpg';
        const filename = `${timestamp}-${originalName}`;
        const uploadPath = path.join(uploadsDir, filename);
        
        // Copy file to uploads directory
        fs.copyFileSync(file.path, uploadPath);
        
        // Return local URL
        imageUrl = `http://localhost:5000/uploads/${filename}`;
        console.log(' Local upload successful:', imageUrl);
        
        return imageUrl;
    } catch (error) {
        console.error(' Local upload failed:', error);
        throw new BadRequestError("Local upload failed: " + error.message);
    }
    
    // CLOUDINARY CODE (DISABLED FOR NOW)
    /*
    await cloudinary.v2.uploader.upload(
        file.path,
        {
            folder: "real-estate-system/" + uploadPath,
            width: 500,
            height: 500,
            crop: "fill",
        },
        (err, result) => {
            if (err) {
                throw new BadRequestError("Error uploading image");
            }
            imageUrl = result.secure_url;
        }
    );
    */
    return imageUrl;
};

export const cloudinaryMultipleUpload = async (files, uploadPath) => {
    let imageUrls = [];
    if (!files || files.length === 0) {
        throw new BadRequestError("Please upload at least one image.");
    }
    
    // TEMPORARY FIX: LOCAL MULTIPLE UPLOAD
    try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        for (const file of files) {
            // Generate unique filename
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const originalName = file.originalname || 'image.jpg';
            const filename = `${timestamp}-${random}-${originalName}`;
            const uploadPath = path.join(uploadsDir, filename);
            
            // Copy file to uploads directory
            fs.copyFileSync(file.path, uploadPath);
            
            // Add to URLs array
            const imageUrl = `http://localhost:5000/uploads/${filename}`;
            imageUrls.push(imageUrl);
            console.log(' Local upload successful:', imageUrl);
        }
        
        return imageUrls;
    } catch (error) {
        console.error(' Local multiple upload failed:', error);
        throw new BadRequestError("Local upload failed: " + error.message);
    }
    
    // CLOUDINARY CODE (DISABLED FOR NOW)
    /*
    for (const file of files) {
        await cloudinary.v2.uploader.upload(
            file.path,
            {
                folder: "real-estate-system/" + uploadPath,
            },
            (err, result) => {
                if (err) {
                    throw new BadRequestError("Error uploading image");
                }
                imageUrls.push(result.secure_url);
            }
        );
    }
    */
    return imageUrls;
};

export const cloudinaryDeleteImage = async (publicId) => {
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" }, (err, result) => {
        if (err) {
            throw new BadRequestError("Error deleting image");
        }
    });
    return true;
}