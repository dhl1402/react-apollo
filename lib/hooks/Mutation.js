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
import { ApolloError } from 'apollo-client';
import { getClient } from '../component-utils';
import { parser, DocumentType } from '../parser';
var invariant = require('invariant');
var initialState = {
    loading: false,
    called: false,
    error: undefined,
    data: undefined,
};
var Mutation = (function () {
    function Mutation(props, context) {
        var _this = this;
        this.props = props;
        this.context = context;
        this.hasMounted = false;
        this.runMutation = function (options) {
            if (options === void 0) { options = {}; }
            _this.onMutationStart();
            var mutationId = _this.generateNewMutationId();
            return _this.mutate(options)
                .then(function (response) {
                _this.onMutationCompleted(response, mutationId);
                return response;
            })
                .catch(function (e) {
                _this.onMutationError(e, mutationId);
                if (!_this.props.onError)
                    throw e;
            });
        };
        this.mutate = function (options) {
            var _a = _this.props, mutation = _a.mutation, variables = _a.variables, optimisticResponse = _a.optimisticResponse, update = _a.update, _b = _a.context, context = _b === void 0 ? {} : _b, _c = _a.awaitRefetchQueries, awaitRefetchQueries = _c === void 0 ? false : _c;
            var mutateOptions = __assign({}, options);
            var refetchQueries = mutateOptions.refetchQueries || _this.props.refetchQueries;
            if (refetchQueries && refetchQueries.length && Array.isArray(refetchQueries)) {
                refetchQueries = refetchQueries.map(function (x) {
                    if (typeof x === 'string' && _this.context.operations)
                        return _this.context.operations.get(x) || x;
                    return x;
                });
                delete mutateOptions.refetchQueries;
            }
            var mutateVariables = Object.assign({}, variables, mutateOptions.variables);
            delete mutateOptions.variables;
            return _this.client.mutate(__assign({ mutation: mutation,
                optimisticResponse: optimisticResponse,
                refetchQueries: refetchQueries,
                awaitRefetchQueries: awaitRefetchQueries,
                update: update,
                context: context, variables: mutateVariables }, mutateOptions));
        };
        this.onMutationStart = function () {
            if (!_this.state.loading && !_this.props.ignoreResults) {
                _this.setState({
                    loading: true,
                    error: undefined,
                    data: undefined,
                    called: true,
                });
            }
        };
        this.onMutationCompleted = function (response, mutationId) {
            if (_this.hasMounted === false) {
                return;
            }
            var _a = _this.props, onCompleted = _a.onCompleted, ignoreResults = _a.ignoreResults;
            var data = response.data, errors = response.errors;
            var error = errors && errors.length > 0 ? new ApolloError({ graphQLErrors: errors }) : undefined;
            var callOncomplete = function () { return (onCompleted ? onCompleted(data) : null); };
            if (_this.isMostRecentMutation(mutationId) && !ignoreResults) {
                _this.setState({ loading: false, data: data, error: error }, callOncomplete);
            }
            else {
                callOncomplete();
            }
        };
        this.onMutationError = function (error, mutationId) {
            if (_this.hasMounted === false) {
                return;
            }
            var onError = _this.props.onError;
            var callOnError = function () { return (onError ? onError(error) : null); };
            if (_this.isMostRecentMutation(mutationId)) {
                _this.setState({ loading: false, error: error }, callOnError);
            }
            else {
                callOnError();
            }
        };
        this.generateNewMutationId = function () {
            _this.mostRecentMutationId = _this.mostRecentMutationId + 1;
            return _this.mostRecentMutationId;
        };
        this.isMostRecentMutation = function (mutationId) {
            return _this.mostRecentMutationId === mutationId;
        };
        this.verifyDocumentIsMutation = function (mutation) {
            var operation = parser(mutation);
            invariant(operation.type === DocumentType.Mutation, "The <Mutation /> component requires a graphql mutation, but got a " + (operation.type === DocumentType.Query ? 'query' : 'subscription') + ".");
        };
        this.props = props;
        this.context = context;
        this.client = getClient(props, context);
        this.verifyDocumentIsMutation(props.mutation);
        this.mostRecentMutationId = 0;
        this.state = initialState;
    }
    Mutation.prototype.setState = function (state, cb) {
        this.state = __assign({}, this.state, state);
        if (cb) {
            cb();
        }
    };
    Mutation.prototype.start = function () {
        this.hasMounted = true;
    };
    Mutation.prototype.finish = function () {
        this.hasMounted = false;
    };
    Mutation.prototype.api = function () {
        var _a = this.state, loading = _a.loading, data = _a.data, error = _a.error, called = _a.called;
        var result = {
            called: called,
            loading: loading,
            data: data,
            error: error,
            client: this.client,
        };
        return [this.runMutation, result];
    };
    return Mutation;
}());
export default Mutation;
//# sourceMappingURL=Mutation.js.map