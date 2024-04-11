import axios from "axios";

const API = 'https://moss-bff-api.zeabur.app/starknet';
//'http://localhost:4000/starknet';

export async function queryTokenBalance(address: string) {
    try {
        // 检查输入地址的有效性
        if (!address || typeof address !== 'string') {
            throw new Error('请输入有效的以太坊地址');
        }

        // 构建GraphQL查询
        const query = `query TokenBalancesByOwnerAddressQuery($input: TokenBalancesByOwnerAddressInput!) {      tokenBalancesByOwnerAddress(input: $input) {
        id
        token_contract_address
        contract_token_identifier
        contract_token_contract {
          symbol
          is_social_verified
          icon_url
          id
        }
        balance_display
      }
    }`;

        // 构建请求体
        const body = {
            query: query,
            variables: {
                input: {
                    owner_address: address
                }
            }
        };

        // 发起请求
        const response = await fetch(API, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'pragma': 'no-cache'
            },
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'omit'
        });

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (e) {
        console.error(e);
    }
}

export async function queryContractInfo(contractAddress: string) {
    try {
        // 检查合约地址是否有效
        if (!contractAddress || typeof contractAddress !== 'string') {
            throw new Error('请输入有效的合约地址');
        }

        // 发送请求
        // const response = await axios.post(API, {
        //     query: query,
        //     variables: variables
        // });
        const body = {
            "query": "query ContractPageQuery(\n  $input: ContractInput!\n) {\n  contract(input: $input) {\n    contract_address\n    is_starknet_class_code_verified\n    implementation_type\n    ...ContractPageContainerFragment_contract\n    ...ContractPageOverviewTabFragment_contract\n    ...ContractPageClassCodeHistoryTabFragment_contract\n    ...ContractFunctionReadWriteTabFragment_contract\n    id\n  }\n}\n\nfragment ContractFunctionReadCallsFragment_starknetClass on StarknetClass {\n  is_code_verified\n  abi_final\n}\n\nfragment ContractFunctionReadWriteTabFragment_contract on Contract {\n  contract_address\n  starknet_class {\n    ...ContractFunctionReadCallsFragment_starknetClass\n    ...ContractFunctionWriteCallsFragment_starknetClass\n    id\n  }\n}\n\nfragment ContractFunctionWriteCallsFragment_starknetClass on StarknetClass {\n  is_code_verified\n  abi_final\n}\n\nfragment ContractPageClassCodeHistoryTabFragment_contract on Contract {\n  contract_address\n  starknet_class {\n    is_code_verified\n    id\n  }\n  ...ContractPageCodeSubTabFragment_contract\n}\n\nfragment ContractPageCodeSubTabFragment_contract on Contract {\n  starknet_class {\n    class_hash\n    ...StarknetClassCodeTabFragment_starknetClass\n    id\n  }\n}\n\nfragment ContractPageContainerFragment_contract on Contract {\n  contract_address\n  implementation_type\n  is_starknet_class_code_verified\n  contract_stats {\n    number_of_transactions\n    number_of_account_calls\n    number_of_events\n  }\n  starknet_id {\n    domain\n  }\n}\n\nfragment ContractPageOverviewTabClassHashPlacedAtItemFragment_contract on Contract {\n  deployed_at_transaction_hash\n  class_hash_placed_at_transaction_hash\n  class_hash_placed_at_timestamp\n}\n\nfragment ContractPageOverviewTabEthBalanceItemFragment_contract on Contract {\n  eth_balance {\n    balance_display\n    id\n  }\n}\n\nfragment ContractPageOverviewTabFragment_contract on Contract {\n  contract_address\n  class_hash\n  name_tag\n  is_social_verified\n  deployed_by_contract_address\n  deployed_by_contract_identifier\n  deployed_at_transaction_hash\n  deployed_at_timestamp\n  ...ContractPageOverviewTabEthBalanceItemFragment_contract\n  ...ContractPageOverviewTabTypeItemFragment_contract\n  ...ContractPageOverviewTabStarknetIDItemFragment_contract\n  starknet_class {\n    ...StarknetClassVersionItemFragment_starknetClass\n    id\n  }\n  ...ContractPageOverviewTabClassHashPlacedAtItemFragment_contract\n}\n\nfragment ContractPageOverviewTabStarknetIDItemFragment_contract on Contract {\n  starknet_id {\n    domain\n  }\n}\n\nfragment ContractPageOverviewTabTypeItemFragment_contract on Contract {\n  implementation_type\n  starknet_class {\n    type\n    id\n  }\n}\n\nfragment StarknetClassCodeTabFragment_starknetClass on StarknetClass {\n  ...StarknetClassCodeTabVerifiedItemFragment_starknetClass\n  ...StarknetClassCodeTabSourceCodeItemFragment_starknetClass\n  ...StarknetClassCodeTabOnChainCodeItemFragment_starknetClass\n}\n\nfragment StarknetClassCodeTabOnChainCodeItemFragment_starknetClass on StarknetClass {\n  is_code_verified\n  abi_final\n  bytecode\n  sierra_program\n  entry_points_by_type\n}\n\nfragment StarknetClassCodeTabSourceCodeItemFragment_starknetClass on StarknetClass {\n  class_hash\n  verified {\n    source_code\n  }\n}\n\nfragment StarknetClassCodeTabVerifiedItemFragment_starknetClass on StarknetClass {\n  is_code_verified\n  verified {\n    name\n    source_code\n    verified_at_timestamp\n  }\n}\n\nfragment StarknetClassVersionItemFragment_starknetClass on StarknetClass {\n  cairo_version\n}\n",
            "variables": {
                "input": {
                    "contract_address": contractAddress
                }
            }
        }
        const response = await fetch(API, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'pragma': 'no-cache'
            },
            body: JSON.stringify(body),
            mode: 'cors',
            credentials: 'omit'
        });

        const data = await response.json();
        console.log(data);
        return data;
        // 返回响应数据
        // return response.data;
    } catch (error) {
        // 打印并抛出错误
        console.error("Error querying contract info:", error);
        throw error;
    }
}

