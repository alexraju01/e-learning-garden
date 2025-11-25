import { Request, Response } from "express";
import User from "../models/user.model";

export const getAllUsers = async(req:Request, res:Response) => {
    const users = await User.findAll();
    res.status(200).json({ status: "success", results: users.length, data: users });
};

