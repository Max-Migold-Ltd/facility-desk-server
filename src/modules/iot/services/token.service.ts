import crypto from "crypto";
import prisma from "../../../lib/prisma";

export class TokenService {
    private async generateToken(): Promise<string> {
        let pin = "";
        for (let i = 0; i < 20; i++) {
            pin += crypto.randomInt(0, 10);
        }
        return pin;
    }

    // Validate token from meter
    async validateToken(token: string, meterId: string) { 
        // Find token in database
        // Mark token as used
        // Update meter balance
        // Update meter token status to used, so it can't be reused
    }
    async purchaseToken(meterId: string, amount: number, transactionRef: string): Promise<string> {
        const token = await this.generateToken();
        // Save the token in the database
        await prisma.meterToken.create({
            data: {
                meterId,
                token,
                amount,
                transactionRef,
                status: "PENDING",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
            }
        })

        return token;
    }
}