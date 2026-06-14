import express from "express";
import index_api from "./index_api.js";
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', index_api);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

export default app;