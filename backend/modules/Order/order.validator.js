import Joi from "joi";

const OrderSchema = Joi.object({
  books: Joi.array()
    .items(
      Joi.object({
        bookId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1),
      }),
    )
    .min(1)
    .required(),
});

/* const OrderSchema = Joi.object({
    quantity: Joi.number().min(1).optional(),
    shippingAddress: Joi.string().optional(),
    paymentMethod: Joi.string().required(),
    paymentStatus: Joi.string().optional(),
    vendorId: Joi.string().optional(),
    copies: Joi.number().min(1).optional(),
    advanceAmount: Joi.number().min(0).optional()
}) */

export { OrderSchema };
