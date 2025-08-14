import multiparty from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
const bucketName = '2fun-bucket';

export default async function handle(req, res) {
  try {
    await mongooseConnect();
    await isAdminRequest(req, res);

    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file || files.file.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('Number of files:', files.file.length);

    const client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const links = [];

    for (const file of files.file) {
      // Defensive: handle missing originalFilename
      const originalFilename = file.originalFilename || 'file.bin';
      const ext = originalFilename.split('.').pop() || 'bin';
      const newFilename = Date.now() + '.' + ext;

      // Use originalFilename to get mime type instead of temp file path
      const contentType = mime.lookup(originalFilename) || 'application/octet-stream';

      console.log(`Uploading ${originalFilename} as ${newFilename} with Content-Type: ${contentType}`);

      const fileContent = fs.readFileSync(file.path);

      await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: contentType,
      }));

      const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
      links.push(link);
    }

    return res.json({ links });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

export const config = {
  api: { bodyParser: false },
};


// import multiparty from 'multiparty';
// import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
// import fs from 'fs';
// import mime from 'mime-types';
// import {mongooseConnect} from "@/lib/mongoose";
// import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
// const bucketName = 'dawid-next-ecommerce';

// export default async function handle(req,res) {
//   await mongooseConnect();
//   await isAdminRequest(req,res);

//   const form = new multiparty.Form();
//   const {fields,files} = await new Promise((resolve,reject) => {
//     form.parse(req, (err, fields, files) => {
//       if (err) reject(err);
//       resolve({fields,files});
//     });
//   });
//   console.log('length:', files.file.length);
//   const client = new S3Client({
//     region: 'us-east-1',
//     credentials: {
//       accessKeyId: process.env.S3_ACCESS_KEY,
//       secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     },
//   });
//   const links = [];
//   for (const file of files.file) {
//     const ext = file.originalFilename.split('.').pop();
//     const newFilename = Date.now() + '.' + ext;
//     await client.send(new PutObjectCommand({
//       Bucket: bucketName,
//       Key: newFilename,
//       Body: fs.readFileSync(file.path),
//       ACL: 'public-read',
//       ContentType: mime.lookup(file.path),
//     }));
//     const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
//     links.push(link);
//   }
//   return res.json({links});
// }

// export const config = {
//   api: {bodyParser: false},
// };