import { useContext } from 'react';
import { ApolloContext } from '../ApolloProvider';
export default (function () {
    var context = useContext(ApolloContext);
    return context.client;
});
//# sourceMappingURL=useClient.js.map