"use server"

import { db } from "@/lib/db-client";
import { hash } from "bcrypt";

export async function registerUser(email: string, name: string, password: string) {
    if (!email || !name || !password) {
        throw new Error('Missing fields');
    }

    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
        data: {
            email,
            name,
            hashedPassword
        }
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}