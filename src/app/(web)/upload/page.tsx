"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea";
import { LoaderPinwheel, Plus, Upload as UploadIcon, FileVideo, Folder as FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { uploadVideo } from "@/app/action/video";
import { createFolder, fetchFolders } from "@/app/action/folder";
import { useRouter } from 'next/navigation'
import { Label } from "@/components/ui/label";

interface Folder {
    id: number;
    name: string;
}

export default function Upload() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isFetch, setFetch] = useState<boolean>(false);
    const [isSelectDisabled, setSelectDisabled] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [selectedFolder, setSelectedFolder] = useState<string>(""); // Add this state
    const router = useRouter();

    const formSchema = z.object({
        title: z
            .string()
            .min(2)
            .max(50),
        description: z
            .string()
            .optional(),
        folder: z
            .string()
            .optional(),
        video: z
            .any()
            .refine((files) => files instanceof FileList, {
                message: "Please upload a video.",
            })
            .refine((files) => files?.length > 0, {
                message: "Please upload at least one video.",
            })
            .refine((files) => files[0]?.type.startsWith("video/"), {
                message: "Please upload a valid video file.",
            })

    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            folder: "", // Add default value for folder
        },
    })

    const videoRef = form.register("video");

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

    const submitFolder = async (e: HTMLInputElement) => {
        const res = await createFolder(e.value);

        if (res instanceof Error) {
            toast.error(res.message);
            return;
        }

        const newFolderId = res.folder.id.toString();
        setFolders([...folders, res.folder]);
        setSelectedFolder(newFolderId);
        form.setValue('folder', newFolderId);

        toast.success(res.message);
        setIsDialogOpen(false);
        setSelectDisabled(false);
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const { title, description, video, folder } = data;

        try {
            toast.promise(
                uploadVideo(title, video[0], description, folder).then(() => router.refresh()),
                {
                    loading: 'Uploading video...',
                    success: 'Video uploaded successfully',
                    error: (err) => `Upload failed: ${err.message}`
                }
            );

            form.reset();

            setIsUploading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to start upload");
            setIsUploading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const input = e.currentTarget;
            submitFolder(input);
        }
    };

    return (
        <main className="flex flex-col min-h-screen place-items-center py-24">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon size={32} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">Upload Video</h1>
                    <p className="text-muted-foreground">Share your video with the world. Add details to help people discover your content.</p>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="video"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Video File</FormLabel>
                                        <FormControl>
                                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                                <Input
                                                    id="video"
                                                    type="file"
                                                    {...videoRef}
                                                    className="hidden"
                                                />
                                                <label htmlFor="video" className="cursor-pointer space-y-2 flex flex-col items-center">
                                                    <FileVideo size={32} className="text-muted-foreground" />
                                                    <div className="text-sm font-medium">
                                                        Drag and drop or click to upload
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        MP4, MOV, or WebM (Max 10GB)
                                                    </div>
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Give your video a title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell viewers about your video"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="folder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Folder</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={selectedFolder || field.value}
                                                    onValueChange={(value) => {
                                                        setSelectedFolder(value);
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a folder">
                                                            {folders.find(f => f.id.toString() === (selectedFolder || field.value))?.name || "Select a folder"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {folders.map((folder) => (
                                                            <SelectItem
                                                                key={folder.id}
                                                                value={folder.id.toString()}
                                                                disabled={isSelectDisabled}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FolderIcon size={16} />
                                                                    {folder.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                        {folders.length === 0 && (
                                                            <SelectItem value="0" disabled>No folders available</SelectItem>
                                                        )}
                                                        <Separator className="my-2" />
                                                        <Dialog
                                                            open={isDialogOpen}
                                                            onOpenChange={(open) => {
                                                                setIsDialogOpen(open);
                                                                setSelectDisabled(open);
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" className="w-full">
                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                    Create folder
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
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isUploading}
                                className="w-full"
                            >
                                {isUploading ? (
                                    <>
                                        <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        Upload Video
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    );
}