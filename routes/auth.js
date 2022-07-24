const router = require("express").Router();
const CryptoJs = require("crypto-js");
const { Router } = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJs.AES.encrypt(
      req.body.password,
      process.env.PAS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("wrong credentials!");

    const hashedpassword = CryptoJs.AES.decrypt(
      user.password,
      process.env.PAS_SEC
    );
    const originalPassword = hashedpassword.toString(CryptoJs.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("wrong credentials!");

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...rest } = user._doc;

    res.status(200).json({ ...rest, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
