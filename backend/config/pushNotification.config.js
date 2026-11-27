import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const webPushModule = require("web-push");

const webpush = webPushModule.default || webPushModule;

webpush.setVapidDetails(
  "mailto:sarahqureshi2005@gmail.com",
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VITE_VAPID_PRIVATE_KEY,
);

export default webpush;
