'use client';
import { TabBar } from '@/components/TabBar';
import { Container } from '@/components/Container';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';
import { DappList, TokenUrlMap } from '@/constants';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { queryNFTBalance, queryTokenBalance } from '@/services/wallet';
import { NFTIcon } from '@/components/Icons';
import { Suspense, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, X } from 'lucide-react';
import * as React from 'react';
import { cairo, Contract, hash, num, shortString, uint256 } from 'starknet';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDecimals } from '@/core/web3';
import { formatUnits, parseUnits } from 'viem';
import { Select } from '@/components/Select';
import { useSearchParam } from 'react-use';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString, shortenAddress } from '@/utils/common';
import { TokenSelect } from '@/components/TokenSelect';
import Image from 'next/image';

const MarketDapp = DappList.find((it) => it.name === 'Dex');

const TokenPanel = () => {
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['token-balance', account?.contractAddress], () =>
    queryTokenBalance(account?.contractAddress)
  );
  const [sellToken, setSellToken] = useState('');
  const [buyToken, setBuyToken] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  const { push } = useTransactionStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('submit');
    try {
      setLoading(true);
      const Selector = hash.getSelectorFromName('place_order');
      const sellDecimals = await getDecimals(sellToken as string);
      const amountWei = parseUnits(sellAmount, Number(sellDecimals));
      const res = cairo.uint256(amountWei.toString());
      const buyDecimals = await getDecimals(buyToken as string);
      const buyAmountWei = parseUnits(buyAmount, Number(buyDecimals));
      const res1 = cairo.uint256(buyAmountWei.toString());
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, Selector, [sellToken, buyToken, res.low, res.high, res1.low, res1.high]]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      if (result.execution_status === 'SUCCEEDED') {
        toast.success('Transaction has been confirmed');
      } else {
        toast.error(result.revert_reason);
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'mt-4'}>
      <div className={'rounded-xl bg-accent p-6 relative'}>
        <div className={'text-muted-foreground'}>Sell</div>
        <div className={'flex mt-2 gap-2'}>
          <Input
            type={'number'}
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className={'flex-1 p-0 text-lg border-none bg-transparent shadowNone'}
          />
          <TokenSelect
            value={sellToken}
            onChange={(v) => {
              setSellToken(v);
            }}
            options={banlanceData?.data?.tokenBalancesByOwnerAddress.map((item: any) => {
              return {
                label: (
                  <div className="flex items-center gap-2">
                    <Image
                      width={20}
                      height={20}
                      className={'h-5 object-contain'}
                      src={item.contract_token_contract.icon_url || TokenUrlMap.ERC20}
                      alt={item.contract_token_contract.symbol}
                    />
                    <span>{item.contract_token_contract.symbol}</span>
                  </div>
                ),
                value: item.token_contract_address
              };
            })}
          />
        </div>
        <div className={'flex justify-end text-muted-foreground text-sm mt-2'}>
          Balance:{' '}
          {
            banlanceData?.data?.tokenBalancesByOwnerAddress.find((it: any) => it.token_contract_address === sellToken)
              ?.balance_display
          }
        </div>
        <div
          className={
            'absolute bottom-[-20px] left-[50%] ml-[-20px] w-10 h-10 rounded-[12px] bg-secondary border-2 border-white flex justify-center items-center'
          }
        >
          <ArrowDown />
        </div>
      </div>
      <div className={'rounded-xl bg-accent p-6 mt-1'}>
        <div className={'text-muted-foreground'}>Buy</div>
        <div className={'flex mt-2'}>
          <Input
            type={'number'}
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className={'flex-1 p-0 text-lg border-none bg-transparent shadowNone'}
          />
          <TokenSelect
            value={buyToken}
            onChange={(v) => {
              setBuyToken(v);
            }}
            options={banlanceData?.data?.tokenBalancesByOwnerAddress.map((item: any) => {
              return {
                label: (
                  <div className="flex items-center gap-2">
                    <Image
                      width={20}
                      height={20}
                      className={'h-5 object-contain'}
                      src={item.contract_token_contract.icon_url || TokenUrlMap.ERC20}
                      alt={item.contract_token_contract.symbol}
                    />
                    <span>{item.contract_token_contract.symbol}</span>
                  </div>
                ),
                value: item.token_contract_address
              };
            })}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        loading={loading}
        className={'w-full mt-6'}
        disabled={!(buyToken && buyAmount && sellToken && sellAmount)}
      >
        Place a order
      </Button>
    </div>
  );
};

