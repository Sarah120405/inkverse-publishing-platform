import { addToCart, removeFromCart, getMyCart, clearCart } from "./cart.service.js";
import { createCartSchema } from "./cart.validator.js"

const addToCartController = async (req, res) => {

    const { error } = createCartSchema.validate(req.params);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const cart = await addToCart(req.params.bookId, req.user.id);
    res.status(cart.status).json(cart);
}

const removeFromCartController = async (req, res) => {
    const remove = await removeFromCart(req.params.bookId, req.user.id);
    res.status(remove.status).json(remove);
}

const getMyCartController = async (req, res) => {
    const cart = await getMyCart(req.user.id)
    res.status(cart.status).json(cart);
}

const clearCartController = async (req, res) => {
    const remove = await clearCart(req.user.id);
    res.status(remove.status).json(remove);
}
export { addToCartController, removeFromCartController, getMyCartController, clearCartController };