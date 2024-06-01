import { Router } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(404).json({
        isSuccess: false,
        error: "User does not exist",
      });
    } else if (existing.password !== password) {
      return res.status(400).json({
        isSuccess: false,
        error: "Incorrect password",
      });
    } else {
      jwt.sign({ email }, "secretkey", (err, token) => {
        if (err) {
          return res.status(500).json({
            isSuccess: false,
            error: err,
          });
        }
        return res.status(200).json({
          isSuccess: true,
          token,
        });
      });
    }
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      error: err,
    });
  }
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        isSuccess: false,
        error: "User already exists",
      });
    }

    const newUser = new User({ email, password });
    newUser.save();
    return res.status(200).json({ isSuccess: true, user: newUser });
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      error: err,
    });
  }
});

export { router };
