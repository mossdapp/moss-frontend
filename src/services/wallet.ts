import axios from "axios";

const API = 'http://localhost:4000/starknet';

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

        // GraphQL查询和变量
        const query = `query ContractPageQuery($input: ContractInput!) {      contract(input: $input) {
        contract_address
        is_starknet_class_code_verified
        implementation_type
        ...ContractPageContainerFragment_contract
        ...ContractPageOverviewTabFragment_contract
        ...ContractPageClassCodeHistoryTabFragment_contract
        ...ContractFunctionReadWriteTabFragment_contract
        id
      }
    }
    ...ContractFunctionReadCallsFragment_starknetClass
    ...ContractFunctionReadWriteTabFragment_contract
    ...ContractFunctionWriteCallsFragment_starknetClass
    ...ContractPageClassCodeHistoryTabFragment_contract
    ...ContractPageCodeSubTabFragment_contract
    ...ContractPageContainerFragment_contract
    ...ContractPageOverviewTabClassHashPlacedAtItemFragment_contract
    ...ContractPageOverviewTabEthBalanceItemFragment_contract
    ...ContractPageOverviewTabFragment_contract
    ...ContractPageOverviewTabStarknetIDItemFragment_contract
    ...ContractPageOverviewTabTypeItemFragment_contract
    ...StarknetClassCodeTabFragment_starknetClass
    ...StarknetClassCodeTabOnChainCodeItemFragment_starknetClass
    ...StarknetClassCodeTabSourceCodeItemFragment_starknetClass
    ...StarknetClassCodeTabVerifiedItemFragment_starknetClass
    ...StarknetClassVersionItemFragment_starknetClass
    }`;

        const variables = {
            input: {
                contract_address: contractAddress
            }
        };

        // 发送请求
        // const response = await axios.post(API, {
        //     query: query,
        //     variables: variables
        // });
        const body = {
            query: query,
            variables: variables
        };
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