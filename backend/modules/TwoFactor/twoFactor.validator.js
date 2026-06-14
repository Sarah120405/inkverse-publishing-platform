import Joi from "joi";

export const verifySecretSchema = Joi.object({
    token: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

export const verifyLoginOTPSchema = Joi.object({
    tempToken: Joi.string().required(),
    token: Joi.string().length(6).pattern(/^[0-9]+/).required()
});
