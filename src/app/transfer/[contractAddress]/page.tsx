'use client';
import { Container } from '@/components/Container';
import { TabBar } from '@/components/TabBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocalStorage } from 'react-use';
import { GlobalConfig } from '@/constants';
import { getInvokeHash, invokeTx, writeContract } from '@/core/account';
import { arrayBufferToHex, bufferDecodeHexString, splitAmountIntoU128Parts } from '@/core/utils';
import useSWR from 'swr';
import { queryTokenBalance } from '@/services/wallet';
import { useState } from 'react';
import { getDecimals } from '@/core/web3';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { cairo } from 'starknet';
import { useAccount } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';

export default function TransferPage() {
  const searchParams = useSearchParams();
  const { contractAddress } = useParams();
  const symbol = searchParams.get('symbol');
  const router = useRouter();
  const { push } = useTransactionStore();

  const { account } = useAccount();

  const { data: banlanceData } = useSWR(['balance', account?.contractAddress], () =>
    queryTokenBalance(account!.contractAddress)
  );

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0');

  const currentData = banlanceData?.data?.tokenBalancesByOwnerAddress?.find(
    (it: any) => it.token_contract_address === contractAddress
  );

  const handleClick = async () => {
    try {
      const decimals = await getDecimals(contractAddress as string);
      const amountWei = parseUnits(amount, Number(decimals));
      const res = cairo.uint256(amountWei.toString());
      console.log(res, 'rr');
      const transactions = [
        {
          contractAddress: contractAddress as string,
          entrypoint: 'transfer',
          calldata: [recipient, res.low, res.high]
        }
      ];

      // const hash = await getInvokeHash(account.publicKey, transactions);
      //
      // const publicKeyCredentialRequestOptions = {
      //     challenge: bufferDecodeHexString(hash),
      //     rpId: window.location.hostname, // 确保与当前页面的域名相匹配
      // }
      // const cred = await navigator.credentials.get({publicKey: publicKeyCredentialRequestOptions}) as any;
      //
      // const signature = cred?.response.signature;
      // const signatureHex = arrayBufferToHex(signature);
      // const authenticatorData = cred?.response.authenticatorData;
      // const authenticatorDataHex = arrayBufferToHex(authenticatorData);
      //
      // // 获取最后四个字节的十六进制字符串
      // const lastFourBytesHex = authenticatorDataHex.slice(-10);  // 获取最后8个字符
      //
      // // 解析十六进制为整数，假设大端序
      // const signCount = parseInt(lastFourBytesHex, 16);  // 只取最后两位数

      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      router.back();
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };
  return (
    <Container>
      <TabBar title={`Transfer ${symbol}`} />
      <div className="space-y-4 mt-8">
        <div className="flex justify-between">
          <div className="text-sm">Balance</div>
          <div>
            <div className="font-semibold text-xl">
              {currentData?.balance_display} {symbol}
            </div>
            {/*<div className="text-right text-sm">≈ $9,999.99 USD</div>*/}
          </div>
        </div>
        <div>
          <Label>To Address</Label>
          <Input placeholder={'To Address'} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        </div>
        <div>
          <Label>Amount</Label>
          <Input placeholder={'Enter Amount'} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className={'pt-8'}>
          <Button className={'w-full'} onClick={handleClick}>
            Transfer
          </Button>
        </div>
      </div>
    </Container>
  );
}
