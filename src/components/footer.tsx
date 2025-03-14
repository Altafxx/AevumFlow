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
                        href="https://github.com/your-repo"
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