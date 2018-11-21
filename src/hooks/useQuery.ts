import { useState, useEffect, useContext } from 'react';
import Query from './Query';
import { OperationVariables } from '../types';
import { QueryProps } from './Query';
import { ApolloContext } from '../ApolloProvider';
import { getClient } from '../component-utils';

export default (props: QueryProps<any, OperationVariables>) => {
  const context = useContext(ApolloContext);
  const [_, forceUpdate] = useState(null);
  const client = getClient(props, context);
  const query = new Query(props, context, forceUpdate);

  useEffect(() => {
    query.componentDidMount(props);
    return query.componentWillUnmount;
  }, []);

  useEffect(query.removeQuerySubscription, [props.skip, props.query]);

  useEffect(() => {
    if (client !== query.client) {
      query.onClientUpdated(props, client);
    }
    query.updateQuery(props);
    if(!props.skip) {
      query.startQuerySubscription(props);
    }
  }, [props, client])

  useEffect(() => {
    query.componentDidUpdate(props);
  });

  return query.getQueryResult(props);
}

