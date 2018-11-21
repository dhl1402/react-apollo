import { useState, useEffect, useContext } from 'react';
import Query from './Query';
import { ApolloContext } from '../ApolloProvider';
import { getClient } from '../component-utils';
export default (function (props) {
    var context = useContext(ApolloContext);
    var _a = useState(null), _ = _a[0], forceUpdate = _a[1];
    var client = getClient(props, context);
    var query = new Query(props, context, forceUpdate);
    useEffect(function () {
        query.componentDidMount(props);
        return query.componentWillUnmount;
    }, []);
    useEffect(query.removeQuerySubscription, [props.skip, props.query]);
    useEffect(function () {
        if (client !== query.client) {
            query.onClientUpdated(props, client);
        }
        query.updateQuery(props);
        if (!props.skip) {
            query.startQuerySubscription(props);
        }
    }, [props, client]);
    useEffect(function () {
        query.componentDidUpdate(props);
    });
    return query.getQueryResult(props);
});
//# sourceMappingURL=useQuery.js.map