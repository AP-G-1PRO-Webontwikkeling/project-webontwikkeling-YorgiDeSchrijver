import express from "express";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import { connect } from "./database";
import "dotenv/config";
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";
import { AuthRouter } from "./routes/authRouter";
import { DashboardRouter } from "./routes/dashboardRouter";
import { flashMiddleware } from "./flashMiddleware";

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});

const app = express();

app.use(connectLiveReload());
app.use(session);

app.set("view engine", "ejs");
app.set("port", 3000);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flashMiddleware);

//Routes
app.use(AuthRouter());
app.use(DashboardRouter(), secureMiddleware);


app.listen(app.get("port"), async () => {
  try{
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

module.exports = app;