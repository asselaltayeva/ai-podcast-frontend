"use client"

import type { Clip } from "@prisma/client";
import { useEffect, useState } from "react";
import { getClipPlayUrl } from "~/actions/generation";

function ClipCard({clip} : {clip: Clip}) {
    const [playUrl, setPlayUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPlayUrl() {
            setIsLoading(true);
            try {
                const result = await getClipPlayUrl(clip.id);
            } catch (error) {
                
            } finally {
                
            }
        }

        fetchPlayUrl();
    },[clip.id]);
    return (
        <div className="flex max-w-52 flex-col gap-2">
            <div className="bg-muted"></div>
        </div>
    )
}
export function ClipDisplay({clips} : {clips: Clip[]} ){
    if (clips.length === 0) {
        return (
            <p className="text-muted-foreground p-4 text-center">No clips found. Upload a podcast to generate clips.</p>
        )
        }
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
            ))}

        </div>
    )
}