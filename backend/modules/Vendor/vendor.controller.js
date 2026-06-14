import {
    getPendingOrders, getPrintDetail, createPricing, getPricing,
    getVendorDashboardData, updatePrintStatus, updateDeliveryStatus, getMyOrders
} from './vendor.service.js';
import { createPricingSchema, updatePrintStatusSchema, updateDeliveryStatusSchema } from './vendor.validator.js';

const createPricingController = async (req, res) => {
    const { error } = createPricingSchema.validate(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }

    const pricing = await createPricing(req.body, req.user.id);
    return res.status(pricing.status).json(pricing);
};

const getPricingController = async (req, res) => {
    const pricing = await getPricing(req.user.id);
    return res.status(pricing.status).json(pricing);
}
const getPendingOrdersController = async (req, res) => {
    const pendingOrders = await getPendingOrders(req.user.id);
    return res.status(pendingOrders.status).json(pendingOrders);
};

const getPrintDetailController = async (req, res) => {
    const printDetail = await getPrintDetail(req.params.orderId, req.user.id);
    return res.status(printDetail.status).json(printDetail);
};

const updatePrintStatusController = async (req, res) => {
    const { error } = updatePrintStatusSchema.validate(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    const printStatus = await updatePrintStatus(req.params.orderId, req.body.status, req.user.id);
    return res.status(printStatus.status).json(printStatus);
}

const updateDeliveryStatusController = async (req, res) => {
    const { error } = updateDeliveryStatusSchema.validate(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    const deliveryStatus = await updateDeliveryStatus(req.params.orderId, req.body.deliveryStatus, req.user.id);
    return res.status(deliveryStatus.status).json(deliveryStatus);
}
const dashboardController = async (req, res) => {
    const dashboardData = await getVendorDashboardData(req.user.id);
    return res.status(dashboardData.status).json(dashboardData);
}
const getMyOrdersController = async (req, res) => {
    const myOrders = await getMyOrders(req.user.id);
    return res.status(myOrders.status).json(myOrders);
}
export {
    createPricingController, getPricingController, getPendingOrdersController,
    getPrintDetailController, updatePrintStatusController, updateDeliveryStatusController, dashboardController, getMyOrdersController
};