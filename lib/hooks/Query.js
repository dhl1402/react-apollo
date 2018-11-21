var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as PropTypes from 'prop-types';
import { ApolloError, NetworkStatus, } from 'apollo-client';
import { parser, DocumentType } from '../parser';
import { getClient } from '../component-utils';
var shallowEqual = require('fbjs/lib/shallowEqual');
var invariant = require('invariant');
function compact(obj) {
    return Object.keys(obj).reduce(function (acc, key) {
        if (obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}
function observableQueryFields(observable) {
    var fields = {
        variables: observable.variables,
        refetch: observable.refetch.bind(observable),
        fetchMore: observable.fetchMore.bind(observable),
        updateQuery: observable.updateQuery.bind(observable),
        startPolling: observable.startPolling.bind(observable),
        stopPolling: observable.stopPolling.bind(observable),
        subscribeToMore: observable.subscribeToMore.bind(observable),
    };
    return fields;
}
var Query = (function () {
    function Query(props, context, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = function () { }; }
        var _this = this;
        this.previousData = {};
        this.hasMounted = false;
        this.removeQuerySubscription = function () {
            if (_this.querySubscription) {
                _this.querySubscription.unsubscribe();
                delete _this.querySubscription;
            }
        };
        this.updateCurrentData = function () {
            if (_this.hasMounted)
                _this.forceUpdate();
        };
        this.getQueryResult = function (props) {
            var data = { data: Object.create(null) };
            Object.assign(data, observableQueryFields(_this.queryObservable));
            if (props.skip) {
                data = __assign({}, data, { data: undefined, error: undefined, loading: false });
            }
            else {
                var currentResult = _this.queryObservable.currentResult();
                var loading = currentResult.loading, partial = currentResult.partial, networkStatus = currentResult.networkStatus, errors = currentResult.errors;
                var error = currentResult.error;
                if (errors && errors.length > 0) {
                    error = new ApolloError({ graphQLErrors: errors });
                }
                Object.assign(data, { loading: loading, networkStatus: networkStatus, error: error });
                if (loading) {
                    Object.assign(data.data, _this.previousData, currentResult.data);
                }
                else if (error) {
                    Object.assign(data, {
                        data: (_this.queryObservable.getLastResult() || {}).data,
                    });
                }
                else {
                    var fetchPolicy = _this.queryObservable.options.fetchPolicy;
                    var partialRefetch = props.partialRefetch;
                    if (partialRefetch &&
                        Object.keys(currentResult.data).length === 0 &&
                        partial &&
                        fetchPolicy !== 'cache-only') {
                        Object.assign(data, { loading: true, networkStatus: NetworkStatus.loading });
                        data.refetch();
                        return data;
                    }
                    Object.assign(data.data, currentResult.data);
                    _this.previousData = currentResult.data;
                }
            }
            if (!_this.querySubscription) {
                var oldRefetch_1 = data.refetch;
                data.refetch = function (args) {
                    if (_this.querySubscription) {
                        return oldRefetch_1(args);
                    }
                    else {
                        return new Promise(function (r, f) {
                            _this.refetcherQueue = { resolve: r, reject: f, args: args };
                        });
                    }
                };
            }
            data.client = _this.client;
            return data;
        };
        this.client = getClient(props, context);
        this.context = context;
        this.forceUpdate = forceUpdate;
        this.initializeQueryObservable(props);
    }
    Query.prototype.componentDidMount = function (props) {
        this.hasMounted = true;
        if (props.skip)
            return;
        this.startQuerySubscription(props);
        if (this.refetcherQueue) {
            var _a = this.refetcherQueue, args = _a.args, resolve = _a.resolve, reject = _a.reject;
            this.queryObservable.refetch(args)
                .then(resolve)
                .catch(reject);
        }
    };
    Query.prototype.onClientUpdated = function (nextProps, nextClient) {
        this.client = nextClient;
        this.removeQuerySubscription();
        this.queryObservable = null;
        this.previousData = {};
        this.updateQuery(nextProps);
    };
    ;
    Query.prototype.componentWillUnmount = function () {
        this.removeQuerySubscription();
        this.hasMounted = false;
    };
    Query.prototype.componentDidUpdate = function (props) {
        var onCompleted = props.onCompleted, onError = props.onError;
        if (onCompleted || onError) {
            var currentResult = this.queryObservable.currentResult();
            var loading = currentResult.loading, error = currentResult.error, data = currentResult.data;
            if (onCompleted && !loading && !error) {
                onCompleted(data);
            }
            else if (onError && !loading && error) {
                onError(error);
            }
        }
    };
    Query.prototype.extractOptsFromProps = function (props) {
        var variables = props.variables, pollInterval = props.pollInterval, fetchPolicy = props.fetchPolicy, errorPolicy = props.errorPolicy, notifyOnNetworkStatusChange = props.notifyOnNetworkStatusChange, query = props.query, _a = props.displayName, displayName = _a === void 0 ? 'Query' : _a, _b = props.context, context = _b === void 0 ? {} : _b;
        this.operation = parser(query);
        invariant(this.operation.type === DocumentType.Query, "The <Query /> component requires a graphql query, but got a " + (this.operation.type === DocumentType.Mutation ? 'mutation' : 'subscription') + ".");
        return compact({
            variables: variables,
            pollInterval: pollInterval,
            query: query,
            fetchPolicy: fetchPolicy,
            errorPolicy: errorPolicy,
            notifyOnNetworkStatusChange: notifyOnNetworkStatusChange,
            metadata: { reactComponent: { displayName: displayName } },
            context: context,
        });
    };
    Query.prototype.initializeQueryObservable = function (props) {
        var opts = this.extractOptsFromProps(props);
        this.setOperations(opts);
        this.queryObservable = this.client.watchQuery(opts);
    };
    Query.prototype.setOperations = function (props) {
        if (this.context.operations) {
            this.context.operations.set(this.operation.name, {
                query: props.query,
                variables: props.variables,
            });
        }
    };
    Query.prototype.updateQuery = function (props) {
        if (!this.queryObservable) {
            this.initializeQueryObservable(props);
        }
        else {
            this.setOperations(props);
        }
        this.queryObservable.setOptions(this.extractOptsFromProps(props))
            .catch(function () { return null; });
    };
    Query.prototype.startQuerySubscription = function (props) {
        var _this = this;
        if (this.querySubscription)
            return;
        var initial = this.getQueryResult(props);
        this.querySubscription = this.queryObservable.subscribe({
            next: function (_a) {
                var data = _a.data;
                if (initial && initial.networkStatus === 7 && shallowEqual(initial.data, data)) {
                    initial = undefined;
                    return;
                }
                initial = undefined;
                _this.updateCurrentData();
            },
            error: function (error) {
                _this.resubscribeToQuery(props);
                if (!error.hasOwnProperty('graphQLErrors'))
                    throw error;
                _this.updateCurrentData();
            },
        });
    };
    ;
    Query.prototype.resubscribeToQuery = function (props) {
        this.removeQuerySubscription();
        var lastError = this.queryObservable.getLastError();
        var lastResult = this.queryObservable.getLastResult();
        this.queryObservable.resetLastResults();
        this.startQuerySubscription(props);
        Object.assign(this.queryObservable, { lastError: lastError, lastResult: lastResult });
    };
    Query.contextTypes = {
        client: PropTypes.object,
        operations: PropTypes.object,
    };
    Query.propTypes = {
        client: PropTypes.object,
        children: PropTypes.func.isRequired,
        fetchPolicy: PropTypes.string,
        notifyOnNetworkStatusChange: PropTypes.bool,
        onCompleted: PropTypes.func,
        onError: PropTypes.func,
        pollInterval: PropTypes.number,
        query: PropTypes.object.isRequired,
        variables: PropTypes.object,
        ssr: PropTypes.bool,
        partialRefetch: PropTypes.bool,
    };
    return Query;
}());
export default Query;
//# sourceMappingURL=Query.js.map