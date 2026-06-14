import { getCommissionRate, updateCommissionRate, createSetting } from "./setting.service.js";

const getCommissionRateController = async (req, res) => {
    const result = await getCommissionRate();
    return res.status(result.status).json(result);
};

const updateCommissionRateController = async (req, res) => {
    const { newRate } = req.body;
    const result = await updateCommissionRate(newRate);
    return res.status(result.status).json(result);
};

const createSettingController = async (req, res) => {
    const { key, value } = req.body;
    const result = await createSetting(key, value);
    return res.status(result.status).json(result);
};

export { getCommissionRateController, updateCommissionRateController, createSettingController };