import axios from "axios";

export class PaymentService {

    async initializePayment(data: { email: string, amount: number, metadata: any }) {
        const response = await axios.post(`https://api.paystack.co/transaction/initialize`, data, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        return response.data;
    }

    async verifyPayment(transactionRef: string) {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${transactionRef}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        return response.data;
    }

    async verifyEvent(event: any) {
        const { eventType, data } = event;

        switch (eventType) {
            // Transactions successful
            case "charge.success":
                await this.handleSuccessfulCharge(data);
                break;
            case "transfer.success":
                await this.handleSuccessfulTransfer(data);
                break;
            case "transfer.failed":
                await this.handleFailedTransfer(data);
                break;
            case "transfer.reversed":
                await this.handleTransferReversed(data);
                break;
            //REFUNDS
            case "refund.pending":
                await this.handleRefundPending(data);
                break;
            case "refund.processed":
                await this.handleRefundProcessed(data);
                break;
            case "refund.failed":
                await this.handleRefundFailed(data);
                break;
            //CUSTOMER IDENTIFICATION
            case "customeridentification.success":
                await this.handleCustomerIdentificationSuccess(data);
                break;
            case "customeridentification.failed":
                await this.handleCustomerIdentificationFailed(data);
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        // Check for payment type too
        switch (data.metadata.paymentType) {
            case "topup":
                await this.handleTopUpPayment(data.metadata.userId, data.metadata.meterId, data.amount, data.transactionRef);
                break;
            case "budget":
                await this.handleBudgetPayment(data.metadata.costCenterId, data.amount, data.transactionRef);
                break;
            default:
                console.log(`Unhandled payment type: ${data.metadata.paymentType}`);
        }
    }


    private async handleBudgetPayment(costCenterId: string, amount: number, transactionRef: string) {
        // const payment = await this.prisma.utilityPayment.create({
        //     data: {
        //         userId,
        //         meterId,
        //         amount,
        //         transactionRef,
        //     },
        // });
        // return payment;
    }

    private async handleTopUpPayment(userId: string, meterId: string, amount: number, transactionRef: string) { }


    private async handleSuccessfulCharge(data: any) {
        const { reference, amount, message, gateway_response, paid_at, channel, currency, metadata, customer } = data;
        console.log("Successful charge:", data);
    }

    private async handleSuccessfulTransfer(data: any) {
        const { reference, amount, currency, reason, status, recipient, transfer_code } = data;
        console.log("Successful transfer:", data);
    }

    private async handleFailedTransfer(data: any) {
        const { reference, amount, currency, reason, status, recipient, transfer_code } = data;
        console.log("Failed transfer:", data);
    }

    private async handleTransferReversed(data: any) {
        const { reference, amount, currency, reason, status, transfer_code, transferred_at, recipient } = data;
        console.log("Transfer reversed:", data);
    }

    private async handleRefundPending(data: any) {
        const { transaction_reference, amount, currency, customer } = data;
        console.log("Refund pending:", data);
    }

    private async handleRefundFailed(data: any) {
        const { transaction_reference, refund_reference, amount, currency, customer } = data;
        console.log("Refund failed:", data);
    }

    private async handleRefundProcessed(data: any) {
        const { transaction_reference, refund_reference, amount, currency, customer } = data;
        console.log("Refund processed:", data);
    }
    private async handleCustomerIdentificationSuccess(data: any) {
        const { customer_id, customer_code, email, identification } = data;
        console.log("Customer identification success:", data);
    }

    private async handleCustomerIdentificationFailed(data: any) {
        const { customer_id, customer_code, email, reason } = data;
        console.log("Customer identification failed:", data);
    }
}