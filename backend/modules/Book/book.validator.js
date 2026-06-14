import Joi from "joi";

const bookSchema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().min(3).required(),
    content: Joi.string().required(),
    coverImg: Joi.string().uri().optional(),
    thumbnailImg: Joi.string().uri().optional(),
    pages: Joi.number().positive().min(1).optional(),
    publishType: Joi.string().valid('ONLINE', 'OFFLINE').optional(),
    price: Joi.number().positive().when('publishType', {
        is: "ONLINE",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    seoWords: Joi.array().items(Joi.string()).optional()

})

const updateBookSchema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    description: Joi.string().min(10).optional(),
    category: Joi.string().min(3).optional(),
    content: Joi.string().optional(),
    coverImg: Joi.string().uri().optional(),
    thumbnailImg: Joi.string().uri().optional(),
    pages: Joi.number().positive().min(1).optional(),
    publishType: Joi.string().valid('ONLINE', 'OFFLINE').optional(),
    price: Joi.number().positive().when('publishType', {
        is: "ONLINE",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    seoWords: Joi.array().items(Joi.string()).optional()

});

const publishBookSchema = Joi.object({
    publishType: Joi.string().valid('ONLINE', 'OFFLINE').required(),
    pages: Joi.number().integer().min(1).when('publishType', {
        is: "OFFLINE",
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    price: Joi.number().positive().when('publishType', {
        is: "ONLINE",
        then: Joi.required(),
        otherwise: Joi.optional()
    })
}).required().min(1);

const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(3).required()
});

const readingProgressSchema = Joi.object({
    currentPage: Joi.number().integer().min(0).required()
}).required().min(1);

export { bookSchema, updateBookSchema, publishBookSchema, reviewSchema, readingProgressSchema };