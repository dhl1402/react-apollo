import * as React from 'react';
import * as PropTypes from 'prop-types';
import ApolloClient, { ObservableQuery, ApolloError, FetchPolicy, ErrorPolicy, ApolloQueryResult, NetworkStatus, FetchMoreOptions, FetchMoreQueryOptions } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { OperationVariables } from '../types';
export declare type ObservableQueryFields<TData, TVariables> = Pick<ObservableQuery<TData, TVariables>, 'startPolling' | 'stopPolling' | 'subscribeToMore' | 'updateQuery' | 'refetch' | 'variables'> & {
    fetchMore: (<K extends keyof TVariables>(fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> & FetchMoreOptions<TData, TVariables>) => Promise<ApolloQueryResult<TData>>) & (<TData2, TVariables2, K extends keyof TVariables2>(fetchMoreOptions: {
        query: DocumentNode;
    } & FetchMoreQueryOptions<TVariables2, K> & FetchMoreOptions<TData2, TVariables2>) => Promise<ApolloQueryResult<TData2>>);
};
export interface QueryResult<TData = any, TVariables = OperationVariables> extends ObservableQueryFields<TData, TVariables> {
    client: ApolloClient<any>;
    data: TData | undefined;
    error?: ApolloError;
    loading: boolean;
    networkStatus: NetworkStatus;
}
export interface QueryProps<TData = any, TVariables = OperationVariables> {
    children: (result: QueryResult<TData, TVariables>) => React.ReactNode;
    fetchPolicy?: FetchPolicy;
    errorPolicy?: ErrorPolicy;
    notifyOnNetworkStatusChange?: boolean;
    pollInterval?: number;
    query: DocumentNode;
    variables?: TVariables;
    ssr?: boolean;
    displayName?: string;
    skip?: boolean;
    client?: ApolloClient<Object>;
    context?: Record<string, any>;
    partialRefetch?: boolean;
    onCompleted?: (data: TData | {}) => void;
    onError?: (error: ApolloError) => void;
}
export interface QueryContext {
    client?: ApolloClient<Object>;
    operations?: Map<string, {
        query: DocumentNode;
        variables: any;
    }>;
}
export default class Query<TData = any, TVariables = OperationVariables> {
    static contextTypes: {
        client: PropTypes.Requireable<object>;
        operations: PropTypes.Requireable<object>;
    };
    static propTypes: {
        client: PropTypes.Requireable<object>;
        children: PropTypes.Validator<(...args: any[]) => any>;
        fetchPolicy: PropTypes.Requireable<string>;
        notifyOnNetworkStatusChange: PropTypes.Requireable<boolean>;
        onCompleted: PropTypes.Requireable<(...args: any[]) => any>;
        onError: PropTypes.Requireable<(...args: any[]) => any>;
        pollInterval: PropTypes.Requireable<number>;
        query: PropTypes.Validator<object>;
        variables: PropTypes.Requireable<object>;
        ssr: PropTypes.Requireable<boolean>;
        partialRefetch: PropTypes.Requireable<boolean>;
    };
    context: QueryContext | undefined;
    client: ApolloClient<Object>;
    private forceUpdate;
    private queryObservable?;
    private querySubscription?;
    private previousData;
    private refetcherQueue?;
    private hasMounted;
    private operation?;
    constructor(props: QueryProps<TData, TVariables>, context: QueryContext, forceUpdate?: any);
    componentDidMount(props: QueryProps<TData, TVariables>): void;
    onClientUpdated(nextProps: QueryProps<TData, TVariables>, nextClient: ApolloClient<any>): void;
    componentWillUnmount(): void;
    componentDidUpdate(props: QueryProps<TData, TVariables>): void;
    private extractOptsFromProps;
    private initializeQueryObservable;
    private setOperations;
    updateQuery(props: QueryProps<TData, TVariables>): void;
    startQuerySubscription(props: QueryProps<TData, TVariables>): void;
    removeQuerySubscription: () => void;
    private resubscribeToQuery;
    private updateCurrentData;
    getQueryResult: (props: QueryProps<TData, TVariables>) => QueryResult<TData, TVariables>;
}
