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
exports.queryGraphQL = void 0;
const axios_1 = __importDefault(require("axios"));
const url = "https://explorer4.hasura.app/v1/graphql";
const headers = {
    "accept": "application/graphql+json, application/json",
    "content-type": "application/json",
    "Referer": "https://explorer.hyperlane.xyz/",
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
const queryGraphQL = (params) => __awaiter(void 0, void 0, void 0, function* () {
    params.search = cleanSearchParam(params.search);
    const data = yield fetchGraphQLData(params);
    if (data.errors) {
        throw new Error(data.errors);
    }
    const { q0, q1, q2 } = data.data;
    // Return the first non-empty result, or null if all are empty
    if (q0 && q0.length > 0)
        return q0;
    if (q1 && q1.length > 0)
        return q1;
    if (q2 && q2.length > 0)
        return q2;
    return null;
});
exports.queryGraphQL = queryGraphQL;
