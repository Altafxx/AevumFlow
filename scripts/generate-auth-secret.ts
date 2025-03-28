import { execSync } from 'child_process';
import { config } from 'dotenv';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

function generateSecret(): string {
    try {
        return execSync('openssl rand -base64 32').toString().trim();
    } catch (error) {
        console.error('Failed to generate secret using OpenSSL:', error);
        // Fallback to a random string if OpenSSL fails
        return Buffer.from(Math.random().toString(36) + Date.now().toString()).toString('base64');
    }
}

function updateEnvFile(secret: string) {
    const envPath = resolve(process.cwd(), '.env');
    try {
        let envContent = '';
        try {
            envContent = readFileSync(envPath, 'utf-8');
        } catch {
            // If .env doesn't exist, copy from .env.example
            envContent = readFileSync(resolve(process.cwd(), '.env.example'), 'utf-8');
        }

        const updatedContent = envContent.replace(
            /^NEXTAUTH_SECRET=.*$/m,
            `NEXTAUTH_SECRET="${secret}"`
        );

        writeFileSync(envPath, updatedContent);
        console.log('NEXTAUTH_SECRET has been generated and updated in .env');
    } catch (error) {
        console.error('Failed to update .env file:', error);
        process.exit(1);
    }
}

function main() {
    config(); // Load existing .env file

    if (!process.env.NEXTAUTH_SECRET) {
        const secret = generateSecret();
        updateEnvFile(secret);
    }
}

main();