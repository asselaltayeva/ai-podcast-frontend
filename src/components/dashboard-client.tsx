"use client";

import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import { Badge } from "./ui/badge";
import { set } from "zod";
import { useRouter } from "next/navigation";
import { ClipDisplay } from "./clip-display";

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
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => 
            setRefreshing(false),600);
    };

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

            await processVideo (uploadedFileId);

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

                            {uploadedFiles.length > 0 && (
                                <div className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-md mb-2 font-medium">Queue status</h3>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRefresh}
                                         disabled={refreshing}>{refreshing && 
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    </Button>
                                    </div>
                                    <div className="max-h-[300px] overflow-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File</TableHead>
                                                    <TableHead>Uploaded</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Clips created</TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {uploadedFiles.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="max-w-xs truncate font-medium"> 
                                                            {item.filename}
                                                        </TableCell>

                                                        <TableCell className="text-muted-foreground text-sm"> 
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </TableCell>

                                                        <TableCell className="max-w-xs truncate font-medium">  
                                                            {item.status === "queued" && 
                                                            (<Badge variant="outline">Queued</Badge>)}

                                                            {item.status === "processing" && 
                                                            (<Badge variant="outline">Processing</Badge>)}

                                                            {item.status === "processed" && 
                                                            (<Badge variant="outline">Processed</Badge>)}

                                                            {item.status === "no credits" && 
                                                            (<Badge variant="destructive">No credits</Badge>)}

                                                             {item.status === "failed" && 
                                                            (<Badge variant="destructive">Failed</Badge>)}

                                                        </TableCell>

                                                        <TableCell className="text-muted-foreground text-sm">
                                                            {item.clipsCount > 0 ? 
                                                            (<span>
                                                                {item.clipsCount} clip{item.clipsCount !==1 ? "s" : ""}</span>) : 
                                                            (<span className="text-muted-foreground">No clips yet</span>)}
                                                        </TableCell>


                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-clips">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Clips</CardTitle>
                            <CardDescription>
                                View and manage your generated clips. Processing may take few minutes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ClipDisplay clips={clips} />
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
