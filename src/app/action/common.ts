import { revalidatePath } from "next/cache";

export function revalidatePage(page: string) {
    revalidatePath(page)
}