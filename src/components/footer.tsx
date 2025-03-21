import { Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-6 border-t bg-background/50 backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full translate-y-[1px]" />
                        <span className="font-medium">VOD Engine</span>
                    </div>
                    <Link
                        href="https://github.com/Altafxx/nginx-vod-microservice"
                        target="_blank"
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Github size={20} />
                    </Link>
                </div>
            </div>
        </footer>
    );
}

// https://vod.danielaltaf.dev/video/5cdfbbd7-9f86-4f29-a967-67d6df55d0c1.json/master.m3u8
// https://vod.danielaltaf.dev/video/597554da-6282-4a93-92a8-f09eb4c756b0.json/master.m3u8

