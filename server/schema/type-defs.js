import { gql } from "apollo-server-express";
const typeDefs = gql`
type User {
    id : ID!
    username : String!
    email : String!
    password : String!
}
type Response {
    access : Boolean!
    msg : String!
}
input LoiginInput{
    email : String!
    password : String!
}
input RegisterInput{
    email : String!
    password : String!
    cpassword : String!
    username : String!
}

type Todos{
    name : String!
    desc : String!
}
type LoginResponse{
    access : Boolean!
    msg : String!
    id : String
}
type Query {
    login(input : LoiginInput!) : LoginResponse!
    fetchall: [Todos!]
    search(name : String!):[Todos!]
}
input AddnEditInput{
    name : String!
    desc : String!
}
type Mutation{
    register(input : RegisterInput!) : Response!
    addnedit(input : AddnEditInput!) : Response!
    delete(name : String!) : Response!
}
`
export default typeDefs