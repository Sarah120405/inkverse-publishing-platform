import Joi from "joi";

const OrderSchema = Joi.object({
    quantity: Joi.number().min(1).optional(),
    shippingAddress: Joi.string().optional(),
    paymentMethod: Joi.string().required(),
    paymentStatus: Joi.string().optional(),
    vendorId: Joi.string().optional(),
    copies: Joi.number().min(1).optional(),
    advanceAmount: Joi.number().min(0).optional()
})

export { OrderSchema };
