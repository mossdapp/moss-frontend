
// 假设 `arrayBuffer` 是包含SPKI公钥的ArrayBuffer
import {fromBER} from "asn1js";
import {PublicKeyInfo} from "pkijs";

function byteArrayToHexString(byteArray: ArrayBuffer) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

export function bufferDecodeHexString(hexString) {
    // 移除可能存在的0x前缀
    hexString = hexString.replace(/^0x/, '');

    // 确保字符串长度为64字符，对应于256位，不足处补零
    let paddedHexString = hexString.padStart(64, '0');

    // 转换为Uint8Array
    return new Uint8Array(paddedHexString.match(/[\da-f]{2}/gi).map(byte => parseInt(byte, 16)));
}

export function extractPublicKey(arrayBuffer: ArrayBuffer) {
    // 首先，你需要有asn1js和pkijs加载到你的项目中。
    const asn1 = fromBER(arrayBuffer);
    const spki = new PublicKeyInfo({ schema: asn1.result });

    // 现在，我们提取公钥的二进制数据
    // 注意：这里的方法取决于你的具体实现和使用的库版本
    const publicKeyBytes = spki.subjectPublicKey.valueBlock.valueHex;

    // 转换为16进制字符串
    const publicKeyHex = byteArrayToHexString(new Uint8Array(publicKeyBytes));

    // 显示或使用公钥
    console.log("Public Key (Hex):", publicKeyHex);
    return publicKeyHex;
}

export function arrayBufferToHex(buffer: ArrayBuffer) {
    return '0x' + Array.prototype.map.call(new Uint8Array(buffer), x => x.toString(16).padStart(2, '0')).join('');
}

export function extractRSFromSignature(signatureHex: string) {
    let offset = 4; // 跳过序列标识和整体长度（假设为一字节）

    // 解析r值
    let rLength = parseInt(signatureHex.substring(offset + 2, offset + 4), 16);
    offset += 4; // 跳过整数标识和长度标识
    // 检查是否存在前导00字节，并相应调整
    if (signatureHex.substring(offset, offset + 2) === '00') {
        rLength -= 1; // 减去前导00
        offset += 2; // 跳过前导00
    }
    const rHex = signatureHex.substring(offset, offset + rLength * 2);
    offset += rLength * 2;

    // 解析s值
    offset += 2; // 跳过整数标识（"02"），直接到长度标识
    let sLength = parseInt(signatureHex.substring(offset, offset + 2), 16);
    offset += 2; // 跳过长度标识
    // 检查是否存在前导00字节，并相应调整
    if (signatureHex.substring(offset, offset + 2) === '00') {
        sLength -= 1; // 减去前导00
        offset += 2; // 跳过前导00
    }
    const sHex = signatureHex.substring(offset, offset + sLength * 2);

    return { rHex, sHex };
}