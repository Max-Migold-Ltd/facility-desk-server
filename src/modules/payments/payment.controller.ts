import crypto from "crypto";
import { Request, Response } from "express";
import { PaymentService } from "./services/payment.service";

export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    async verifyEvent(req: Request, res: Response) {
        const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(JSON.stringify(req.body)).digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(400).json({ message: "Invalid signature" });
        }
        const event = req.body;
        await this.paymentService.verifyEvent(event);
        res.status(200).json({ message: "Event verified successfully" });
    }

    async verifyPayment(req: Request, res: Response) {
        const transactionRef = req.params.transactionRef;
        const payment = await this.paymentService.verifyPayment(transactionRef);
        res.status(200).json(payment);
    }

    async intializeTopUp(req: Request, res: Response) {
        const { meterId, amount } = req.body;
        const payment = await this.paymentService.initializePayment({
            email: req.user?.email!,
            amount: amount * 100,
            metadata: {
                userId: req.user?.id!,
                meterId,
                paymentType: "topup",
            },
        });
        res.status(200).json(payment);
    }

    async initializeBudgetPayment(req: Request, res: Response) {
        const { costCenterId, amount } = req.body;

        const payment = await this.paymentService.initializePayment({ amount, email: req.user?.email!, metadata: { costCenterId, paymentType: "budget" } })
    }
}