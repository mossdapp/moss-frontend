'use client';
import { TokenUrlMap } from '@/constants';
import { Button } from '@/components/ui/button';
import { deployAccount, getDeployHash, provider } from '@/core/account';
import { arrayBufferToHex, bufferDecodeHexString } from '@/core/utils';
import useSWR from 'swr';
import { queryContractInfo, queryNFTBalance, queryTokenBalance } from '@/services/wallet';
import { shortenAddress } from '@/utils/common';
import { CopyText } from '@/components/CopyText';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, ArrowDown, RocketIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from '@/hooks/useAccount';
import { PendingTransactions, useTransactionStore } from '@/components/PendingTransactions';
import { NFTIcon } from '@/components/Icons';
import { Badge } from '@/components/ui/badge';

const TokenList = () => {
  const router = useRouter();
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['token-balance', account?.contractAddress], () =>
    queryTokenBalance(account!.contractAddress)
  );

  return (
    <div className={'mt-4 space-y-6'}>
      {banlanceData?.data?.tokenBalancesByOwnerAddress.map((item: any) => {
        return (
          <div
            key={item.id}
            className={'flex items-center justify-between cursor-pointer'}
            onClick={() => {
              router.push(`/transfer/${item.token_contract_address}?symbol=${item.contract_token_contract.symbol}`);
            }}
          >
            <div className="w-8">
              <img
                className={'h-5'}
                src={item.contract_token_contract.icon_url || TokenUrlMap.ERC20}
                alt={item.contract_token_contract.symbol}
              />
            </div>
            <div className={'flex-1 pl-8'}>{item.contract_token_contract.symbol}</div>
            <span>{item.balance_display}</span>
          </div>
        );
      })}
    </div>
  );
};

const NFTList = () => {
  const router = useRouter();
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['nft-balance', account?.contractAddress], () =>
    queryNFTBalance(account!.contractAddress)
  );

  return (
    <div className={'mt-4 grid grid-cols-2 gap-4'}>
      {banlanceData?.data?.nfts?.edges?.map((item: any, i: number) => {
        return (
          <div
            key={i}
            className={'cursor-pointer shadow'}
            onClick={() => {
              router.push(`/transfer/${item.node.nft_contract_address}?name=${item.node.name}`);
            }}
          >
            <div className="w-full">
              {item.node.image_url ? (
                <img className={'w-full'} src={item.node.image_url} alt={item.node.name} />
              ) : (
                <NFTIcon />
              )}
            </div>
            <div className="flex justify-between items-center p-2">
              <div className={'text-gray-600 text-lg font-semibold'}>{item.node.name || 'NFT'}</div>
              <span>#{item.node.token_id}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Wallet() {
  const router = useRouter();
  const { account } = useAccount();
  const { push } = useTransactionStore();

  const { data: contractInfo, mutate } = useSWR(['contractInfo', account?.contractAddress], () =>
    queryContractInfo(account!.contractAddress)
  );

  const handleDeploy = async () => {
    try {
      const deployHash = await getDeployHash(account!.publicKey);

      const publicKeyCredentialRequestOptions = {
        challenge: bufferDecodeHexString(deployHash),
        rpId: window.location.hostname // 确保与当前页面的域名相匹配
      };
      const cred = (await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions })) as any;

      const signature = cred?.response.signature;
      const signatureHex = arrayBufferToHex(signature);

      // 提取客户端数据JSON
      const clientDataJSON = cred?.response.clientDataJSON;

      // 获取authenticatorData，这里的assertion是一个PublicKeyCredential对象
      const authenticatorData = cred?.response.authenticatorData;

      const clientDataJSONHex = arrayBufferToHex(clientDataJSON);
      const authenticatorDataHex = arrayBufferToHex(authenticatorData);

      // 获取最后四个字节的十六进制字符串
      const lastFourBytesHex = authenticatorDataHex.slice(-10); // 获取最后8个字符

      // 解析十六进制为整数，假设大端序
      const signCount = parseInt(lastFourBytesHex, 16); // 只取最后两位数

      // 这里你可以将提取到的数据发送给服务器进行验证
      console.log(`Client Data JSON: ${clientDataJSONHex}`);
      console.log(`authenticatorData: ${authenticatorDataHex}`);
      console.log(`signCount: ${signCount}`);
      console.log(signatureHex);

      const response = await deployAccount(account!.publicKey, signatureHex.slice(2), signCount);
      push(response.transaction_hash);
      toast.success('Deploy transaction submit successfully');
      const recipient = await provider.waitForTransaction(response.transaction_hash);
      console.log(recipient, 'rr');
      if ((recipient as any)?.execution_status === 'SUCCEEDED') {
        toast.success('Transaction has been confirmed');
        mutate('');
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  console.log(contractInfo);

  return (
    <div>
      <div className={'text-center font-bold text-lg relative'}>
        <PendingTransactions />
        <div className={'space-y-1'}>
          <div>Wallet</div>
          <Badge>Sepolia</Badge>
        </div>

        <Link href={'/faucet'} className={'right-1 absolute top-0 text-sm text-gray-400'}>
          Faucet
        </Link>
      </div>
      <div className={'flex justify-center text-foreground text-md font-bold mt-5'}>
        <CopyText text={account!.contractAddress}>{shortenAddress(account?.contractAddress)}</CopyText>
      </div>
      {contractInfo && !contractInfo?.data ? (
        <Alert className={'mt-8'} variant="destructive">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Deploy!</AlertTitle>
          <AlertDescription className={'flex justify-between items-center'}>
            Account contract not deploy!
            <Button onClick={handleDeploy} variant={'destructive'} size={'sm'}>
              Deploy
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className={'mt-8 flex items-center justify-center gap-5'}>
        <Button variant={'outline'} className={'gap-2'} onClick={() => router.push('/deposit')}>
          <ArrowDown />
          Deposit
        </Button>
        <Button variant={'outline'} className={'gap-2'} onClick={() => router.push('/activity')}>
          <Activity />
          Activity
        </Button>
      </div>
      <div className={'mt-8'}>
        <Tabs defaultValue="token" className="w-[400px] mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="token">Tokens</TabsTrigger>
            <TabsTrigger value="nft">NFT</TabsTrigger>
          </TabsList>
          <TabsContent value="token">
            <TokenList />
          </TabsContent>
          <TabsContent value="nft">
            <NFTList />
          </TabsContent>
        </Tabs>
        {/*<div className={'font-bold text-lg'}>*/}
        {/*    Tokens*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
