import { useContext } from 'react';
import { ApolloContext } from '../ApolloProvider';

export default () => {
  const context: any = useContext(ApolloContext);
  return context.client;
};
