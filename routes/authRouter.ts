import { Router } from "express";
import { secureMiddleware } from "../secureMiddleware";
import { login } from "../database";
import { User } from "../types";

export function AuthRouter(){
  const router = Router();

  router.get("/login", (req, res) => {
    if(req.session.user){
      res.redirect("/");
    } else res.render("login");
  });
  
  router.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
      let user : User = await login(email, password);
      user = { ...user, password: '' }; // Remove password from user object
      req.session.user = user;
      res.redirect("/")
    } catch (e : any) {
      res.redirect("/login");
    }
  });
  
  router.post("/logout", secureMiddleware, (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
}