const BuyModal = ({
  order,
  orderID,
  open,
  setOpen,
  saler
}: {
  order: any;
  orderID: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  saler: string;
}) => {
  const { account } = useAccount();
  const { push } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const TokenManageDapp = DappList.find((it) => it.name === 'TokenManage');

  const handleSubmit = async () => {
    console.log('submit');
    try {
      setLoading(true);
      const res = cairo.uint256(order.sellAmount.toString());
      const Selector = hash.getSelectorFromName('token_approve');
      console.log('Selector =', Selector);
      const BuySelector = hash.getSelectorFromName('buy_order');
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [TokenManageDapp!.classHash, Selector, [order.sellToken, saler, res.low, res.high]]
        },
        {
          contractAddress: saler,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, BuySelector, [TokenManageDapp?.classHash, orderID]]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      if (result.execution_status === 'SUCCEEDED') {
        setOpen(false);
        toast.success('Transaction has been confirmed');
      } else {
        toast.error(result.revert_reason);
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(order, 'rr');

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleSubmit}
      confirmButtonProps={{
        loading
      }}
    >
      <div>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Token Swap</div>
        </div>
        <div className="mt-4">
          <Label>Sell Token</Label>
          <div>{shortenAddress(order.buyToken)}</div>
        </div>
        <div className="mt-4">
          <Label>Sell Amount</Label>
          <div>{order.formattedBuyAmount}</div>
        </div>
        <div className="mt-4">
          <Label>Buy Token</Label>
          <div>{shortenAddress(order.sellToken)}</div>
        </div>
        <div className="mt-4">
          <Label>Buy Amount</Label>
          <div>{order.formattedSellAmount}</div>
        </div>
      </div>
    </Modal>
  );
};

const BuyPanel = () => {
  const searchParams = useSearchParams();
  const salerAddress = searchParams.get('saler');
  const [saler, setSaler] = useState('');
  const [open, setOpen] = useState(false);
  console.log(open, 'ss');
  const { account } = useAccount();
  const { abi } = useAccountABI(account?.contractAddress);
  const { push } = useTransactionStore();
  const [id, setId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getOrder = async () => {
    if (!id) {
      toast.error('Please input order id');
      return;
    }
    try {
      const Selector = hash.getSelectorFromName('get_order_info');
      const contract = new Contract(abi!, salerAddress!, provider);
      console.log(MarketDapp!.classHash, Selector, [id]);
      const result = await contract.read_own_dapp(MarketDapp!.classHash, Selector, [Number(id)]);
      console.log(result, 'result');
      const sellToken = num.toHex(result[1]);
      const buyToken = num.toHex(result[2]);
      const sellAmount = uint256
        .uint256ToBN({
          low: result[3],
          high: result[4]
        })
        .toString();
      const buyAmount = uint256
        .uint256ToBN({
          low: result[5],
          high: result[6]
        })
        .toString();

      const decimal1 = await getDecimals(buyToken as string);
      const decimal2 = await getDecimals(sellToken as string);

      setOrder({
        sellToken,
        buyToken,
        sellAmount,
        buyAmount,
        formattedSellAmount: formatUnits(BigInt(sellAmount), Number(decimal1)),
        formattedBuyAmount: formatUnits(BigInt(buyAmount), Number(decimal2))
      });
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEnter = () => {
    const params = createQueryString(searchParams, 'saler', saler);
    router.push(pathname + '?' + params);
  };

  return (
    <div className={'py-8'}>
      {salerAddress ? (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input order id to search order'} value={id} onChange={(e) => setId(e.target.value)} />
          <Button onClick={getOrder}>Search</Button>
        </div>
      ) : (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input saler address'} value={saler} onChange={(e) => setSaler(e.target.value)} />
          <Button onClick={handleEnter}>Enter</Button>
        </div>
      )}
      {order && <BuyModal order={order} orderID={id} open={open} setOpen={setOpen} saler={salerAddress!} />}
    </div>
  );
};

export default function DexPage() {
  return (
    <Suspense>
      <Container>
        <TabBar title={`Dex`} />
        <div className="py-4 space-y-6 px-2">
          <Tabs defaultValue="market" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="token">Swap</TabsTrigger>
            </TabsList>
            <TabsContent value="market">
              <BuyPanel />
            </TabsContent>
            <TabsContent value="token">
              <TokenPanel />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </Suspense>
  );
}