export async function getTransactions(address: string){
    try {
        const body = {
            "query": "query TransactionsTableQuery(\n  $first: Int!\n  $after: String\n  $input: TransactionsInput!\n) {\n  ...TransactionsTablePaginationFragment_transactions_2DAjA4\n}\n\nfragment TransactionsTableExpandedItemFragment_transaction on Transaction {\n  entry_point_selector_name\n  calldata_decoded\n  entry_point_selector\n  calldata\n  initiator_address\n  initiator_identifier\n  main_calls {\n    selector\n    selector_name\n    calldata_decoded\n    selector_identifier\n    calldata\n    contract_address\n    contract_identifier\n    id\n  }\n}\n\nfragment TransactionsTablePaginationFragment_transactions_2DAjA4 on Query {\n  transactions(first: $first, after: $after, input: $input) {\n    edges {\n      node {\n        id\n        ...TransactionsTableRowFragment_transaction\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment TransactionsTableRowFragment_transaction on Transaction {\n  id\n  transaction_hash\n  block_number\n  transaction_status\n  transaction_type\n  timestamp\n  initiator_address\n  initiator_identifier\n  initiator {\n    is_social_verified\n    id\n  }\n  main_calls {\n    selector_identifier\n    id\n  }\n  ...TransactionsTableExpandedItemFragment_transaction\n}\n",
            "variables": {
                "first": 30,
                "after": null,
                "input": {
                    "initiator_address": address,
                    "transaction_types": null,
                    "sort_by": "timestamp",
                    "order_by": "desc",
                    "min_block_number": null,
                    "max_block_number": null,
                    "min_timestamp": null,
                    "max_timestamp": null
                }
            }
        }
        const res = await fetch(API, {
            "body": JSON.stringify(body),
            "method": "POST",
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error(e);
        return [];
    }
}