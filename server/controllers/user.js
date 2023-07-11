import express from "express";
import userModel from "../db_user_model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { createClient } from "redis";
import { Client } from "@elastic/elasticsearch";

const router = express.Router();
dotenv.config();
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
client.on("error", (err) => console.log("Redis Client Error", err));

const elasticClient = new Client({
  cloud: {
    id: process.env.ELASTIC_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await userModel.findOne({ email });
    if (!userFound)
      return res
        .status(401)
        .json({ success: false, msg: "Account does not exist" });
    const matchPassword = await bcrypt.compare(password, userFound.password);
    if (!matchPassword)
      return res.status(401).json({
        success: false,
        msg: "Unauthorized success/wrong password",
      });
    res.status(200).json({
      access: true,
      msg: "login successfully",
      id: userFound._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});
router.post("/register", async (req, res) => {
  try {
    let userFound = await userModel.findOne(
      { email: req.body.email },
      { email: 1 }
    );
    if (userFound) {
      return res
        .status(409)
        .json({ msg: "Account already exists.", success: false });
    }
    if (req.body.password != req.body.cpassword)
      return res
        .status(400)
        .json({ msg: "password does not match", success: false });
    req.body.password = await bcrypt.hash(req.body.password, 12);
    const user = new userModel(req.body);
    await user.save();

    res.status(200).json({
      access: true,
      msg: "register successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});

router.get("/fetchall", async (req, res) => {
  try {
    await client.connect();
    const { id } = req.headers;
    let value = await client.HGETALL(id);
    console.log(value);
    value = Object.entries(value).map(([name, desc]) => ({ name, desc }));

    res.status(200).json({ access: true, msg: "fetched", todos: value });
    await client.disconnect();
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});

router.post("/addnedit", async (req, res) => {
  try {
    const { name, desc } = req.body;
    console.log(req.body)
    const { id } = req.headers;
    await client.connect();
    const result = await client.HSET(id, name, desc);
    console.log(result);
    await client.disconnect();

    //elasticsearch
    const todo = { userId: id, desc, name };
    await elasticClient.index({ index: "todo", id: name, body: todo });
    res.send("added");
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});
router.get("/search/:text", async (req, res) => {
  try {
    const { text } = req.params;
    const { id } = req.headers;
    console.log(text, id);
    // const response = await elasticClient.search({
    //   index: "todo",
    //   body: {
    //     query: {
    //       bool: {
    //         must: [
    //           { term: { _id: id } },
    //           {
    //             bool: {
    //               should: [
    //                 { match: { name: text } },
    //                 { match: { desc: text } },
    //               ],
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   },
    // });

    const response = await elasticClient.search({
      index: 'todo',
      body: {
        query: {
          multi_match: {
            query : text,
            fields: ['name', 'desc'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    const todos = response.hits.hits.map(hit=>({name : hit._source.name, desc : hit._source.desc,userId : hit._source.userId}));
    res.send(todos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});
router.delete("/delete/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { id } = req.headers;
    await client.connect();
    const result = await client.HDEL(id, name);
    console.log(result);
    await client.disconnect();

    const searchResponse = await elasticClient.delete({
      index: "todo",
      id: name,
    });

    res.status(200).json({ access: true, msg: "deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ access: false, msg: "server error" });
  }
});
export default router;
