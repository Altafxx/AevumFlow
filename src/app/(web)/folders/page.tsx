"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Folder as FolderIcon, Trash2, Loader2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { createFolder, fetchFoldersWithStats } from "@/app/action/folder";
import { toast } from "sonner";

interface Folder {
    id: number;
    name: string;
    path: string;
    createdAt: Date;
    videoCount: number;
}

export default function Folders() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const getFolders = async () => {
            try {
                const folderData = await fetchFoldersWithStats();
                if (Array.isArray(folderData)) {
                    setFolders(folderData);
                }
            } catch (error) {
                console.error('Error fetching folders:', error);
                toast.error("Failed to fetch folders");
            } finally {
                setIsLoading(false);
            }
        };
        getFolders();
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.currentTarget;
            submitFolder(input);
        }
    };

    const submitFolder = async (e: HTMLInputElement) => {
        const res = await createFolder(e.value);

        if (res instanceof Error) {
            toast.error(res.message);
            return;
        }

        setFolders([...folders, { ...res.folder, videoCount: 0 }]);
        toast.success(res.message);
        setIsDialogOpen(false);
        e.value = '';
    };

    return (
        <main className="flex flex-col min-h-screen py-24 px-4">
            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Folders</h1>
                        <p className="text-muted-foreground">Manage your video folders</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Folder</DialogTitle>
                                <DialogDescription>
                                    Create a new folder to organize your videos
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Folder Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter folder name"
                                        onKeyDown={handleKeyPress}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => submitFolder(document.getElementById("name") as HTMLInputElement)}
                                >
                                    Create Folder
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="group bg-card/50 backdrop-blur-sm hover:bg-card/80 border rounded-lg p-4 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FolderIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{folder.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Video className="h-3 w-3" />
                                                    <span>{folder.videoCount} {folder.videoCount === 1 ? 'video' : 'videos'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {folders.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No folders found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}