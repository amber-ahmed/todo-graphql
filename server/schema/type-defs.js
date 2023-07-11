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


type LoginResponse{
    access : Boolean!
    msg : String!
    id : String
}
type Query {
    login(input : LoiginInput!) : LoginResponse!
    fetchall: TodosResult!
    search(name : String!):[Todo!]
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
type Todo{
    name : String!
    desc : String!
}
type TodosSuccess{
        access : Boolean!
        msg : String!
        todos : [Todo!]!
}
type TodosError{
        access : Boolean!
        msg : String!
}
union TodosResult = TodosSuccess | TodosError
`
export default typeDefs