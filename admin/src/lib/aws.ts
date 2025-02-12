"use server"

import { auth } from "~/server/auth"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

import crypto from "crypto"
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex")

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! 
    }
})

const acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]

const maxFileSize = 1024 * 1024 * 10; //10MB

// Gets the type, size and checksum so that the client cant lie about the file
// S3 will check the variables and if they dont match the file, it will return an error
export async function getSignedURL(type: string, size: number, checksum: string) {
    const session = await auth();

    if(!session) {
        return {error: "Unauthorized"}
    }

    
    
    if(!acceptedTypes.includes(type)){
        return {error: "Tipo de ficheiro não suportado"}
    }
    
    if(size > maxFileSize) {
        return {error: "Ficheiro grande, por favor escolha um ficheiro mais pequeno"}
    }

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: generateFileName(),
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
            userId: session.user.id
        }
    })

    const signedURL = await getSignedUrl(s3, putObjectCommand, { expiresIn: 60 });

    return {success: {url: signedURL}}
}