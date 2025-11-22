import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';

async function resetPassword() {
    const email = 'iyke.earth@gmail.com';
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    console.log(`Generated hash for '${newPassword}': ${hash}`);

    // Get user ID
    const userQuery = `SELECT id FROM users WHERE email = '${email}'`;
    const userCmd = `npx wrangler d1 execute gigshub-db --command "${userQuery}" --remote --json`;

    console.log('Fetching user ID...');
    const userOutput = execSync(userCmd).toString();
    const userJson = JSON.parse(userOutput);
    const userId = userJson[0]?.results?.[0]?.id;

    if (!userId) {
        console.error('User not found!');
        return;
    }

    console.log(`User ID: ${userId}`);

    // Update password
    const updateQuery = `UPDATE user_passwords SET password_hash = '${hash}' WHERE user_id = '${userId}'`;
    const updateCmd = `npx wrangler d1 execute gigshub-db --command "${updateQuery}" --remote`;

    console.log('Updating password...');
    execSync(updateCmd);
    console.log('Password updated successfully!');
}

resetPassword().catch(console.error);
