import { createOrder, getMyOrder } from "./order.service.js";
import { OrderSchema } from "./order.validator.js";

const createOrderController = async (req, res) => {
    const { error } = OrderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const order = await createOrder(req.params.bookId, req.user.id, req.body);
    return res.status(order.status).json(order);
}

const getMyOrderController = async (req, res) => {
    const myOrder = await getMyOrder(req.user.id);
    return res.status(myOrder.status).json(myOrder)
}

export { createOrderController, getMyOrderController };
