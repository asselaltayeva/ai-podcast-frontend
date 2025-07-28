"use client";

import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";

export function DashboardClient({
    uploadedFiles,
    clips,
}: {
    uploadedFiles: {
        id: string;
        s3Key: string;
        filename: string;
        createdAt: Date;
        status: string;
        clipsCount: number;
    }[];
    clips: Clip[];
}) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        const file = files[0]!;
        setUploading(true);

        try{
            const {success, signedUrl, uploadedFileId} = await generateUploadUrl({
                filename: file.name,
                contentType: file.type,
            });
            if (!success) {
                throw new Error("Failed to generate upload URL");
            }

            const uploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
            }

            setFiles([]);

            toast.success("File uploaded successfully!", {
                description: "Your podcast file is being scheduled for processing. Check the status: ",
                duration: 5000,
            });
        } catch (error) {
            toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
                description: "Please try again or contact support if the issue persists.",
            });
            
        } finally {

        }
    }

    return (
        <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Podcast Clipper</h1>
                    <p className="text-muted-foreground">
                        Upload your podcast and get AI-generated clips instantly
                    </p>
                </div>
                <Link href="/dashboard/billing">
                    <Button>Buy Credits</Button>
                </Link>
            </div>

            <Tabs defaultValue="upload">
                <TabsList>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="my-clips">My Clips</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Podcast</CardTitle>
                            <CardDescription>
                                Upload your audio or video podcast to generate Reels & Shorts for your social media
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Dropzone
                        onDrop={handleDrop}
                        accept={{ "video/*": [".mp4"] }}
                        maxSize={500 * 1024 * 1024}
                        disabled={uploading}
                        maxFiles={1}
                        >
                        {(dropzone: DropzoneState) => (
                            <div
                                {...dropzone.getRootProps()}
                                className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center border border-dashed border-muted cursor-pointer"
                            >
                                <UploadCloud className="text-muted-foreground h-12 w-12" />
                                <p className="font-medium">Drag and drop your file</p>
                                <p className="text-muted-foreground text-sm">
                                    or click to browse (MP4 up to 500MB)
                                </p>
                                <Button variant="default" size="sm" disabled={uploading}>
                                    Select File
                                </Button>
                                <input {...dropzone.getInputProps()} />
                            </div>
                        )}
                    </Dropzone>


                            <div className="flex items-start justify-between">
                            <div>
                            {files.length > 0 && (
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">Selected file:</p>
                                    {files.map((file) => (
                                        <p className="text-muted-foreground" key={file.name}>
                                            {file.name}
                                        </p>
                                    ))}
                                </div>
                            )}
                            </div>
                            <Button className={files.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                            onClick={handleUpload}>
                                {uploading ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Uploading...
                                    </>
                                ) :(
                                    "Upload"
                                )}
                            </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
