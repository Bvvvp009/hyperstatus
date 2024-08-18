declare const queryGraphQL: (params: any) => Promise<{
    id: any;
    status: string;
    from: string;
    to: string;
    isNonEVM: boolean;
    details: any;
}[]>;
declare const checkPendingMessages: (pendingMessageIds: string[]) => Promise<{
    id: any;
    status: string;
    from: string;
    to: string;
    isNonEVM: boolean;
    details: any;
}[]>;
declare const startPolling: (interval?: number, callback?: ((messages: any[]) => void) | undefined) => void;
declare const checkMessage: (messageId: string) => void;
export { queryGraphQL, checkPendingMessages, startPolling, checkMessage };
