"use client"
import Image from "next/image";

import { useState } from "react";
import { getSignedURL } from "~/lib/aws";
import { computeSHA256 } from "~/lib/utils";

export function FileTestForm() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try{

        if(file) {
            const checksum = await computeSHA256(file); 
            const signedURLResult = await getSignedURL(file.type, file.size, checksum);

            if (signedURLResult.error !== undefined) {
                console.error(signedURLResult.error);
                throw(new Error(signedURLResult.error));
                return;
            }

            const url = signedURLResult.success.url;

            await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                }
            })
            console.log(url);
        }
    } catch (error) {
        console.error(error);
    }

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFile(file);

        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }

        console.log(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
        } else {
            setFileUrl(undefined);
        }

        console.log(fileUrl);
    }

    return (
        <div>
            <form onSubmit={onSubmit} className="space-y-8" datatype="multipart/form-data">
                <input onChange={handleFileChange} name="file" type="file" accept="image/jpg, image/jpeg, image/png, image/webp"/>
                {fileUrl && file && (
                    <div>
                        {file.type.startsWith("image") ? (
                            <Image src={fileUrl} alt={file.name} />
                        ): (<div>{file.name}</div>)
                        }
                    </div>
                )}
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}