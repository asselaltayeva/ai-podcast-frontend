"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

const NavHeader = ({credits,email} : {
    credits: number;
    email: string;
}) => {
    return (
        <header className="bg-background sticky top-0 z-10 flex justify-center border-b">
            <div className="container flex h-16 items-center justify-between p-4 px-4 py-2">
                <Link href="/dashboard" className="flex items-center">
                <div className="font-sans text-xl font-medium tracking-tight">
                    <span className="text-foreground">AI</span>
                    <span className="font-light text-gray-500">/</span>
                    <span className="text-primary font-light">Podcast</span>
                    </div>
                    </Link>
                </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-8 px-3 py-1.5 text-xs font-medium">{credits} credits</Badge>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-medium">
                <Link href ="/dashboard/billing" className="flex items-center gap-2">Buy More</Link>
            </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild> 
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
                        <Avatar>
                            <AvatarFallback className="text-black">{email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <p className="text-muted-foreground text-xs ">{email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Link href="/dashboard/billing">Billings</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            </div>
        </header>
    )
}

export default NavHeader;