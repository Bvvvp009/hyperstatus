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
  "745":"Stride",
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
  "471923": "Eco Testnet",
  "43113": "Fuji",
  "11155420": "Optimism Sepolia",
  "161221135": "Plume Testnet",
  "80002": "Polygon Amoy",
  "534351": "Scroll Sepolia",
  "11155111": "Sepolia",
  "98985": "Superposition Testnet",
  "41455": "Aleph Zero EVM",
  "33139": "ApeChain",
  "466": "AppChain",
  "42170": "Arbitrum Nova",
  "10242": "Arthera",
  "592": "Astar",
  "3776": "Astar zkEVM",
  "1313161554": "Aurora",
  "8333": "B3",
  "200901": "Bitlayer",
  "288": "Boba Mainnet",
  "223": "B² Network",
  "1000088888": "Chiliz",
  "1030": "Conflux eSpace",
  "668668": "Conwai",
  "1116": "Core",
  "21000000": "Corn",
  "666666666": "Degen",
  "2000": "Dogechain",
  "5545": "DuckChain",
  "1408864445": "Eclipse",
  "25327": "Everclear",
  "9001": "Evmos EVM",
  "250": "Fantom Opera",
  "253368190": "Flame",
  "14": "Flare",
  "1000000747": "EVM on Flow",
  "478": "Form",
  "1666600000": "Harmony One",
  "1000013371": "Immutable zkEVM",
  "57073": "Ink",
  "8217": "Kaia",
  "1000073017": "Lumia Prism",
  "1000001750": "Metal L2",
  "34443": "Mode",
  "360": "Molten",
  "2818": "Morph",
  "970": "Oort",
  "291": "Orderly L2",
  "1000008008": "Polynomial",
  "227": "Prom",
  "1000012617": "RARI Chain",
  "753": "Rivalz",
  "1000000030": "Rootstock",
  "109": "Shibarium",
  "2192": "SnaxChain",
  "1399811149": "Solana",
  "146": "Sonic",
  "1000055244": "Superposition",
  "5330": "Superseed",
  "1923": "Swell",
  "40": "Telos EVM",
  "61166": "Treasure",
  "130": "Unichain",
  "1480": "Vana",
  "543210": "Zero Network",
  "810180": "zkLink Nova",
  "324": "zkSync",
  "11124": "Abstract Testnet",
  "2039": "Aleph Zero EVM Testnet",
  "1098411886": "Arcadia Testnet v2",
  "80084": "Berachain bArtio",
  "325000": "Camp Network Testnet V2",
  "5115": "Citrea Testnet",
  "132902": "Form Testnet",
  "17000": "Holesky",
  "998": "Hyperliquid EVM Testnet",
  "763373": "Ink Sepolia",
  "911867": "Odyssey Testnet",
  "1946": "Soneium Minato Testnet",
  "64165": "Sonic Testnet",
  "33626250": "SUAVE Toliman Testnet",
  "3799": "Tangle Testnet",
  "978658": "Treasure Topaz Testnet",
  "1301": "Unichain Testnet"
}

const processMessage = (message: any) => {
  const chainName = chainNames[message.destination_domain_id] || 'Unknown Chain';
  const fromChainId = chainNames[message.origin_chain_id] || 'Unknown Chain';
  const status = message.is_delivered ? 'Delivered' : 'Pending';

  return {
    id: message.msg_id,
    status,
    from: fromChainId,
    to: chainName,
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
      if (msg.status === 'Delivered') {
        removePendingMessageId(msg.id);
      } else if (msg.status === 'Pending') {
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