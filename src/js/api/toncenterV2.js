import axios from 'axios';
import { TONCENTER_V2_API_ENDPOINT, TONCENTER_API_KEY } from '~/config.js';
import { hexToBase64 } from '~/utils.js';

/* eslint camelcase: "off", func-names: "off" */

// Disable headers if api key is not set. Otherwise
// axios will make a pre-flight request:
const httpHeaders = TONCENTER_API_KEY
    ? { 'X-API-Key': TONCENTER_API_KEY }
    : undefined;

const http = axios.create({
    baseURL: TONCENTER_V2_API_ENDPOINT,
    headers: httpHeaders,
});

/**
 * This function returns last blocks sorted by time.
 *
 * @param  {Numer} options.wc
 * @param  {Number} options.limit
 * @param  {Number} options.offset
 * @param  {Number} options.startUtime
 * @param  {Number} options.endUtime
 * @return {Promise<Array>}
 */
export const getPreviousBlocks = async function ({ wc, limit, offset, startUtime, endUtime, afterLt } = {}) {
    const { data: { blocks: result } } = await http.get('/blocks', {
        params: {
            offset, limit,
            after_lt: afterLt,
            workchain: wc,
            start_utime: startUtime,
            end_utime: endUtime,
            sort: 'desc',
        },
    });

    result.forEach((block) => {
        /* eslint no-param-reassign: "off" */
        block.root_hash_hex = block.root_hash;
        block.root_hash = hexToBase64(block.root_hash);
    });

    return result.map(Object.freeze);
};

export const getBlockHeader = async function ({ workchain, shard, seqno }) {
    const query = { workchain, shard, seqno, limit: 1 };

    const { data: { blocks } } = await http.get('/blocks', { params: query });

    return blocks[0];
};

const getSourceAndDestination = function (msg, address, hash, addressBook) {
    const from = msg.source ? addressBook[msg.source].user_friendly : null;
    const to = msg.destination ? addressBook[msg.destination].user_friendly : null;

    return {
        from, to,
        is_out: address === from,
        amount: msg.value || null,
        created_at: msg.created_at,
        hash,
    };
};

/**
 * @param  {Number} options.wc
 * @param  {Number} options.startUtime
 * @param  {Number} options.endUtime
 * @return {Promise<Array>}
 */
export const getAllTransactions = async function ({ wc, limit, startUtime, endUtime } = {}) {
    const { data } = await http.get('/transactions', {
        params: {
            limit,
            workchain: wc,
            start_utime: startUtime,
            end_utime: endUtime,
            sort: 'desc',
        },
    });

    const result = data.transactions;
    const addressBook = data.address_book;

    const transactions = result.map((tx) => {
        const address = tx.account;
        const hash = tx.hash;

        const is_service = !tx.in_msg && tx.out_msgs.length === 0;
        const is_external = tx.out_msgs.length === 0 && !tx.in_msg?.source && tx.in_msg?.destination === address;
        let msg = undefined;

        if (is_service) {
            msg = {
                source: address,
                destination: null,
                created_at: tx.created_at || tx.now,
            };
        } else if (tx.out_msgs.length > 0) {
            msg = tx.out_msgs.at(-1);
        } else {
            msg = tx.in_msg;
        }

        const sourceAndDestination = getSourceAndDestination(msg, address, hash, addressBook);

        sourceAndDestination.is_service = is_service;
        sourceAndDestination.is_external = is_external;
        sourceAndDestination.created_at = tx.now;

        return sourceAndDestination;
    });

    return transactions.sort((a, b) => b.created_at - a.created_at).map(Object.freeze);
};

/**
 * @see https://api.toncenter.com/index/#/default/get_top_accounts_by_balance_v1_topAccountsByBalance_get
 * @param  {Number} options.limit
 * @param  {Number} options.offset
 * @return {Promise<Array>}
 */
export const getTopBalances = async function ({ limit, offset } = {}) {
    const { data } = await http.get('/topAccountsByBalance', {
        params: { limit, offset },
    });

    return data;
};

/**
 * @param  {String} hash
 * @return {Promise<Object>}
 */
export const getTransactionByHash = async function (hash) {
    const { data } = await http.get('/transactions', { params: { hash } });

    return Object.freeze(data);
};

/**
 * @param  {String} hash
 * @return {Promise<Object>}
 */
export const getTransactionByInMsgHash = async function (hash) {
    const { data } = await http.get('/transactionsByMessage', {
        params: {
            msg_hash: hash,
            direction: 'in',
        },
    });

    return Object.freeze(data);
};

/**
 * @param  {String} hash
 * @return {Promise<Object>}
 */
export const getTransactionByHashOrInMessageHash = async function (hash) {
    const byHash = await getTransactionByHash(hash);

    if (byHash?.transactions?.length > 0) {
        return byHash;
    }

    /* eslint no-return-await: "off" */
    return await getTransactionByInMsgHash(hash);
};

