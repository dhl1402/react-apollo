import { useRef, useEffect, useContext } from 'react';
import Mutation from './Mutation';
import { OperationVariables } from '../types';
import { MutationProps } from './Mutation';
import { ApolloContext } from '../ApolloProvider';

export default (props: MutationProps<any, OperationVariables>) => {
  const context: any = useContext(ApolloContext);
  const mutation = useRef(new Mutation(props, context));

  useEffect(() => {
    mutation.current.start();
    return () => {
      mutation.current.finish();
    };
  });
  return mutation.current.api();
};
