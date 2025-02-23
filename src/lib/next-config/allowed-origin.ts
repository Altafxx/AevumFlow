export default function allowedOrigins(): string[] {
    const allowedOriginEnv = process.env.ALLOWED_ORIGINS || '';
    const allowedOriginsArray = allowedOriginEnv.split(",");
    return [
        ...["localhost:3000", "app:3000"],
        ...(allowedOriginEnv ? allowedOriginsArray : [])
    ];
} 