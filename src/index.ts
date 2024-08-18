import axios from 'axios';

const url = "https://explorer4.hasura.app/v1/graphql";
const headers = {
  "accept": "application/graphql+json, application/json",
  "content-type": "application/json",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const buildQueryBody = (variables: any) => {
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

const fetchGraphQLData = async (variables: any) => {
  const body = buildQueryBody(variables);
  const response = await axios.post(url, body, { headers });
  return response.data;
};

const cleanSearchParam = (search: string) => {
  if (search.startsWith('0x')) {
    return '\\x' + search.slice(2);
  }
  return search;
};

const chainNames: { [key: number]: string } = 
{
  "888888888": "Ancient8",
  "42161": "Arbitrum",
  "43114": "Avalanche",
  "8453": "Base",
  "81457": "Blast",
  "60808": "BOB",
  "56": "Binance Smart Chain",
  "42220": "Celo",
  "383353": "CheeseChain",
  "7560": "Cyber",
  "648": "Endurance",
  "1": "Ethereum",
  "252": "Fraxtal",
  "122": "Fuse",
  "100": "Gnosis",
  "2525": "Injective EVM",
  "6909546": "Injective",
  "255": "Kroma",
  "59144": "Linea",
  "1135": "Lisk",
  "42": "LUKSO",
  "169": "Manta Pacific",
  "5000": "Mantle",
  "4200": "Merlin",
  "1088": "Metis Andromeda",
  "185": "Mint",
  "1284": "Moonbeam",
  "1853125230": "Neutron",
  "10": "Optimism",
  "137": "Polygon",
  "1101": "Polygon zkEVM",
  "70700": "Proof of Play Apex",
  "111188": "re.al",
  "690": "Redstone",
  "1996": "Sanko",
  "534352": "Scroll",
  "1329": "Sei",
  "167000": "Taiko",
  "5845": "Tangle",
  "88": "Viction",
  "480": "World Chain",
  "660279": "Xai",
  "196": "XLayer",
  "7000": "ZetaChain",
  "48900": "Zircuit",
  "7777777": "Zora",
  "44787": "Alfajores",
  "421614": "Arbitrum Sepolia",
  "84532": "Base Sepolia",
  "97": "BSC Testnet",
  "10200": "Chiado",
  "6398": "Connext Sepolia",
  "471923": "Eco Testnet",
  "239092742": "Eclipse Testnet",
  "43113": "Fuji",
  "11155420": "Optimism Sepolia",
  "161221135": "Plume Testnet",
  "80002": "Polygon Amoy",
  "88002": "Proteus Testnet",
  "534351": "Scroll Sepolia",
  "11155111": "Sepolia",
  "1399811151": "Solana Devnet",
  "1399811150": "Solana Testnet",
  "98985": "Superposition Testnet"
}

const nonEVMChains = [1853125230, 6909546];

const processMessage = (message: any) => {
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

const queryGraphQL = async (params: any) => {
  params.search = cleanSearchParam(params.search);
  const data = await fetchGraphQLData(params);

  if (data.errors) {
    throw new Error(JSON.stringify(data.errors));
  }

  const { q0, q1, q2 } = data.data;
  const results = [...(q0 || []), ...(q1 || []), ...(q2 || [])];

  return results.map(processMessage);
};

const checkPendingMessages = async (pendingMessageIds: string[]) => {
  const updatedMessages = [];

  for (const msgId of pendingMessageIds) {
    const result = await queryGraphQL({ search: msgId });
    if (result && result.length > 0) {
      updatedMessages.push(result[0]);
    }
  }

  return updatedMessages;
};

// Add these new functions to handle localStorage
const STORAGE_KEY = 'pendingMessageIds';

const getPendingMessageIds = (): string[] => {
  const storedIds = localStorage.getItem(STORAGE_KEY);
  return storedIds ? JSON.parse(storedIds) : [];
};

const setPendingMessageIds = (ids: string[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const addPendingMessageId = (id: string): void => {
  const ids = getPendingMessageIds();
  if (!ids.includes(id)) {
    ids.push(id);
    setPendingMessageIds(ids);
  }
};

const removePendingMessageId = (id: string): void => {
  const ids = getPendingMessageIds();
  const updatedIds = ids.filter(messageId => messageId !== id);
  setPendingMessageIds(updatedIds);
};

// Modify the startPolling function
const startPolling = (interval: number = 60000, callback?: (messages: any[]) => void) => {
  const poll = async () => {
    const pendingMessageIds = getPendingMessageIds();
    const updatedMessages = await checkPendingMessages(pendingMessageIds);
    
    const remainingPendingIds: string[] = [];

    updatedMessages.forEach(msg => {
      if (msg.status === 'Delivered' || msg.isNonEVM) {
        removePendingMessageId(msg.id);
      } else if (msg.status === 'Pending' && !msg.isNonEVM) {
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
  };

  // Start the polling process
  poll();
};

// New function to initiate checking for a message
const checkMessage = (messageId: string) => {
  addPendingMessageId(messageId);
  startPolling();
};



export { queryGraphQL, checkPendingMessages, startPolling, checkMessage };