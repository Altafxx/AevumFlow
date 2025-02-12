"use client";
// import Filezone from "@/components/drop-file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchFolders } from "./action";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function Upload() {
    const [folders, setFolders] = useState<any[]>([]);
    const [isFetch, setFetch] = useState(false);

    useEffect(() => {
        const getFolders = async () => {
            if (!isFetch) {
                try {
                    const folderData = await fetchFolders();
                    if (Array.isArray(folderData) && folderData.length > 0) {
                        setFolders(folderData);
                    }

                    setFetch(true);
                } catch (error) {
                    setFetch(true);

                    console.error('Error fetching folders:', error);
                }
            }
        };
        getFolders();
    }, [isFetch]);

    return (
        <main className="flex flex-col min-h-screen place-items-center py-24">
            <div className="font-bold text-2xl">Upload Video</div>
            <form className="flex flex-col space-y-4">
                <section>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Title" type="text" />
                </section>
                <section>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Description" />
                </section>
                <section>
                    <Label htmlFor="video">Video</Label>
                    <Input id="video" type="file" />
                    {/* <Filezone /> */}
                </section>
                <section>
                    <Label htmlFor="folder">Folder</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select folder" id="folder" />
                        </SelectTrigger>
                        <SelectContent>
                            {folders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id.toString()}>{folder.name}</SelectItem>
                            ))}
                            {
                                folders.length === 0 && <SelectItem value="0" disabled>No folder found</SelectItem>
                            }
                            <Separator />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant={"ghost"} className="min-w-full"> <Plus className="mr-2" />Create folder</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create a folder</DialogTitle>
                                        <DialogDescription>
                                            Create a new folder here. Click create when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Name
                                            </Label>
                                            <Input id="name" placeholder="Folder name" className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Create</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </SelectContent>
                    </Select>
                </section>
                <Button type="submit">Upload</Button>
            </form>
        </main>
    );
}