import { TONAPI_ENDPOINT, TONAPI_KEY } from '~/config.js';
import { canonizeAddress } from '~/tonweb.js';
import { hexToBase64 } from '~/utils.js';
import translations from '../../json/traceLabels.json';
import axios from 'axios';

const http = axios.create({
    baseURL: TONAPI_ENDPOINT,
    headers: {
        Authorization: `Bearer ${TONAPI_KEY}`,
    },
});

/**
 * @param  {String} address
 * @return {Promise<Array>}
 */
export const getJettonBalances = async function getUserJettons(address) {
    const { data: { balances } } = await http.get(`accounts/${address}/jettons`);

    /* eslint camelcase: "off" */
    return balances.map(({ balance, wallet_address, jetton }) => Object.freeze({
        address: canonizeAddress(wallet_address.address),
        jetton_address: canonizeAddress(jetton.address),
        balance,
        jetton_meta: Object.freeze({
            name: jetton?.name,
            symbol: jetton?.symbol,
            description: null,
            image_data: null,
            decimals: jetton?.decimals,
            image: Object.freeze({
                w72: jetton?.image,
                w144: jetton?.image,
                w216: jetton?.image,
            }),
        }),
    }));
};
/**
 * @param  {Object} eventAction
 * @param  {String} msgAccount
 * @return {Object}
 */
