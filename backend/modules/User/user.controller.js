import { userProfileService, profileUpdateService, dashboardService } from "./user.service.js";

const userProfileController = async (req, res) => {
    const profile = await userProfileService(req.params);
    return res.status(profile.status).json(profile);
}

const profileUpdateController = async (req, res) => {
    const profile = await profileUpdateService(req.body);
    return res.status(profile.status).json(profile);
}

const dashboardController = async (req, res) => {
    const dashboard = await dashboardService(req.user.id, req.user.role);
    return res.status(dashboard.status).json(dashboard);
}

export { userProfileController, profileUpdateController, dashboardController }
