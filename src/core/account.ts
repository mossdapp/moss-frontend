import {Signer, constants, ec, json, stark, Provider, hash, CallData,RpcProvider} from "starknet";
import {extractRSFromSignature} from "@/core/utils";

// 将16进制字符串填充到64个字符
function padHexTo256Bits(hexString: string) {
    // 检查是否有'0x'前缀，如果有，先去除
    const cleanHex = hexString.startsWith('0x') ? hexString.substring(2) : hexString;
    console.log(cleanHex, 'hh')
    // 计算需要填充的0的数量
    const paddingLength = 64 - cleanHex.length;
    // 生成填充用的0字符串
    const padding = '0'.repeat(paddingLength);
    // 返回填充后的字符串，确保它有'0x'前缀
    return '0x' + padding + cleanHex;
}

// 分割16进制字符串到两个128位的部分
function splitHexTo128Bits(hexString: string) {
    const paddedHex = padHexTo256Bits(hexString);
    const firstHalf = paddedHex.substring(0, 34); // 包括'0x'，所以是34个字符
    const secondHalf = '0x' + paddedHex.substring(34);
    return [firstHalf, secondHalf];
}



const provider = new RpcProvider({nodeUrl: 'https://starknet-sepolia.public.blastapi.io'});


export const getAccountByPublicKey = (publicKey: string) => {
    // 04
// 93d50c1b087f73b2e5f0caab14255c3a
// 91cd1bb07778ffef2b7a48c0f97f747c
// 3b19f42ec6636f98768920310b2146d0
// 1f03397851d30d656b5eb58a266320f6

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


    const AAaccountClassHash = '0x00dfed88fb44f2df096a39c3686830dc78fe09f89459be3177c1c59cac1f338b';
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

export const getDeployHash = (publicKey: string) => {
    const chId = '0x534e5f5345504f4c4941';

    const {contractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);



    // 获取交易hash
    const deployTransctionHash = hash.calculateDeployAccountTransactionHash(
        contractAddress,
        classHash,
        callData,
        salt,
        1n,
        1000000000000000n,
        chId,
        0n
    );

    let deployHash = deployTransctionHash.startsWith('0x') ? deployTransctionHash.substring(2) : deployTransctionHash;

    // 确保deployHash为64位长度
    deployHash = deployHash.padStart(64, '0');

    console.log("deployHash = ", deployHash);

    return deployHash;
}


export async function deployAccount(publicKey: string, signHash: string, signCount: number) {
    try {
        const {contractAddress, classHash, callData, salt} = getAccountByPublicKey(publicKey);

        console.log("signHash = ", signHash, contractAddress);


// 直接获取webauthn 的sign
// Signature:
// 0x30 ASN.1SEQUENCE
// 46 total length
// 02 int type
// 21 length
// 00
// a05b2d3c4a1103161660d6afbd8702458806bbced2513276a5665e3d4036dd93   r
// 02 int type
// 21 length
// 00
// e82b3cfcee889defe1b75966cef7a7f26fce87b7882ffa376c068346b8737d5e   s
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
            maxFee:  1000000000000000n, // 设定最大费用，根据需要调整
            version: 1n, // 合约版本
            nonce: 0n, // 随机数，根据需要调整
        };

        // 调用 deployAccountContract 函数
        const deployTransaction = {
            classHash: classHash,
            constructorCalldata: callData,
            addressSalt: salt,
            signature: hexPartsArray, // 需要字符串数据格式
        };
        console.log("**********:", deployTransaction, details);

        // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
        const response = await provider.deployAccountContract(deployTransaction, details);
        console.log('部署成功，交易信息：', response);

    } catch (error) {
        console.error("部署账户或签名过程中出错：", error);
    }
}
