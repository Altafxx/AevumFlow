"use client";
// import Filezone from "@/components/drop-file";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea";
import { LoaderPinwheel, Plus } from "lucide-react";
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
// import { Progress } from "@/components/ui/progress";

interface Folder {
    id: number;
    name: string;
}

export default function Upload() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isFetch, setFetch] = useState<boolean>(false);
    const [isSelectDisabled, setSelectDisabled] = useState<boolean>(false)
    // const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const router = useRouter()

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

        setFolders([...folders, res.folder]);
        toast.success(res.message);
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

    return (
        <main className="flex flex-col min-h-screen place-items-center py-24">
            <div className="font-bold text-2xl">Upload Video</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input id="title" placeholder="Title" type="text" {...field} />
                                </FormControl>
                                <FormDescription>Title of the video</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea id="description" placeholder="Description" {...field} />
                                </FormControl>
                                <FormDescription>Description of the video</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="video"
                        render={() => (
                            <FormItem>
                                <FormLabel>Video</FormLabel>
                                <FormControl>
                                    <Input
                                        id="video"
                                        type="file"
                                        {...videoRef}
                                    />
                                </FormControl>
                                <FormDescription>Description of the video</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="folder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Folder (Optional)</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        // value={field.value}
                                        {...field}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select folder" id="folder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {folders.map((folder) => (
                                                <SelectItem key={folder.id} disabled={isSelectDisabled} value={folder.id.toString()}>{folder.name}</SelectItem>
                                            ))}
                                            {
                                                folders.length === 0 && <SelectItem value="0" disabled>No folder found</SelectItem>
                                            }
                                            <Separator />
                                            <Dialog onOpenChange={() => setSelectDisabled(!isSelectDisabled)}>
                                                <DialogTrigger asChild>
                                                    <Button variant={"ghost"} className="min-w-full"> <Plus className="mr-2" />Create folder</Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Create a folder</DialogTitle>
                                                        <DialogDescription>
                                                            Create a new folder here. Click create when you&apos;re done.
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
                                                        <Button type="button" onClick={() => submitFolder((document.getElementById("name") as HTMLInputElement))}>Create</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>Folder to store the video</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-center text-sm text-gray-500">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )} */}
                    <Button type="submit" disabled={isUploading}>
                        {isUploading ? <LoaderPinwheel className=" animate-spin duration-1000" /> : "Upload"}
                    </Button>
                </form>
            </Form>
        </main>
    );
}