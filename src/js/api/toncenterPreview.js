import axios from 'axios';
import { canonizeAddress } from '~/tonweb.js';
import { TONCENTER_PREVIEW_API_ENDPOINT, TONCENTER_API_KEY } from '~/config.js';
import { hexToBase64 } from '~/utils.js';
import opCodesDictionary from '../../json/traceLabels.json';

/* eslint camelcase: "off", func-names: "off" */
const httpHeaders = TONCENTER_API_KEY
    ? { 'X-API-Key': TONCENTER_API_KEY }
    : undefined;

const http = axios.create({
    baseURL: TONCENTER_PREVIEW_API_ENDPOINT,
    headers: httpHeaders,
});

export const getTransactionTraceV3 = async function getEventsByAccount(address, msge) {
    const queryParam = msge ? `msg_hash=${address}` : `tx_hash=${address}`;
    const response = await http.get(`events?${queryParam}`);

    const { trace: rootTrace, transactions } = response.data.events[0];
    const addressBook = response.data.address_book;

    function getUserFriendlyAddress(addr) {
        return addressBook[addr]?.user_friendly || addr;
    }

    let currentId = 1;
    const connections = [];

    function findTransactionByHash(tx_hash) {
        return transactions[tx_hash];
    }

    function processTransactionFields(transaction) {
        return {
            ...transaction,
            account: getUserFriendlyAddress(transaction?.account),
            in_msg: {
                ...transaction.in_msg,
                source: transaction.in_msg?.source ? getUserFriendlyAddress(transaction.in_msg.source) : null,
                destination: transaction.in_msg?.destination ? getUserFriendlyAddress(transaction.in_msg.destination) : null,
            },
            out_msgs: transaction.out_msgs?.map(msg => ({
                ...msg,
                source: msg.source ? getUserFriendlyAddress(msg.source) : null,
                destination: msg.destination ? getUserFriendlyAddress(msg.destination) : null,
            })) || [],
        };
    }

    function countAllDescendants(node) {
        if (!node.children || node.children.length === 0) {
            return 0;
        }
        return node.children.reduce((sum, child) => sum + countAllDescendants(child) + 1, 0);
    }

    function sortChildrenCentered(children) {
        if (children.length <= 1) return children;

        const sorted = [...children].sort((a, b) => a.childrenCount - b.childrenCount);

        const middleIndex = Math.floor((sorted.length - 1) / 2);
        const middleElement = sorted.shift();
        const finalSorted = [...sorted.slice(0, middleIndex), middleElement, ...sorted.slice(middleIndex)];

        return finalSorted;
    }

    function getLabelForOpCode(opCode) {
        if (opCode === null) {
            return 'Transfer';
        }

        return opCodesDictionary[opCode] || opCode;
    }

    function processNode(node, parentName = null) {
        let transaction = findTransactionByHash(node.tx_hash);
        transaction = processTransactionFields(transaction);

        const canonize = getUserFriendlyAddress(transaction.account);
        const name = `${canonize.slice(0, 2)}...${canonize.slice(-4)}`;
        const id = currentId;
        currentId += 1;
        const children = node.children ? Object.values(node.children).map(child => processNode(child, name)) : [];

        if (parentName) {
            connections.push({
                source: parentName,
                target: name,
                label: 'Oops',
                value: transaction.in_msg.value,
            });
        }

        const childrenWithCount = children.map(child => ({
            ...child,
            childrenCount: countAllDescendants(child),
        }));

        const sortedChildren = sortChildrenCentered(childrenWithCount);

        return {
            id,
            name,
            transaction,
            interfaces: 'jetton',
            address: getUserFriendlyAddress(transaction.account),
            label: getLabelForOpCode(transaction.in_msg.opcode),
            value: transaction.in_msg.value,
            opCode: transaction.in_msg.opcode,
            children: sortedChildren,
        };
    }

    const trace = processNode(rootTrace);

    const series = {
        traceId: response.data.events[0].trace_id,
        timeStart: response.data.events[0].start_utime,
    };

    return { trace, connections, series };
};

export const getTopBalances = async function ({ limit, offset } = {}) {
    const { data } = await http.get('/topAccountsByBalance', {
        params: { limit, offset },
    });

    console.log(data);

    const transformedData = data.map(item => ({
        ...item,
        account: canonizeAddress(item.account),
    }));

    return transformedData;
};

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