/**
 * @param  {Number} options.workchain
 * @param  {Number} options.shard
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getBlockTransactions = async function ({ workchain, shard, seqno, offset, limit = 40 }) {
    const query = { workchain, shard, seqno, offset, limit, sort: 'asc' };

    const { data: result } = await http.get('/transactions', { params: query });

    // Convert address hex notation to base64:
    result.transactions.forEach((tx) => {
        tx.account = result.address_book[tx.account].user_friendly; /* eslint no-param-reassign: "off" */
    });

    return result;
};

/**
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getShards = async function ({ seqno }) {
    const { data: { blocks: result } } = await http.get('masterchainBlockShardState', { params: { seqno } });

    const shards = result.filter(block => block.workchain >= 0).reverse();

    return shards;
};

/**
 * @return {Promise<Object>}
 */
export const getLastBlock = async function () {
    const { data: result } = await http.get('masterchainInfo');

    return Object.freeze(result.last);
};

/**
 * This function extracts the data, that may be unique for every msg
 *
 * @param  {Object} msg
 * @return {Object}
 */
const parseMessageData = function extractMessageDetails(msg, addressBook) {
    const from = addressBook[msg.source]?.user_friendly || null;
    const to = addressBook[msg.destination]?.user_friendly || null;

    const message = msg?.message_content?.decoded?.type === 'text_comment' ? msg?.message_content?.decoded?.comment : undefined;

    return { from, to,
        message,
        amount: msg.value,
        op: msg.opcode ? `0x${(msg.opcode >>> 0).toString(16)}` : null, // eslint-disable-line no-bitwise
        is_bounced: msg.bounced === true,
    };
};

/**
 * @return {Promise<Object>}
 */
export const getTransactionsV3 = async function (address, { limit, offset }) {
    const { data: result } = await http.get('transactions', {
        params: {
            account: address,
            limit,
            offset,
        },
    });

    const addressBook = result?.address_book;
    const transactions = result?.transactions;

    const groups = [];

    transactions.forEach((tx) => {
        const is_service = !tx.in_msg && tx.out_msgs.length === 0;

        const is_external = tx.out_msgs.length === 0
            && !tx.in_msg?.source
            && addressBook[tx.in_msg?.destination] === address;

        const newWalletTxSuccess = tx.description?.action?.result_code === undefined && tx.description?.compute_ph?.exit_code === undefined;
        const executionSuccess = tx.description.action?.action_result_code !== null && parseInt(tx.description?.action?.result_code, 10) <= 1;

        const is_success = newWalletTxSuccess || executionSuccess;
        const exit_code = is_success
            ? tx.description?.action?.result_code
            : tx.description?.compute_ph?.exit_code;

        const txDetails = {
            address,
            hash: tx.hash,
            fee: tx.total_fees,
            lt: tx.lt,
            timestamp: parseInt(tx.now + '000', 10),
            output_count: tx.out_msgs.length,
            exit_code: exit_code || 0,
            messages: [],
        };

        const msgDetails = {
            is_service, is_external, is_success,
            is_aggregated: false,
        };

        // Don't display long message list (e.g. multisends), show aggregated info instead:
        if (tx.out_msgs.length > 10) {
            const aggregatedAmount = tx.out_msgs.reduce((total, outMsg) => parseInt(outMsg.value, 10) + total, 0);
            txDetails.messages.push({ ...msgDetails,
                amount: aggregatedAmount,
                is_aggregated: true,
                is_bounced: tx.out_msgs.some(msg => msg.bounced),
                from: address,
                to: 'multiple destinations', // must be truthy to indicate that we do have the destination
            });

        // Otherwise push out_msgs to the list in chronological (reverse) order:
        } else {
            tx.out_msgs.reverse().forEach((outMsg) => {
                txDetails.messages.push({ ...msgDetails, ...parseMessageData(outMsg, addressBook) });
            });
        }

        // Then push the input message:
        if (tx.in_msg?.source) {
            txDetails.messages.push({ ...msgDetails, ...parseMessageData(tx.in_msg, addressBook) });
        }

        // Special case when there're neither out_msgs, nor in_msg (like in system contract):
        if (is_service) {
            txDetails.messages.push({ ...msgDetails,
                from: address,
                to: null,
            });
        }

        // Special case for external messages (e. g. when activating wallet):
        if (is_external) {
            txDetails.messages.push({ ...msgDetails,
                from: null,
                to: address,
            });
        }

        for (let i = 0; i < txDetails.messages.length; i += 1) {
            Object.freeze(txDetails.messages[i]);
        }

        groups.push(Object.freeze(txDetails));
    });

    return groups;
};

export const getCodeHash = async function (address) {
    let code_hash = undefined;

    const query = {
        account: address,
        sort: 'asc',
    };

    const { data: result } = await http.get('/transactions', { params: query });

    result?.transactions?.forEach((tx) => {
        if (tx?.account_state_after?.code_hash && !code_hash) {
            code_hash = tx.account_state_after.code_hash;
        }
    });

    return code_hash;
};
