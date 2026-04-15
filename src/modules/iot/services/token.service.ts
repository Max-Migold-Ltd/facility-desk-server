import crypto from "crypto";
import prisma from "../../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../../errors";
import { MQTTService } from "./mqtt.service";

const mqttService = new MQTTService();

export class TokenService {
    private async generateToken(): Promise<string> {
        let pin = "";
        for (let i = 0; i < 20; i++) {
            pin += crypto.randomInt(0, 10);
        }
        return pin;
    }

    // Validate token from meter
    async validateToken(token: string) {

        const meterToken = await prisma.meterToken.findUnique({
            where: {
                token,
                status: "PENDING",
                expiresAt: {
                    gte: new Date(),
                }
            }
        })
        if (!meterToken) {
            throw new BadRequestError("Invalid or expired token")
        }
        return meterToken;
    }
    async purchaseToken(userId: string, meterId: string, amount: number, transactionRef: string): Promise<string> {
        const token = await this.generateToken();
        // Save the token in the database
        await prisma.meterToken.create({
            data: {
                meterId,
                token,
                amount,
                userId,
                transactionRef,
                status: "PENDING",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
            }
        })

        return token;
    }

    async loadToken(token: string) {
        const meterToken = await this.validateToken(token);

        // await mqttService.topUpMeter(meterToken.userId, meterToken.meterId, Number(meterToken.amount), meterToken.transactionRef);

        await prisma.$transaction(async (tx) => {
            // Update meter balance
            await tx.utilityPayment.create({
                data: {
                    amount: meterToken.amount,
                    meterId: meterToken.meterId,
                    paidByUserId: meterToken.userId,
                    transactionRef: meterToken.transactionRef,
                }
            })
            await tx.meter.update({
                where: {
                    id: meterToken.meterId,
                },
                data: {
                    currentBalance: {
                        increment: meterToken.amount,
                    },
                },
            });
            // Mark token as used? or just delete it??
            await tx.meterToken.update({
                where: {
                    id: meterToken.id,
                },
                data: {
                    status: "USED",
                },
            });
            await mqttService.publishBalance(meterToken.meterId, meterToken.amount.toNumber());
        });

    }
}