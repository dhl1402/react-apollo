import { useContext } from 'react';
import { ApolloContext } from '../ApolloProvider';
import ApolloClient from 'apollo-client';

export default (): ApolloClient<Object> => {
  const context: any = useContext(ApolloContext);
  return context.client;
};
