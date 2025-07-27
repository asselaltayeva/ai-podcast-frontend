"use client";

import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import { UploadCloud } from "lucide-react";
import { useState } from "react";

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
                                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center">
                                        <UploadCloud className="text-muted-foreground h-12 w-12" />
                                        <p className="font-medium">Drag and drop your file</p>
                                        <p className="text-muted-foreground text-sm">or click to browse (MP4 up to 500MB)</p>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            disabled={uploading}
                                            {...dropzone.getRootProps()}
                                        >
                                            Select File
                                        </Button>
                                        <input {...dropzone.getInputProps()} />
                                    </div>
                                )}
                            </Dropzone>

                            {files.length > 0 && (
                                <div className="mt-4 space-y-1 text-sm">
                                    <p className="font-medium">Selected file:</p>
                                    {files.map((file) => (
                                        <p className="text-muted-foreground" key={file.name}>
                                            {file.name}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
