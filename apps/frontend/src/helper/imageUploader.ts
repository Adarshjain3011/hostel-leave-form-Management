
import cloudinary from 'cloudinary';


// import cloudinaryConnect from '@/cloudinaryconfig/coudinary';

import { cloudinaryConnect } from '@/config/cloudinaryConfig';

cloudinaryConnect();

export  async function ImageUploader(file:any, folder="temp-youtube", height="100", quality="100"){

    try{

        const arrayBuffer = await file.arrayBuffer();

        const buffer = new Uint8Array(arrayBuffer);

        const options:any = { folder };

        options.height = height;

        options.quality = quality;

        options.resource_type = "auto";

        return await new Promise((resolve,reject)=>{

            cloudinary.v2.uploader.upload_stream(options,function(error:any,result:any){

                if(error){

                    reject (error);
                    return;

                }

                resolve(result);

            }).end(buffer);
            
        })


    }
    catch(e){

        console.log(e);

    }
}


