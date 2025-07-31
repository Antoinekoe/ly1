import app from "./src/app.js";
import env from "dotenv";
// Load environment variables
env.config();

const port = process.env.PORT || 3000;
// Start server
app.listen(port);
