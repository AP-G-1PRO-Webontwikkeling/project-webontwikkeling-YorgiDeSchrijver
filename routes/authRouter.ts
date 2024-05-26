import { Router } from "express";
import { secureMiddleware } from "../secureMiddleware";
import { login, register } from "../database";
import { User } from "../types";

export function AuthRouter(){
  const router = Router();

  router.get("/login", (req, res) => {
    if(req.session.user){
      res.redirect("/");
    } else res.render("login");
  });
  
  router.post("/login", async(req, res) => {
    const username : string = req.body.username;
    const password : string = req.body.password;
    try {
      let user : User = await login(username, password);
      user = { ...user, password: '' }; // Remove password from user object
      req.session.user = user;
      req.session.message = {type: "success", message: "Login successful"};
      res.redirect("/")
    } catch (e : any) {
      req.session.message = {type: "error", message: e.message};
      res.redirect("/login");
    }
  });

  router.get("/register", (req, res) => {
    if(req.session.user){
      res.redirect("/");
    } else res.render("register");
  });

  router.post("/register", async (req, res) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    try {
      let user : User | null = await register(username, password);
      if(user === null) throw new Error("User already exists");
      user = { ...user, password: '' }; // Remove password from user object
      req.session.message = {type: "success", message: "Register successful"};
      req.session.user = user;
      res.redirect("/");
    } catch (e : any) {
      req.session.message = {type: "error", message: e.message};
      res.redirect("/register");
    }
  });
  
  router.post("/logout", secureMiddleware, (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });

  return router;
}