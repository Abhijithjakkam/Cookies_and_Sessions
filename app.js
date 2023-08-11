//jshint esversion:6
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { setEngine } = require("crypto");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/userDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});


app.route("/register")
    .get((req, res)=>{
        res.render("register");
    })
    .post((req, res)=>{
        User.register(new User({username: req.body.username}), req.body.password)
            .then((user)=>{
                passport.authenticate("local")(req, res, ()=>{
                    res.redirect("/secrets");
                });
            })
            .catch((error)=>{
                console.log(error);
                res.redirect("/register");
            });
    });
app.route("/login")
    .get((req, res)=>{
    res.render("login");
    })
    .post((req, res)=>{
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (error)=>{
            if(error){
                console.log(error);
            }else{
                passport.authenticate("local")(req,res, ()=>{
                    res.redirect("/secrets");
                });
            }
        })
    })

    app.get("/logout", (req, res)=>{
        req.logout(function(err) {
          if (err) {
            console.log(err);
          }
          res.redirect("/");
        });
      });

app.listen(3000, (req, res)=>{
    console.log("Server Started on port 3000");
})
