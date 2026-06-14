import { PaymentStatus } from "@prisma/client";
import Joi from "joi";

const payoutRequestSchema = Joi.object({
    amount: Joi.number().positive().required(),
    bankDetails: Joi.string().required(),
});

export { payoutRequestSchema };