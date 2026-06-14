import Joi from "joi";

const createCartSchema = Joi.object({
    bookId: Joi.string().required()
})

export { createCartSchema };