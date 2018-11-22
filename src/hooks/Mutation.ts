import ApolloClient, { PureQueryOptions, ApolloError } from 'apollo-client';
import { MutationContext, MutationOptions, ExecutionResult, MutationUpdaterFn } from '../Mutation';
import { OperationVariables, RefetchQueriesProviderFn } from '../types';
import { getClient } from '../component-utils';
import { DocumentNode } from 'graphql';
import { parser, DocumentType } from '../parser';
const invariant = require('invariant');

const initialState = {
  loading: false,
  called: false,
  error: undefined,
  data: undefined,
};

export interface MutateResult {
  called: boolean;
  loading: boolean;
  data: any;
  error: ApolloError;
  client: ApolloClient<Object>;
}

export type MutationRunner = (options?: MutationOptions<any, any>) => Promise<any>;

export interface MutationProps<TData = any, TVariables = OperationVariables> {
  client?: ApolloClient<Object>;
  mutation: DocumentNode;
  ignoreResults?: boolean;
  optimisticResponse?: TData;
  variables?: TVariables;
  refetchQueries?: Array<string | PureQueryOptions> | RefetchQueriesProviderFn;
  awaitRefetchQueries?: boolean;
  update?: MutationUpdaterFn<TData>;
  onCompleted?: (data: TData) => void;
  onError?: (error: ApolloError) => void;
  context?: Record<string, any>;
}

class Mutation<TData = any, TVariables = OperationVariables> {
  private client: ApolloClient<any>;
  private mostRecentMutationId: number;
  private state: any;
  private hasMounted: boolean = false;

  constructor(
    protected props: MutationProps<TData, TVariables>,
    protected context: MutationContext,
  ) {
    this.props = props;
    this.context = context;
    this.client = getClient(props, context);
    this.verifyDocumentIsMutation(props.mutation);
    this.mostRecentMutationId = 0;
    this.state = initialState;
  }

  setState(state: any, cb?: Function) {
    this.state = {
      ...this.state,
      ...state,
    };
    if (cb) {
      cb();
    }
  }

  // used by hook
  start() {
    this.hasMounted = true;
  }

  // used by hook
  finish() {
    this.hasMounted = false;
  }

  // render
  // use by hook
  api(): [MutationRunner, MutateResult] {
    const { loading, data, error, called } = this.state;
    const result = {
      called,
      loading,
      data,
      error,
      client: this.client,
    };
    return [this.runMutation, result];
  }

  private runMutation = (options: MutationOptions<TData, TVariables> = {}) => {
    this.onMutationStart();
    const mutationId = this.generateNewMutationId();

    return this.mutate(options)
      .then(response => {
        this.onMutationCompleted(response, mutationId);
        return response;
      })
      .catch(e => {
        this.onMutationError(e, mutationId);
        if (!this.props.onError) throw e;
      });
  };

  private mutate = (options: MutationOptions<TData, TVariables>) => {
    const {
      mutation,
      variables,
      optimisticResponse,
      update,
      context = {},
      awaitRefetchQueries = false,
    } = this.props;
    const mutateOptions = { ...options };

    let refetchQueries = mutateOptions.refetchQueries || this.props.refetchQueries;
    // XXX this will be removed in the 3.0 of Apollo Client. Currently, we
    // support refectching of named queries which just pulls the latest
    // variables to match. This forces us to either a) keep all queries around
    // to be able to iterate over and refetch, or b) [new in 2.1] keep a map of
    // operations on the client where operation name => { query, variables }
    //
    // Going forward, we should only allow using the full operation + variables to
    // refetch.
    if (refetchQueries && refetchQueries.length && Array.isArray(refetchQueries)) {
      refetchQueries = (refetchQueries as any).map((x: string | PureQueryOptions) => {
        if (typeof x === 'string' && this.context.operations)
          return this.context.operations.get(x) || x;
        return x;
      });
      delete mutateOptions.refetchQueries;
    }

    const mutateVariables = Object.assign({}, variables, mutateOptions.variables);
    delete mutateOptions.variables;

    return this.client.mutate({
      mutation,
      optimisticResponse,
      refetchQueries,
      awaitRefetchQueries,
      update,
      context,
      variables: mutateVariables,
      ...mutateOptions,
    });
  };

  private onMutationStart = () => {
    if (!this.state.loading && !this.props.ignoreResults) {
      this.setState({
        loading: true,
        error: undefined,
        data: undefined,
        called: true,
      });
    }
  };

  private onMutationCompleted = (response: ExecutionResult<TData>, mutationId: number) => {
    if (this.hasMounted === false) {
      return;
    }
    const { onCompleted, ignoreResults } = this.props;

    const { data, errors } = response;
    const error =
      errors && errors.length > 0 ? new ApolloError({ graphQLErrors: errors }) : undefined;

    const callOncomplete = () => (onCompleted ? onCompleted(data as TData) : null);

    if (this.isMostRecentMutation(mutationId) && !ignoreResults) {
      this.setState({ loading: false, data, error }, callOncomplete);
    } else {
      callOncomplete();
    }
  };

  private onMutationError = (error: ApolloError, mutationId: number) => {
    if (this.hasMounted === false) {
      return;
    }
    const { onError } = this.props;
    const callOnError = () => (onError ? onError(error) : null);

    if (this.isMostRecentMutation(mutationId)) {
      this.setState({ loading: false, error }, callOnError);
    } else {
      callOnError();
    }
  };

  private generateNewMutationId = (): number => {
    this.mostRecentMutationId = this.mostRecentMutationId + 1;
    return this.mostRecentMutationId;
  };

  private isMostRecentMutation = (mutationId: number) => {
    return this.mostRecentMutationId === mutationId;
  };

  private verifyDocumentIsMutation = (mutation: DocumentNode) => {
    const operation = parser(mutation);
    invariant(
      operation.type === DocumentType.Mutation,
      `The <Mutation /> component requires a graphql mutation, but got a ${
        operation.type === DocumentType.Query ? 'query' : 'subscription'
      }.`,
    );
  };
}

export default Mutation;
