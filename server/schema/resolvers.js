import userModel from "../db_user_model.js";
import bcrypt from "bcrypt";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
import { Client } from "@elastic/elasticsearch";
const elasticClient = new Client({
    cloud: {
        id: process.env.ELASTIC_ID,
    },
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
});
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});
client.on("error", (err) => console.log("Redis Client Error", err));
(async () => {
    await client.connect()
})()
const resolvers = {
    Query: {
        login: async (parent, args) => {
            const { email, password } = args.input
            console.log(args)
            try {
                const userFound = await userModel.findOne({ email });
                if (!userFound)
                    return { access: false, msg: "Account does not exist" }
                const matchPassword = await bcrypt.compare(password, userFound.password);
                if (!matchPassword)
                    return {
                        access: false,
                        msg: "Unauthorized access/wrong password",
                    }
                console.log('id', userFound._id)
                return {
                    access: true,
                    msg: "login successfully",
                    id: userFound._id,
                }
            } catch (error) {
                console.log(error);
                return { access: false, msg: "server error" }
            }
        },
        fetchall: async (parent, args, context) => {
            try {
                console.log(context.headers)

                const { id } = context.headers;
                let todos = await client.HGETALL(id);
                todos = Object.entries(todos).map(([name, desc]) => ({ name, desc }));
                console.log(todos);
                return { access: true, msg: 'fetch', todos }
            } catch (error) {
                console.log(error);
                return { access: false, msg: 'server error' }
            }
        },
        search: async (parent, args, context) => {
            try {
                const { name } = args;
                const { id } = context.headers;
                console.log(name, id);
                const response = await elasticClient.search({
                    index: 'todo',
                    body: {
                        query: {
                            multi_match: {
                                query: name,
                                fields: ['name', 'desc'],
                                fuzziness: 'AUTO',
                            },
                        },
                    },
                });

                const todos = response.hits.hits.map(hit => ({ name: hit._source.name, desc: hit._source.desc, userId: hit._source.userId }));
                return todos
            } catch (error) {
                console.log(error);
                return [];
            }
        }
    },
    Mutation: {
        register: async (parent, args) => {
            try {
                let { email, password, cpassword, username } = args.input
                let userFound = await userModel.findOne(
                    { email: email },
                    { email: 1 }
                );
                if (userFound) {
                    return { msg: "Account already exists.", access: false }
                }
                if (password != cpassword)
                    return { msg: "password does not match", access: false }
                password = await bcrypt.hash(password, 12);
                const user = new userModel({ username, email, password });
                await user.save();

                return {
                    access: true,
                    msg: "register successfully",
                }
            } catch (error) {
                console.log(error);
                return { access: false, msg: "server error" }
            }
        },

        addnedit: async (parent, args, context) => {
            try {
                const { name, desc } = args.input;
                const { id } = context.headers;
                console.log(id, name, desc)
                const result = await client.HSET(id, name, desc);
                console.log(result);

                //elasticsearch
                const todo = { userId: id, desc, name };
                await elasticClient.index({ index: "todo", id: name, body: todo });
                return { msg: 'added/updated', access: true }
            } catch (error) {
                console.log(error);
                return { access: false, msg: "server error" }
            }
        },

        delete: async (parent, args, context) => {
            try {
                const { name } = args;
                const { id } = context.headers;
                const result = await client.HDEL(id, name);
                console.log(result);

                const searchResponse = await elasticClient.delete({
                    index: "todo",
                    id: name,
                });

                return { access: true, msg: "deleted" }
            } catch (error) {
                console.log(error);
                return { access: false, msg: "server error" }
            }
        }
    },


    TodosResult: {
        __resolveType(obj) {
            console.log(obj)
            if (obj.todos) return "TodosSuccess"
            return "TodosError"
        }
    }
}
export default resolvers