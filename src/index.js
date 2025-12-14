import dotenv from "dotenv";
import { getLocalTime } from "./utils/dateFormatter.js";
import { app } from "./app/app.js";

dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
  const startTime = getLocalTime(); // Obtiene la hora local formateada
  console.log(`=== Server started at ${startTime} ===`);
  console.log(`=== Server running on port ${port} ===`);
});
