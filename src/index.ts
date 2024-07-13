import axios, { AxiosResponse } from 'axios';

interface QueryVariables {
  search: string;
  originChains?: bigint[];
  destinationChains?: bigint[];
  startTime?: string;
  endTime?: string;
}

interface GraphQLResponse {
  data: {
    q0?: any;
    q1?: any;
    q2?: any;
  };
  errors?: any;
}

const url = "https://explorer4.hasura.app/v1/graphql";
const headers = {
  "accept": "application/graphql+json, application/json",
  "content-type": "application/json",
  "Referer": "https://explorer.hyperlane.xyz/",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const buildQueryBody = (variables: QueryVariables) => {
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

const fetchGraphQLData = async (variables: QueryVariables): Promise<GraphQLResponse> => {
  const body = buildQueryBody(variables);
  const response: AxiosResponse<GraphQLResponse> = await axios.post(url, body, { headers });
  return response.data;
};

const cleanSearchParam = (search: string): string => {
  if (search.startsWith('0x')) {
    return '\\x' + search.slice(2);
  }
  return search;
};



export const queryGraphQL = async (params: QueryVariables): Promise<any> => {
  params.search = cleanSearchParam(params.search);
  const data = await fetchGraphQLData(params);

  if (data.errors) {
    throw new Error(data.errors);
  }

  const { q0, q1, q2 } = data.data;

  // Return the first non-empty result, or null if all are empty
  if (q0 && q0.length > 0) return q0;
  if (q1 && q1.length > 0) return q1;
  if (q2 && q2.length > 0) return q2;

  return null;
};
