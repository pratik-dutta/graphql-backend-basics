const graphql = require("graphql");
// const _ = require("lodash");
const axios = require("axios");

const { GraphQLObjectType, GraphQLSchema, GraphQLNonNull } = graphql;

// const users = [
//   { id: "23", firstName: "Bill", age: 20 },
//   { id: "47", firstName: "Samantha", age: 21 },
// ];

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
    description: { type: graphql.GraphQLString },
    users: {
      type: new graphql.GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((resp) => resp.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: graphql.GraphQLString },
    firstName: { type: graphql.GraphQLString },
    age: { type: graphql.GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((resp) => resp.data);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: graphql.GraphQLString } },
      resolve(parentValue, args) {
        // return _.find(users, { id: args.id });
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((resp) => resp.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: graphql.GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((resp) => resp.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(graphql.GraphQLString) },
        age: { type: new GraphQLNonNull(graphql.GraphQLInt) },
        companyId: { type: graphql.GraphQLString },
      },
      resolve(parentValue, { firstName, age }) {
        return axios
          .post("http://localhost:3000/users", { firstName, age })
          .then((resp) => resp.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(graphql.GraphQLString) } },
      resolve(parentValue, args) {
        return axios
          .delete(`http://localhost:3000/users/${args.id}`)
          .then((resp) => resp.data);
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(graphql.GraphQLString) },
        firstName: { type: graphql.GraphQLString },
        age: { type: graphql.GraphQLInt },
        companyId: { type: graphql.GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .patch(`http://localhost:3000/users/${args.id}`, {
            firstName: args.firstName,
            age: args.age,
            companyId: args.companyId,
          })
          .then((resp) => resp.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
