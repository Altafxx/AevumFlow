import Link from "next/link";
import { Button } from "./ui/button";
import { Upload, Home, FolderIcon } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="border-b bg-background/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full translate-y-[1px]" />
                            VOD Engine
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/" className="flex items-center gap-2">
                                <Home size={18} />
                                <span className="hidden sm:inline">Home</span>
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/folders" className="flex items-center gap-2">
                                <FolderIcon size={18} />
                                <span className="hidden sm:inline">Folders</span>
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/upload" className="flex items-center gap-2">
                                <Upload size={18} />
                                <span className="hidden sm:inline">Upload</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}