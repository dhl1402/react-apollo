import { useState, useRef, useEffect, useContext } from 'react';
import Query from './Query';
import { ApolloContext } from '../ApolloProvider';
import { getClient } from '../component-utils';
export default (function (props) {
    var context = useContext(ApolloContext);
    var _a = useState(null), _ = _a[0], forceUpdate = _a[1];
    var query = useRef(new Query(props, context, forceUpdate));
    var client = getClient(props, context);
    useEffect(function () {
        query.current.componentDidMount(props);
        return query.current.componentWillUnmount;
    }, []);
    useEffect(query.current.removeQuerySubscription, [props.skip, props.query]);
    useEffect(function () {
        if (client !== query.current.client) {
            query.current.onClientUpdated(props, client);
        }
        query.current.updateQuery(props);
        if (!props.skip) {
            query.current.startQuerySubscription(props);
        }
    }, [props, client]);
    useEffect(function () {
        query.current.componentDidUpdate(props);
    });
    return query.current.getQueryResult(props);
});
//# sourceMappingURL=useQuery.js.map