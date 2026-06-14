import { requestPayout, getAllPayoutRequest, processPayout } from './payout.service.js';
import { payoutRequestSchema } from './payout.validator.js';

const requestPayoutController = async (req, res) => {
    const { error } = payoutRequestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null,
            error: null
        });
    }
    const result = await requestPayout(req.body, req.user.id);
    res.status(result.status).json(result);
};

const getAllPayoutRequestController = async (req, res) => {
    const result = await getAllPayoutRequest();
    res.status(result.status).json(result);
};

const processPayoutController = async (req, res) => {
    const result = await processPayout(req.body);
    res.status(result.status).json(result);
}

export { requestPayoutController, getAllPayoutRequestController, processPayoutController };
