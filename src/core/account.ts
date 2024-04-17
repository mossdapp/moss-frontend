import {
    hash,
    CallData,
    RpcProvider,
    transaction,
    Call
} from "starknet";
import {extractRSFromSignature, padHexTo256Bits, splitHexTo128Bits} from "@/core/utils";
import {ENVS, GlobalConfig} from "@/constants";

export const provider = new RpcProvider({nodeUrl: 'https://starknet-sepolia.public.blastapi.io'});

const chainId = '0x534e5f5345504f4c4941'; //sepolia

const getNonce = async (address: string) => {
    try {
        const res = await fetch(GlobalConfig.blastAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'starknet_getNonce',
                params: ['latest', address],
                id: 0
            })
        });
        const data = await res.json();
        return parseInt(data.result, 16);
    } catch (e) {
        console.error(e);
        return 0;
    }
}

export const getAccountByPublicKey = (publicKey: string) => {
    const AApublicKey = publicKey;

    console.log(`Public Key: ${AApublicKey}`);

    // 去除开头的'04'并分割剩余的字符串为四个部分
    const trimmedPublicKey = AApublicKey.slice(2);
    const part1 = trimmedPublicKey.slice(0, 32);
    const part2 = trimmedPublicKey.slice(32, 64);
    const part3 = trimmedPublicKey.slice(64, 96);
    const part4 = trimmedPublicKey.slice(96, 128);

// 生成AAstarkKeyPub的值（取第一个16字节）
    const AAstarkKeyPub = `0x${part1}`;
    console.log('publicKey =', AAstarkKeyPub);

// 生成AAaccountConstructorCallData的值
// 注意：顺序是 part2, part1, part4, part3
    const AAaccountConstructorCallData = CallData.compile([
        `0x${part2}`,
        `0x${part1}`,
        `0x${part4}`,
        `0x${part3}`,
    ]);


    const AAaccountClassHash = ENVS.ACCOUNT_CLASS_HASH;
    console.log('Customized account class hash =', AAaccountClassHash);

    const AAcontractAddress = hash.calculateContractAddressFromHash(
        AAstarkKeyPub,
        AAaccountClassHash,
        AAaccountConstructorCallData,
        0
    );

    console.log('Precalculated account address=', AAcontractAddress);

    return {
        contractAddress: padHexTo256Bits(AAcontractAddress),
        classHash: AAaccountClassHash,
        callData: AAaccountConstructorCallData,
        salt: AAstarkKeyPub,
        publicKey,
    };
}

export const getDeployHash = async (publicKey: string) => {
    const {contractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);

    // 获取交易hash
    const deployTransctionHash = hash.calculateDeployAccountTransactionHash(
        contractAddress,
        classHash,
        callData,
        salt,
        1,
        1000000000000000,
        chainId as any,
        0
    );

    let deployHash = deployTransctionHash.startsWith('0x') ? deployTransctionHash.substring(2) : deployTransctionHash;

    // 确保deployHash为64位长度
    deployHash = deployHash.padStart(64, '0');

    console.log("deployHash = ", deployHash);

    return deployHash;
}

// const SimpleStorageAddress = '0x4ef8da68c94b71859f3b34cdce6b6128f03b10b568b523551cc28973e6f2f2a';
//
// const transactions = [
//     {
//         contractAddress: SimpleStorageAddress,
//         entrypoint: 'set',
//         calldata: [1]
//     }
// ];

export const getInvokeHash = async (publicKey: string, transactions: Call[]) => {
    const {contractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);

    // 1 must be string
    const mycalldata = transaction.getExecuteCalldata(transactions, '1');

    const nonce = await getNonce(contractAddress);

    console.log("mycalldata = ", transactions, mycalldata, nonce);

    // 获取交易hash  calldata is RawCalldata,RawCalldata BigNumberish array, use CallData.compile() to convert to Calldata
    const invokeTransctionHash = hash.calculateTransactionHash(
        contractAddress,
        1,    // version
        mycalldata,
        1500000000000000,  //maxfee
        chainId as any,
        nonce
    );

    let invokeHash = invokeTransctionHash.startsWith('0x') ? invokeTransctionHash.substring(2) : invokeTransctionHash;

    console.log("invokeHash = ", invokeHash);


    // 确保deployHash为64位长度
    invokeHash = invokeHash.padStart(64, '0');

    console.log("invokeHash = ", invokeHash);

    return invokeHash;
}

export async function deployAccount(publicKey: string, signHash: string, signCount: number) {
    try {
        const {contractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);

        console.log("signHash = ", signHash, contractAddress);
        const {rHex, sHex} = extractRSFromSignature(signHash);
        console.log("rHex = ", rHex);
        console.log("sHex = ", sHex);

        // 对r和s的16进制表示进行分割
        const [rHexFirstHalf, rHexSecondHalf] = splitHexTo128Bits(rHex);
        const [sHexFirstHalf, sHexSecondHalf] = splitHexTo128Bits(sHex);

        // 将分割后的部分组合成一个数组
        const hexPartsArray = [rHexSecondHalf, rHexFirstHalf, sHexSecondHalf, sHexFirstHalf, 1 , signCount];

        console.log("signatureArray = ", hexPartsArray);

        // 准备details对象
        const details = {
            maxFee:  1000000000000000, // 设定最大费用，根据需要调整
            version: 1, // 合约版本
            nonce: 0, // 随机数，根据需要调整
        };

        // 调用 deployAccountContract 函数
        const deployTransaction = {
            classHash: classHash,
            constructorCalldata: callData,
            addressSalt: salt,
            signature: hexPartsArray as any, // 需要字符串数据格式
        };
        console.log("**********:", deployTransaction, details);

        // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
        const response = await provider.deployAccountContract(deployTransaction, details);
        console.log('部署成功，交易信息：', response);

    } catch (error) {
        console.error("部署账户或签名过程中出错：", error);
    }
}

export async function invokeTx(publicKey: string, signHash: string, signCount: number, transactions: Call[]) {
    const {contractAddress: AAcontractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);
    // 1 must be string
    const mycalldata = transaction.getExecuteCalldata(transactions, '1');

    const nonce = await getNonce(AAcontractAddress);
    const {rHex, sHex} = extractRSFromSignature(signHash);


    console.log("rHex = ", rHex);
    console.log("sHex = ", sHex);

    // 对r和s的16进制表示进行分割
    const [rHexFirstHalf, rHexSecondHalf] = splitHexTo128Bits(rHex);
    const [sHexFirstHalf, sHexSecondHalf] = splitHexTo128Bits(sHex);


    // 将分割后的部分组合成一个数组
    const hexPartsArray = [rHexSecondHalf, rHexFirstHalf, sHexSecondHalf, sHexFirstHalf, 1, signCount];

    console.log("signatureArray = ", hexPartsArray);

    // 准备details对象
    const details = {
        maxFee:  1500000000000000, // 设定最大费用，根据需要调整, must be the same as hash function
        version: 1, // 合约版本
        nonce: nonce, // 随机数，根据需要调整
    };
    // invoke simple storage Contract 函数  calldata is Calldata (decimal-string array)
    const invokeTransaction = {
        contractAddress: AAcontractAddress,
        calldata: mycalldata,
        signature: hexPartsArray as any // 需要字符串数据格式
    };
    console.log("**********:", invokeTransaction, details);

    //const res = await myTestContract.increase_balance(myCall.calldata);
    // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
    const response = await provider.invokeFunction(invokeTransaction, details);
    console.log('成功，交易信息：', response);
    return response;
}
