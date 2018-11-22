import { useRef, useEffect, useContext } from 'react';
import Mutation from './Mutation';
import { ApolloContext } from '../ApolloProvider';
export default (function (props) {
    var context = useContext(ApolloContext);
    var mutation = useRef(new Mutation(props, context));
    useEffect(function () {
        mutation.current.start();
        return function () {
            mutation.current.finish();
        };
    });
    return mutation.current.api();
});
//# sourceMappingURL=useMutation.js.map