"use server";

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    await new Promise((res) => setTimeout(res, 5000));

    //database query to fetch user data
    const userData = await db.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select : {
            uploadedFiles: {
                where: {
                    uploaded: true
                },
                select: {
                    id: true,
                    s3Key: true,
                    displayName: true,
                    createdAt: true,
                    status: true,
                    _count:{
                        select: {
                            clips: true,
                        },
                    },
                },
            },
            clips: {
                orderBy: {
                    createdAt: "desc",
                }
            }
        },
    });

    const formattedFiles = userData.uploadedFiles.map((file) => ({
        id: file.id,
        s3Key: file.s3Key,
        filename: file.displayName || "Unknown File Name", 
        createdAt: file.createdAt.toLocaleDateString(),
        status: file.status,
        clipsCount: file._count.clips,
    }) )


    return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
}