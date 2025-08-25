import multer from "multer";

export const fileValidation = {
    image: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'image/webp',
        'image/svg+xml'
    ],
    video: [
        'video/mp4',
        'video/mpeg',
        'video/ogg',
        'video/webm',
        'video/quicktime'
    ],
    any: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/mpeg',
        'video/ogg',
        'video/webm',
        'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain'
    ],
    pdf: ['application/pdf']
};
 export const uploadFile=({customValidation}={})=>{
    const storage=multer.diskStorage({})
     const fileFilter=(req,file,cb)=>{
        if(customValidation.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new error('invalid formate',false))
        }
    }
    const upload=multer({fileFilter,storage})
    return upload
 }
 //export default uploadFile