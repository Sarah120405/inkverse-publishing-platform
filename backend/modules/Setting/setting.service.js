import prisma from '../../config/db.config.js';
import response from "../../utils/response.js";

const createSetting = async (key, value) => {
    try {
        const setting = await prisma.setting.create({
            data: {
                key,
                value
            }
        });
        return response(200, true, "Setting created successfully", setting, null);
    } catch (error) {
        return response(500, false, "Error occurred while creating setting", null, error);
    }
}
const getCommissionRate = async () => {
    try {
        const rate = await prisma.setting.findUnique({
            where: {
                key: "commission_rate"
            }
        });
        return response(200, true, "Commission rate retrieved successfully", rate.value, null);
    } catch (error) {
        return response(500, false, "Error occurred while retrieving commission rate", null, error);
    }
}

const updateCommissionRate = async (newRate) => {
    try {
        const rate = parseFloat(newRate);
        if (isNaN(rate) || rate <= 0 || rate > 1) {
            return response(400, false, "Invalid commission rate. It must be a number between 0 and 1.", null, null);
        }
        const updatedRate = await prisma.setting.update({
            where: {
                key: "commission_rate"
            },
            data: {
                value: String(rate)
            }
        });
        return response(200, true, "Commission rate updated successfully", updatedRate, null);
    } catch (error) {
        return response(500, false, "Error occurred while updating commission rate", null, error);
    }
}

export { getCommissionRate, updateCommissionRate, createSetting };
