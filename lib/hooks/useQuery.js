import { useState, useRef, useLayoutEffect, useContext } from 'react';
import Query from './Query';
import { ApolloContext } from '../ApolloProvider';
import { getClient } from '../component-utils';
export default (function (props) {
    var context = useContext(ApolloContext);
    var _a = useState(null), _ = _a[0], forceUpdate = _a[1];
    var query = useRef(new Query(props, context, forceUpdate));
    var client = getClient(props, context);
    useLayoutEffect(function () {
        query.current.componentDidMount(props);
        return function () { return query.current.componentWillUnmount(); };
    }, []);
    useLayoutEffect(function () {
        query.current.removeQuerySubscription();
    }, [props.skip, props.query]);
    useLayoutEffect(function () {
        if (client !== query.current.client) {
            query.current.onClientUpdated(props, client);
        }
        query.current.updateQuery(props);
        if (!props.skip) {
            query.current.startQuerySubscription(props);
        }
    }, [props, client]);
    useLayoutEffect(function () {
        query.current.componentDidUpdate(props);
    });
    return query.current.getQueryResult(props);
});
//# sourceMappingURL=useQuery.js.map