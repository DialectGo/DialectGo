const { ApolloServer, gql } = require('apollo-server');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Connect to your Supabase Database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const typeDefs = gql`
  type Translation {
    id: ID
    phrase: String
    cebuano: String
    tagalog: String
    english: String
  }

  type Query {
    # Fetch word of the day or history
    getTranslations: [Translation]
  }

  type Mutation {
    # Save a new translation from DialectoGo
    saveTranslation(phrase: String!, ceb: String!, tag: String!, eng: String!): Translation
  }
`;

const resolvers = {
  Query: {
    getPosts: async () => {
      const { data, error } = await supabase.from('translations').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
  },
  Mutation: {
    saveTranslation: async (_, { phrase, ceb, tag, eng }) => {
      const { data, error } = await supabase
        .from('translations')
        .insert([{ phrase, cebuano: ceb, tagalog: tag, english: eng }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`🚀 DialectoGo Server ready at ${url}`));