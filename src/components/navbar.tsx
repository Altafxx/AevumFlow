import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
    return (
        <nav className="bg-primary text-secondary w-full flex items-center justify-between p-4">
            <div className="text-2xl">VOD Engine</div>
            <div className="flex space-x-4">
                <Button asChild variant={'link'}>
                    <Link href="/" className="text-secondary">
                        Home
                    </Link>
                </Button>
                <Button asChild variant={'link'}>
                    <Link href="/upload" className="text-secondary">
                        Upload
                    </Link>
                </Button>
            </div>
        </nav>
    )
}