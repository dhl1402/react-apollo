import { useState, useRef, useLayoutEffect, useContext } from 'react';
import Query from './Query';
import { OperationVariables } from '../types';
import { QueryProps } from './Query';
import { ApolloContext } from '../ApolloProvider';
import { getClient } from '../component-utils';

export default (props: QueryProps<any, OperationVariables>) => {
  const context = useContext(ApolloContext);
  const [_, forceUpdate] = useState(null);
  const query = useRef(new Query(props, context, forceUpdate));
  const client = getClient(props, context);

  useLayoutEffect(() => {
    query.current.componentDidMount(props);
    return () => query.current.componentWillUnmount();
  }, []);

  // useEffect(() => {
  //   TODO: call only when props skip or props.query changed (avoid first call)
  //   query.current.removeQuerySubscription()
  // }, [props.skip, props.query]);

  useLayoutEffect(() => {
      if (client !== query.current.client) {
        query.current.onClientUpdated(props, client);
      }
      query.current.updateQuery(props);
      if (!props.skip) {
        query.current.startQuerySubscription(props);
      }
    },
    [props, client],
  );

  useLayoutEffect(() => {
    query.current.componentDidUpdate(props);
  });

  return query.current.getQueryResult(props);
};
