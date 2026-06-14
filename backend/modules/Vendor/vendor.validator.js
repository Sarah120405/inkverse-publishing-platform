import Joi from "joi";

const createPricingSchema = Joi.object({
    perPageCost: Joi.number().positive().required(),
}).required();

const updatePrintStatusSchema = Joi.object({
    status: Joi.string().valid('Accepted', 'Rejected').required(),
}).required();

const updateDeliveryStatusSchema = Joi.object({
    deliveryStatus: Joi.string().valid('Pending', 'Printing', 'Shipped', 'Delivered').required(),
}).required();

export {
    createPricingSchema, updatePrintStatusSchema, updateDeliveryStatusSchema
}