import ApolloClient, { PureQueryOptions, ApolloError } from 'apollo-client';
import { MutationContext, MutationOptions, MutationUpdaterFn } from '../Mutation';
import { OperationVariables, RefetchQueriesProviderFn } from '../types';
import { DocumentNode } from 'graphql';
export interface MutateResult {
    called: boolean;
    loading: boolean;
    data: any;
    error: ApolloError;
    client: ApolloClient<Object>;
}
export declare type MutationRunner = (options?: MutationOptions<any, any>) => Promise<any>;
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
declare class Mutation<TData = any, TVariables = OperationVariables> {
    protected props: MutationProps<TData, TVariables>;
    protected context: MutationContext;
    private client;
    private mostRecentMutationId;
    private state;
    private hasMounted;
    constructor(props: MutationProps<TData, TVariables>, context: MutationContext);
    setState(state: any, cb?: Function): void;
    start(): void;
    finish(): void;
    api(): [MutationRunner, MutateResult];
    private runMutation;
    private mutate;
    private onMutationStart;
    private onMutationCompleted;
    private onMutationError;
    private generateNewMutationId;
    private isMostRecentMutation;
    private verifyDocumentIsMutation;
}
export default Mutation;