const generateMessage = function convertTonapiActionToTonscanMessage(eventAction, msgAccount) {
    const eventName = eventAction.type;
    const eventObj = eventAction[eventName] ?? {};

    // convert CamelCase to snake_case:
    let eventNameFormatted = eventName.match(/[A-Z][a-z]+|[0-9]+/g).join('_').toLowerCase();

    // Exception:
    if (eventNameFormatted === 'un_subscribe') {
        eventNameFormatted = 'unsubscribe';
    }

    // Most of the values are set by default
    // Then, in the switch/case we may change them
    const messages = {
        from: undefined,
        to: undefined,
        action: undefined,
        event: undefined,
        meta: undefined,
        source_alias: undefined,
        destination_alias: undefined,
        message: eventObj?.comment || null,
        is_external: eventName === 'Unknown',
        is_success: eventAction.status === 'ok',
        is_swapped: eventName === 'JettonSwap',
        is_aggregated: false,
        is_bounced: false,
        is_service: false,
        op: null,
    };

    // Don't show message if it starts from 'call:'
    if (messages.message?.startsWith('Call: ')) {
        messages.message = '';
    }

    // eslint-disable-next-line one-var, one-var-declaration-per-line
    let from, to, action, meta, is_wallet_from, is_wallet_to;

    let event = eventNameFormatted;
    let sourceAlias = eventObj.sender?.name;
    let destinationAlias = eventObj.recipient?.name;
    let tonAmount = (eventObj?.amount ?? 0).toString();
    const isOut = msgAccount === eventObj.sender?.address;

    switch (eventName) {
        case 'TonTransfer': {
            from = eventObj.sender.address;
            to = eventObj.recipient.address;
            is_wallet_from = eventObj.sender.is_wallet;
            is_wallet_to = eventObj.recipient.is_wallet;
            event = msgAccount === from
                ? 'sent_ton'
                : 'received_ton';
            break;
        }

        case 'JettonSwap': {
            messages.amount_in = eventObj.amount_in;
            messages.amount_out = eventObj.amount_out;
            messages.dex = eventObj.dex;
            action = Object.freeze({
                type: 'jetton:swap',
            });
            meta = Object.freeze({
                jetton_in_address: canonizeAddress(eventObj.jetton_master_in?.address || 'Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn'),
                amount_in: String(eventObj.amount_in || eventObj.ton_in),
                symbol_in: eventObj.jetton_master_in?.symbol || 'TON',
                decimals_in: eventObj.jetton_master_in?.decimals ?? 9,
                jetton_out_address: canonizeAddress(eventObj.jetton_master_out?.address || 'Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn'),
                amount_out: String(eventObj.amount_out || eventObj.ton_out),
                symbol_out: eventObj.jetton_master_out?.symbol || 'TON',
                decimals_out: eventObj.jetton_master_out?.decimals ?? 9,
            });
            from = eventObj.router.address;
            to = eventObj.user_wallet.address;
            is_wallet_from = eventObj.router.is_wallet;
            is_wallet_to = eventObj.user_wallet.is_wallet;
            destinationAlias = eventObj.user_wallet?.name;
            break;
        }

        case 'JettonTransfer': {
            from = eventObj.sender.address;
            to = eventObj.recipient?.address ?? eventObj.recipients_wallet ?? 'Unknown Recipient';
            is_wallet_from = eventObj.sender.is_wallet;
            is_wallet_to = eventObj.recipient?.is_wallet ?? false ?? false;
            action = Object.freeze({
                type: isOut ? 'jetton:transfer' : 'jetton:transfer_notification',
                amount: eventObj.amount,
                sender: canonizeAddress(from, { type: is_wallet_from ? 'wallet' : undefined }),
                destination: canonizeAddress(to, { type: is_wallet_to ? 'wallet' : undefined }),
            });
            meta = Object.freeze({
                jetton: eventObj.jetton,
                jetton_address: canonizeAddress(eventObj.jetton.address),
            });
            event = isOut
                ? 'sent_jetton'
                : 'received_jetton';
            break;
        }

        case 'Subscribe': {
            from = eventObj.subscriber.address;
            to = eventObj.beneficiary.address;
            is_wallet_from = eventObj.subscriber.is_wallet;
            is_wallet_to = eventObj.beneficiary.is_wallet;
            break;
        }

        case 'UnSubscribe': {
            from = eventObj.subscriber.address;
            to = eventObj.beneficiary.address;
            is_wallet_from = eventObj.subscriber.is_wallet;
            is_wallet_to = eventObj.beneficiary.is_wallet;
            break;
        }

        case 'NftItemTransfer': {
            action = Object.freeze({
                type: 'nft:transfer_tonapi',
                nft: canonizeAddress(eventObj.nft),
            });
            from = eventObj.sender?.address || eventObj.nft;
            to = eventObj.recipient.address;
            is_wallet_from = eventObj.sender?.is_wallet;
            is_wallet_to = eventObj.recipient.is_wallet;
            messages.source_type = 'wallet';
            messages.destination_type = 'wallet';
            if (from === eventObj.nft) {
                event = 'deploy_nft';
                break;
            }
            event = msgAccount === from
                ? 'sent_nft'
                : 'received_nft';
            break;
        }

        case 'NftPurchase': {
            action = Object.freeze({
                type: 'nft:transfer_tonapi',
                nft: eventObj.nft.address.length === 66 ? canonizeAddress(eventObj.nft.address) : null,
            });
            messages.source_type = 'wallet';
            messages.destination_type = 'wallet';
            messages.token = eventObj.amount.token_name;
            from = eventObj.buyer.address;
            to = eventObj.seller.address;
            is_wallet_from = eventObj.buyer.is_wallet;
            is_wallet_to = eventObj.seller.is_wallet;
            sourceAlias = eventObj.buyer?.name;
            destinationAlias = eventObj.seller?.name;
            break;
        }

        case 'SmartContractExec': {
            tonAmount = String(eventObj.ton_attached);
            from = eventObj.executor.address;
            to = eventObj.contract.address;
            is_wallet_from = eventObj.executor.is_wallet;
            is_wallet_to = eventObj.contract.is_wallet;
            sourceAlias = eventObj.executor?.name;
            destinationAlias = eventObj.contract?.name;
            break;
        }

        case 'ContractDeploy': {
            return undefined; // Don't show this type of events
        }

        case 'WithdrawStake': {
            from = eventObj.pool.address;
            to = eventObj.staker.address;
            is_wallet_from = eventObj.pool.is_wallet;
            is_wallet_to = eventObj.staker.is_wallet;
            sourceAlias = eventObj.pool?.name;
            destinationAlias = eventObj.staker?.name;
            break;
        }

        case 'DepositStake': {
            from = eventObj.staker.address;
            to = eventObj.pool.address;
            is_wallet_from = eventObj.staker.is_wallet;
            is_wallet_to = eventObj.pool.is_wallet;
            sourceAlias = eventObj.staker?.name;
            destinationAlias = eventObj.pool?.name;
            break;
        }

        case 'JettonMint': {
            from = eventObj.jetton.address;
            to = eventObj.recipient.address;
            is_wallet_to = eventObj.recipient.is_wallet;
            meta = Object.freeze({
                symbol: eventObj.jetton.symbol,
                decimals: eventObj.jetton.decimals,
                jetton_address: canonizeAddress(eventObj.jetton.address),
            });
            break;
        }

        case 'JettonBurn': {
            from = eventObj.sender.address;
            to = eventObj.jetton.address;
            is_wallet_from = eventObj.sender.is_wallet;
            meta = Object.freeze({
                symbol: eventObj.jetton.symbol,
                jetton: eventObj.jetton,
                jetton_address: canonizeAddress(eventObj.jetton.address),
                decimals: eventObj.jetton.decimals,
            });
            action = Object.freeze({
                type: 'jetton:burn',
                amount: eventObj.amount.toString(),
            });
            break;
        }

        case 'ElectionsDepositStake': {
            from = eventObj.staker.address;
            is_wallet_from = eventObj.staker.is_wallet;
            to = 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF';
            break;
        }

        case 'ElectionsRecoverStake': {
            from = 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF';
            to = eventObj.staker.address;
            is_wallet_to = eventObj.staker.is_wallet;
            break;
        }

        case 'WithdrawStakeRequest': {
            from = eventObj.staker.address;
            to = eventObj.pool.address;
            is_wallet_from = eventObj.staker.is_wallet;
            is_wallet_to = eventObj.pool.is_wallet;
            sourceAlias = eventObj.staker?.name;
            destinationAlias = eventObj.pool?.name;
            break;
        }

        case 'AuctionBid': {
            meta = Object.freeze({
                symbol: eventObj.amount.token_name,
            });
            from = eventObj.bidder.address;
            to = eventObj.auction.address;
            is_wallet_from = eventObj.bidder.is_wallet;
            is_wallet_to = eventObj.auction.is_wallet;
            sourceAlias = eventObj.bidder?.name;
            tonAmount = eventObj.amount.value;
            break;
        }

        case 'DomainRenew': {
            from = eventObj.renewer.address;
            to = eventObj.contract_address;
            is_wallet_from = eventObj.renewer.is_wallet;
            sourceAlias = eventObj.renewer?.name;
            destinationAlias = eventObj.domain;
            break;
        }

        case 'Unknown': {
            to = msgAccount;
            from = msgAccount;
            break;
        }

        default:
            // For test only:
            // In the case if we have an event that was not found previously - we can print it in alert

            // window.alert('Found an unknown event: ' + eventName);

            // Return undefined if there was an unknown event so we can delete it from messages
            return undefined;
    }

    messages.from = from ? canonizeAddress(from, { type: is_wallet_from ? 'wallet' : undefined }) : null;
    messages.to = canonizeAddress(to, { type: is_wallet_to ? 'wallet' : undefined });
    messages.amount = tonAmount;
    messages.meta = meta;
    messages.action = action;
    messages.source_alias = sourceAlias?.endsWith('.ton') ? sourceAlias : undefined; // Show only domains
    messages.destination_alias = destinationAlias?.endsWith('.ton') ? destinationAlias : undefined; // Show only domains
    messages.event = event;

    return messages;
};

