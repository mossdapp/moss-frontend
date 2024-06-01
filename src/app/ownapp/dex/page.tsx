'use client';
import { TabBar } from '@/components/TabBar';
import { Container } from '@/components/Container';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';
import { DappList, TokenUrlMap } from '@/constants';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { fetchTokenInfo, queryTokenBalance } from '@/services/wallet';
import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowRight, ArrowRightLeft } from 'lucide-react';
import * as React from 'react';
import { cairo, Contract, hash, num, uint256 } from 'starknet';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDecimals } from '@/core/web3';
import { formatUnits, parseUnits } from 'viem';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString, shortenAddress } from '@/utils/common';
import { TokenSelect } from '@/components/TokenSelect';
import Image from 'next/image';
import { useTokenListStore } from '@/hooks/useTokenList';
import { chunk } from 'lodash';
import { Loading } from '@/components/Loading';

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
  const { data, addToken } = useTokenListStore();

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

  const userTokenData =
    banlanceData?.data?.tokenBalancesByOwnerAddress?.map((item: any) => ({
      symbol: item.contract_token_contract.symbol,
      contractAddress: item.token_contract_address,
      balance: item.balance_display,
      icon: item.contract_token_contract.icon_url || TokenUrlMap.ERC20
    })) || [];

  const handleSearch = async (address: string) => {
    if (userTokenData?.find((it: any) => it.contractAddress?.toLowerCase() === address?.toLowerCase())) return;
    const res = await fetchTokenInfo(address);
    console.log(res, 'res');
    addToken(res);
  };

  const tokenList = [...userTokenData, ...data];

  const filterToken = (value: string) => {
    if (!value) return tokenList;
    return tokenList.filter((item: any) => item.contractAddress.toLowerCase() !== value.toLowerCase());
  };

  const sellBalance = tokenList.find((it: any) => it.contractAddress === sellToken)?.balance || 0;

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
            onSearch={handleSearch}
            options={filterToken(buyToken)?.map((item: any) => {
              return {
                label: (
                  <div className="flex items-center gap-2">
                    <Image width={20} height={20} className={'h-5 object-contain'} src={item.icon} alt={item.symbol} />
                    <span>{item.symbol}</span>
                  </div>
                ),
                value: item.contractAddress
              };
            })}
          />
        </div>
        <div className={'flex justify-end text-muted-foreground text-sm mt-2'}>Balance: {sellBalance}</div>
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
            onSearch={handleSearch}
            value={buyToken}
            onChange={(v) => {
              setBuyToken(v);
            }}
            options={filterToken(sellToken)?.map((item: any) => {
              return {
                label: (
                  <div className="flex items-center gap-2">
                    <Image width={20} height={20} className={'h-5 object-contain'} src={item.icon} alt={item.symbol} />
                    <span>{item.symbol}</span>
                  </div>
                ),
                value: item.contractAddress
              };
            })}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        loading={loading}
        className={'w-full mt-6'}
        disabled={!(buyToken && buyAmount && sellToken && sellAmount) || Number(sellBalance) === 0}
      >
        {Number(sellBalance) === 0 ? 'Insufficient balance' : 'Place a order'}
      </Button>
    </div>
  );
};

const BuyModal = ({ order, orderID, saler }: { order: any; orderID: string; saler: string }) => {
  const [open, setOpen] = useState(false);
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
          calldata: [TokenManageDapp!.classHash, Selector, [order.token_sell, saler, res.low, res.high]]
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
      trigger={<Button>Buy</Button>}
    >
      <div>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Token Swap</div>
        </div>
        <div className="mt-4">
          <Label>Sell Token</Label>
          <div className={'flex gap-2 items-center'}>
            <div>{formatUnits(BigInt(order.amount_buy), order.tokenBuyInfo!.decimals)}</div>
            <div>
              {order.tokenBuyInfo.symbol} {shortenAddress(order.buyToken)}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label>Buy Token</Label>
          <div className={'flex gap-2 items-center'}>
            <div>{formatUnits(BigInt(order.amount_sell), order.tokenSellInfo!.decimals)}</div>
            <div>
              {order.tokenSellInfo.symbol} {shortenAddress(order.sellToken)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const BuyPanel = () => {
  const searchParams = useSearchParams();
  const salerAddress = searchParams.get('saler');
  const [saler, setSaler] = useState('');
  const { account } = useAccount();
  const { abi } = useAccountABI(account?.contractAddress);
  const { push } = useTransactionStore();
  const [id, setId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getOrderList = async () => {
    try {
      const Selector = hash.getSelectorFromName('get_active_orders');
      const contract = new Contract(abi!, salerAddress!, provider);
      console.log(salerAddress, abi);
      const result = await contract.read_own_dapp(MarketDapp!.classHash, Selector, []);
      const [lenInt, ...rest] = result;
      const len = Number(BigInt(lenInt).toString());
      console.log(len, rest, result);
      if (len > 0) {
        const orderArr = chunk(rest, 8)?.map(async (it: any[]) => {
          console.log(it, 'it');
          const tokenSellInfo = await fetchTokenInfo(num.toHex(it[1]), account?.contractAddress);
          const tokenBuyInfo = await fetchTokenInfo(num.toHex(it[2]), account?.contractAddress);
          return {
            id: BigInt(it[0]).toString(),
            token_sell: num.toHex(it[1]),
            token_buy: num.toHex(it[2]),
            amount_sell: uint256.uint256ToBN({ low: it[3], high: it[4] }).toString(),
            amount_buy: uint256.uint256ToBN({ low: it[5], high: it[6] }).toString(),
            is_active: it[7],
            tokenSellInfo: tokenSellInfo,
            tokenBuyInfo: tokenBuyInfo
          };
        });
        return await Promise.all(orderArr);
      }
      return [];
    } catch (e) {
      console.error(e);
    }
  };

  console.log(abi, salerAddress);
  const { data, mutate, isLoading } = useSWR(
    abi && salerAddress ? ['dex-orders', salerAddress, abi] : null,
    getOrderList
  );

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
        <div className={'space-y-6'}>
          {isLoading && <Loading />}
          {data?.map((it, index) => {
            return (
              <div key={index} className={'border rounded-2xl shadow p-5 flex justify-between items-center'}>
                <div className={'flex gap-2 items-center'}>
                  <div className={'flex items-center gap-2'}>
                    <img
                      src={TokenUrlMap[it.tokenSellInfo!.symbol as keyof typeof TokenUrlMap] || TokenUrlMap.ERC20}
                      alt="token"
                      className={'h-6'}
                    />
                    <div className="flex gap-1">
                      <span>{formatUnits(BigInt(it.amount_sell), it.tokenSellInfo!.decimals)}</span>
                      <span>{it.tokenSellInfo?.symbol}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className={'text-gray-500'} />
                  <div className={'flex items-center gap-2'}>
                    <img
                      src={TokenUrlMap[it.tokenBuyInfo!.symbol as keyof typeof TokenUrlMap] || TokenUrlMap.ERC20}
                      alt="token"
                      className={'h-6'}
                    />
                    <div className="flex gap-1">
                      <span>{formatUnits(BigInt(it.amount_buy), it.tokenBuyInfo!.decimals)}</span>
                      <span>{it.tokenBuyInfo?.symbol}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <BuyModal order={it} orderID={it.id} saler={salerAddress!} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input saler address'} value={saler} onChange={(e) => setSaler(e.target.value)} />
          <Button onClick={handleEnter}>Enter</Button>
        </div>
      )}
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
