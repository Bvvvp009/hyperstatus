"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMessage = exports.startPolling = exports.checkPendingMessages = exports.queryGraphQL = void 0;
const axios_1 = __importDefault(require("axios"));
const url = "https://explorer4.hasura.app/v1/graphql";
const headers = {
    "accept": "application/graphql+json, application/json",
    "content-type": "application/json",
    "Referrer-Policy": "strict-origin-when-cross-origin"
};
const buildQueryBody = (variables) => {
    return JSON.stringify({
        query: `
      query ($search: bytea, $originChains: [bigint!], $destinationChains: [bigint!], $startTime: timestamp, $endTime: timestamp) @cached(ttl: 5) {
        q0: message_view(
          where: {_and: [{msg_id: {_eq: $search}}]}
          order_by: {id: desc}
          limit: 50
        ) {
          id
          msg_id
          nonce
          sender
          recipient
          is_delivered
          send_occurred_at
          delivery_occurred_at
          delivery_latency
          origin_chain_id
          origin_domain_id
          origin_tx_id
          origin_tx_hash
          origin_tx_sender
          destination_chain_id
          destination_domain_id
          destination_tx_id
          destination_tx_hash
          destination_tx_sender
          __typename
        }
        q1: message_view(
          where: {_and: [{origin_tx_hash: {_eq: $search}}]}
          order_by: {id: desc}
          limit: 50
        ) {
          id
          msg_id
          nonce
          sender
          recipient
          is_delivered
          send_occurred_at
          delivery_occurred_at
          delivery_latency
          origin_chain_id
          origin_domain_id
          origin_tx_id
          origin_tx_hash
          origin_tx_sender
          destination_chain_id
          destination_domain_id
          destination_tx_id
          destination_tx_hash
          destination_tx_sender
          __typename
        }
        q2: message_view(
          where: {_and: [{destination_tx_hash: {_eq: $search}}]}
          order_by: {id: desc}
          limit: 50
        ) {
          id
          msg_id
          nonce
          sender
          recipient
          is_delivered
          send_occurred_at
          delivery_occurred_at
          delivery_latency
          origin_chain_id
          origin_domain_id
          origin_tx_id
          origin_tx_hash
          origin_tx_sender
          destination_chain_id
          destination_domain_id
          destination_tx_id
          destination_tx_hash
          destination_tx_sender
          __typename
        }
      }
    `,
        variables
    });
};
const fetchGraphQLData = (variables) => __awaiter(void 0, void 0, void 0, function* () {
    const body = buildQueryBody(variables);
    const response = yield axios_1.default.post(url, body, { headers });
    return response.data;
});
const cleanSearchParam = (search) => {
    if (search.startsWith('0x')) {
        return '\\x' + search.slice(2);
    }
    return search;
};
const chainNames = {
    888888888: 'Ancient8',
    42161: 'Arbitrum',
    43114: 'Avalanche',
    8453: 'Base',
    81457: 'Blast',
    60808: 'BOB',
    56: 'Binance Smart Chain',
    42220: 'Celo',
    1: 'Ethereum',
    252: 'Fraxtal',
    100: 'Gnosis',
    2525: 'Injective EVM',
    6909546: 'Injective',
    59144: 'Linea',
    169: 'Manta Pacific',
    5000: 'Mantle',
    1284: 'Moonbeam',
    34443: 'Mode',
    1853125230: 'Neutron',
    10: 'Optimism',
    137: 'Polygon',
    1101: 'Polygon zkEVM',
    690: 'Redstone',
    534352: 'Scroll',
    1329: 'Sei',
    167000: 'Taiko',
    88: 'Viction',
    7000: 'ZetaChain',
    44787: "Alfajores",
    97: "BSC Testnet",
    43113: "fuji",
    161221135: "Plume Testnet",
    11155111: "Sepolia",
    534351: "Scroll Sepolia"
};
const nonEVMChains = [1853125230, 6909546];
const processMessage = (message) => {
    const chainName = chainNames[message.destination_domain_id] || 'Unknown Chain';
    const fromChainId = chainNames[message.origin_chain_id] || 'Unknown Chain';
    const status = message.is_delivered ? 'Delivered' : 'Pending';
    return {
        id: message.msg_id,
        status,
        from: fromChainId,
        to: chainName,
        isNonEVM: nonEVMChains.includes(message.destination_domain_id),
        details: message
    };
};
const queryGraphQL = (params) => __awaiter(void 0, void 0, void 0, function* () {
    params.search = cleanSearchParam(params.search);
    const data = yield fetchGraphQLData(params);
    if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
    }
    const { q0, q1, q2 } = data.data;
    const results = [...(q0 || []), ...(q1 || []), ...(q2 || [])];
    return results.map(processMessage);
});
exports.queryGraphQL = queryGraphQL;
const checkPendingMessages = (pendingMessageIds) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedMessages = [];
    for (const msgId of pendingMessageIds) {
        const result = yield queryGraphQL({ search: msgId });
        if (result && result.length > 0) {
            updatedMessages.push(result[0]);
        }
    }
    return updatedMessages;
});
exports.checkPendingMessages = checkPendingMessages;
// Add these new functions to handle localStorage
const STORAGE_KEY = 'pendingMessageIds';
const getPendingMessageIds = () => {
    const storedIds = localStorage.getItem(STORAGE_KEY);
    return storedIds ? JSON.parse(storedIds) : [];
};
const setPendingMessageIds = (ids) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};
const addPendingMessageId = (id) => {
    const ids = getPendingMessageIds();
    if (!ids.includes(id)) {
        ids.push(id);
        setPendingMessageIds(ids);
    }
};
const removePendingMessageId = (id) => {
    const ids = getPendingMessageIds();
    const updatedIds = ids.filter(messageId => messageId !== id);
    setPendingMessageIds(updatedIds);
};
// Modify the startPolling function
const startPolling = (interval = 60000, callback) => {
    const poll = () => __awaiter(void 0, void 0, void 0, function* () {
        const pendingMessageIds = getPendingMessageIds();
        const updatedMessages = yield checkPendingMessages(pendingMessageIds);
        const remainingPendingIds = [];
        updatedMessages.forEach(msg => {
            if (msg.status === 'Delivered' || msg.isNonEVM) {
                removePendingMessageId(msg.id);
            }
            else if (msg.status === 'Pending' && !msg.isNonEVM) {
                remainingPendingIds.push(msg.id);
            }
        });
        // Call the callback with updated messages
        if (callback && typeof callback === 'function') {
            callback(updatedMessages);
        }
        // If there are still pending messages, continue polling
        if (remainingPendingIds.length > 0) {
            setTimeout(() => poll(), interval);
        }
    });
    // Start the polling process
    poll();
};
exports.startPolling = startPolling;
// New function to initiate checking for a message
const checkMessage = (messageId) => {
    addPendingMessageId(messageId);
    startPolling();
};
exports.checkMessage = checkMessage;
//# sourceMappingURL=index.js.map