/**
 * @param  {String} address
 * @return {Promise<Array>}
 */
export const getAccountEvents = async function getEventsByAccount(address, params) {
    const { data: response } = await http.get(`accounts/${address}/events`, {
        params,
    });

    const events = response.events.map(event => Object.freeze({
        address: canonizeAddress(event.account.address),
        fee: null,
        hash: hexToBase64(event.event_id),
        lt: String(event.lt),
        timestamp: event.timestamp * 1000,
        messages: event.actions.map(action => generateMessage(action, event.account.address)),
        action: 'ok',
    }));

    const result = events.map((ev) => {
        const undefinedIndex = ev.messages.indexOf(undefined);
        if (undefinedIndex > -1) {
            ev.messages.splice(undefinedIndex, 1);
        }
        return ev;
    });

    return result;
};

export const getJettonHoldersTonapi = async function getJettonHoldersByAddress(address, params) {
    const { data: response } = await http.get(`jettons/${address}/holders`, {
        params,
    });

    return response?.addresses;
};

// export const getTransactionTrace = async function getEventsByAccount(address) {
//     const response = await http.get(`traces/${address}`);
//     let currentId = 1;
//     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let nameIndex = 0;
//     const connections = [];

//     function generateName() {
//         if (nameIndex < alphabet.length) {
//             // eslint-disable-next-line no-plusplus
//             return alphabet[nameIndex++];
//         }
//         return '';
//     }

