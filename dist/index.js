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
    "2741": "Abstract",
    "1000041455": "Aleph Zero EVM",
    "888888888": "Ancient8",
    "33139": "ApeChain",
    "466": "AppChain",
    "42161": "Arbitrum",
    "42170": "Arbitrum Nova",
    "4278608": "Arcadia",
    "11820": "Artela",
    "10242": "Arthera",
    "592": "Astar",
    "3776": "Astar zkEVM",
    "1313161554": "Aurora",
    "43114": "Avalanche",
    "8333": "B3",
    "8453": "Base",
    "80094": "Berachain",
    "200901": "Bitlayer",
    "81457": "Blast",
    "60808": "BOB",
    "288": "Boba Mainnet",
    "6001": "BounceBit",
    "56": "Binance Smart Chain",
    "223": "B² Network",
    "42220": "Celo",
    "383353": "CheeseChain",
    "1000088888": "Chiliz",
    "1030": "Conflux eSpace",
    "668668": "Conwai",
    "1116": "Core",
    "21000000": "Corn",
    "7560": "Cyber",
    "666666666": "Degen",
    "2000": "Dogechain",
    "5545": "DuckChain",
    "1408864445": "Eclipse",
    "648": "Endurance",
    "1": "Ethereum",
    "25327": "Everclear",
    "9001": "Evmos EVM",
    "250": "Fantom Opera",
    "253368190": "Flame",
    "14": "Flare",
    "1000000747": "EVM on Flow",
    "478": "Form",
    "252": "Fraxtal",
    "122": "Fuse",
    "1300": "Glue",
    "100": "Gnosis",
    "1625": "Gravity Alpha Mainnet",
    "260": "Guru Network",
    "1666600000": "Harmony One",
    "43111": "Hemi Network",
    "999": "HyperEVM",
    "1000013371": "Immutable zkEVM",
    "2525": "Injective EVM",
    "6909546": "Injective",
    "57073": "Ink",
    "8217": "Kaia",
    "255": "Kroma",
    "59144": "Linea",
    "1135": "Lisk",
    "42": "LUKSO",
    "1000073017": "Lumia Prism",
    "169": "Manta Pacific",
    "5000": "Mantle",
    "698": "Matchain",
    "4200": "Merlin",
    "1000001750": "Metal L2",
    "1088": "Metis Andromeda",
    "185": "Mint",
    "34443": "Mode",
    "360": "Molten",
    "1284": "Moonbeam",
    "2818": "Morph",
    "1689": "Nero",
    "1853125230": "Neutron",
    "970": "Oort",
    "10": "Optimism",
    "291": "Orderly L2",
    "137": "Polygon",
    "1101": "Polygon zkEVM",
    "1000008008": "Polynomial",
    "227": "Prom",
    "70700": "Proof of Play Apex",
    "1000012617": "RARI Chain",
    "111188": "re.al",
    "690": "Redstone",
    "753": "Rivalz",
    "2020": "Ronin",
    "1000000030": "Rootstock",
    "1996": "Sanko",
    "534352": "Scroll",
    "1329": "Sei",
    "109": "Shibarium",
    "2192": "SnaxChain",
    "1399811149": "Solana",
    "1868": "Soneium",
    "146": "Sonic",
    "507150715": "Sonic SVM",
    "50075007": "SOON",
    "50104": "Sophon",
    "1514": "Story Mainnet",
    "964": "Subtensor",
    "1000055244": "Superposition",
    "5330": "Superseed",
    "1923": "Swell",
    "167000": "Taiko",
    "5845": "Tangle",
    "40": "Telos EVM",
    "21000": "Torus",
    "61166": "Treasure",
    "4547": "TRUMPCHAIN",
    "130": "Unichain",
    "88811": "Unit Zero",
    "1480": "Vana",
    "88": "Viction",
    "480": "World Chain",
    "660279": "Xai",
    "196": "XLayer",
    "37": "XPLA",
    "543210": "Zero Network",
    "7000": "ZetaChain",
    "48900": "Zircuit",
    "810180": "zkLink Nova",
    "324": "zkSync",
    "7777777": "Zora",
    "11124": "Abstract Testnet",
    "2039": "Aleph Zero EVM Testnet",
    "44787": "Alfajores",
    "421614": "Arbitrum Sepolia",
    "1098411886": "Arcadia Testnet v2",
    "84532": "Base Sepolia",
    "80084": "Berachain bArtio",
    "97": "BSC Testnet",
    "325000": "Camp Network Testnet V2",
    "175188": "Chronicle Yellowstone",
    "5115": "Citrea Testnet",
    "471923": "Eco Testnet",
    "1660473773": "Flame Dawn-1 Testnet",
    "132902": "Form Testnet",
    "43113": "Fuji",
    "17000": "Holesky",
    "998": "Hyperliquid EVM Testnet",
    "763373": "Ink Sepolia",
    "10143": "Monad Testnet",
    "911867": "Odyssey Testnet",
    "11155420": "Optimism Sepolia",
    "161221135": "Plume Testnet",
    "80002": "Polygon Amoy",
    "534351": "Scroll Sepolia",
    "11155111": "Sepolia",
    "1399811150": "Solana Testnet",
    "1946": "Soneium Minato Testnet",
    "57054": "Sonic Blaze Testnet",
    "15153042": "Sonic SVM Testnet",
    "64165": "Sonic Testnet",
    "33626250": "SUAVE Toliman Testnet",
    "945": "Subtensor Testnet",
    "98985": "Superposition Testnet",
    "3799": "Tangle Testnet",
    "978658": "Treasure Topaz Testnet",
    "1301": "Unichain Testnet",
    "9496": "Weave VM Testnet"
};
const processMessage = (message) => {
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
            if (msg.status === 'Delivered') {
                removePendingMessageId(msg.id);
            }
            else if (msg.status === 'Pending') {
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