import "./env";
import { app } from "./app";

const port = Number(process.env.PORT) || 4100;
app.listen(port, () => console.log(`Listening on ${port}`));