//     function translateLabel(key) {
//         return translations[key] || key;
//     }

//     function processNode(node, parentName = null) {
//         const name = generateName();
//         // eslint-disable-next-line no-plusplus
//         const id = currentId++;
//         const children = node.children ? node.children.map(child => processNode(child, name)) : [];

//         if (parentName) {
//             connections.push({
//                 source: parentName,
//                 target: name,
//                 label: node.transaction.in_msg.decoded_op_name,
//                 value: node.transaction.in_msg.value,
//             });
//         }

//         return Object.freeze({
//             id,
//             name,
//             transaction: node.transaction,
//             interfaces: node.interfaces.join(', '),
//             address: canonizeAddress(node.transaction.account.address, { type: node.transaction.account.is_wallet_to ? 'wallet' : undefined }),
//             label: translateLabel(node.transaction.in_msg.decoded_op_name) || node.transaction.in_msg.op_code,
//             value: node.transaction.in_msg.value,
//             opCode: `${node.transaction.in_msg.op_code || ''}${node.transaction.in_msg.decoded_op_name ? ` ${translateLabel(node.transaction.in_msg.decoded_op_name)}` : ''}`,
//             children,
//         });
//     }

//     const trace = processNode(response.data);

//     return { trace, connections };
// };

export const getTransactionTrace = async function getEventsByAccount(address) {
    const response = await http.get(`traces/${address}`);
    let currentId = 1;
    const connections = [];

    function translateLabel(key) {
        return translations[key] || key;
    }

    function processNode(node, parentName = null) {
        const canonize = canonizeAddress(node.transaction.account.address, { type: node.transaction.account.is_wallet ? 'wallet' : undefined });
        // const name = canonize.slice(-4);
        const name = `${canonize.slice(0, 2)}...${canonize.slice(-4)}`;
        // const id = currentId++;
        const id = currentId;
        currentId += 1;
        const children = node.children ? node.children.map(child => processNode(child, name)) : [];

        if (parentName) {
            connections.push({
                source: parentName,
                target: name,
                label: node.transaction.in_msg.decoded_op_name,
                value: node.transaction.in_msg.value,
            });
        }

        return Object.freeze({
            id,
            name,
            transaction: node.transaction,
            interfaces: node.interfaces.join(', '),
            address: canonizeAddress(node.transaction.account.address, { type: node.transaction.account.is_wallet ? 'wallet' : undefined }),
            label: translateLabel(node.transaction.in_msg.decoded_op_name) || node.transaction.in_msg.op_code,
            value: node.transaction.in_msg.value,
            opCode: `${node.transaction.in_msg.op_code || ''}${node.transaction.in_msg.decoded_op_name ? ` ${translateLabel(node.transaction.in_msg.decoded_op_name)}` : ''}`,
            children,
        });
    }

    const trace = processNode(response.data);

    return { trace, connections };
};
