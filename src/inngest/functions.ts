import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const processVideo = inngest.createFunction(
  { id: "process-video",
    retries: 1,
    concurrency: {
        limit: 1,
        key: "event.data.userId", 
    }
   },
  { event: "process-video-events" },
  async ({ event, step }) => {  
    const {uploadedFileId} = event.data;

    const {userId,s3Key, credits} = await step.run("check credits", async () => {
        const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
            where: {
                id: uploadedFileId
            },
            select:{
                user: {
                    select: {
                        id: true,
                        credits: true
                    },
                },
                s3Key: true,
            },
    });
    return {userId : uploadedFile.user.id, s3Key: uploadedFile.s3Key, credits: uploadedFile.user.credits};
});

    if (credits > 0){
        await step.run("set-status-processing", async () => {
            await db.uploadedFile.update({
                where: { id: uploadedFileId },
                data: { status: "PROCESSING" },
            });
        });

        await step.run("call-modal-endpoint", async () => {
            await fetch(env.PROCESS_VIDEO_ENDPOINT, {
                method: "POST",
                body: JSON.stringify({s3_key: s3Key}),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
                }
        });
      });

      const result = await step.run("create-clips-in-db", async () => {
        const folderPrefix = s3Key.split("/")[0]!;
    });
    }
    }, 
);

async function listS3ObjectsByPrefix(prefix: string) {
    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  
    const listCommand = new ListObjectsV2Command({
      Bucket: env.S3_BUCKET_NAME,
      Prefix: prefix,
    });
  
    const response = await s3Client.send(listCommand);
    return response.Contents?.map((item) => item.Key).filter(Boolean) ?? [];
  }