import app from "./app.js";
import database from "./config/database.js";

//call to config file
import { config } from "dotenv";
config();

//call to database
database();

const PORT = process.env.PORT;
app.listen(process.env.PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`Server is working on http//localhost:${PORT}`);
});
