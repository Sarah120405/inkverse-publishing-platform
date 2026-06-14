import Joi from "joi";

const userSchema = Joi.object({

    name: Joi.string().required().min(3).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(12),
    role: Joi.string().valid('Reader', 'Author', 'Admin', 'Vendor').default('Reader')
});

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(12)
});

export { userSchema, loginSchema };