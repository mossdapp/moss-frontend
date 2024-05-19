'use client';
import { DappList } from '@/constants';
import superdappImg from '@/assets/super-dapp.png';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { provider } from '@/core/account';
import { Contract } from 'starknet';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import useSWR from 'swr';

const DappItem = ({ item: it, abi }: { item: any; abi: any }) => {
  const { account } = useAccount();
  const router = useRouter();
  const getOwnDapps = async (it: any) => {
    console.log(it, 'ss');
    if (!it.classHash) return;
    const contract = new Contract(abi, account.contractAddress, provider);

    const state = await contract.get_own_dapp_state(it.classHash);
    console.log(it, state);
    return state;
  };
  const { data: state } = useSWR(['ownapp-status', it], () => getOwnDapps(it));

  if (!state) return null;
  return (
    <div key={it.name} className={'flex flex-col gap-4 cursor-pointer'} onClick={() => router.push(it.path)}>
      <img src={it.icon} alt={it.name} className={'w-20 h-20 mx-auto'} />
      <div className={'text-center text-sm text-muted-foreground'}>{it.name}</div>
    </div>
  );
};

const AppPage = () => {
  const router = useRouter();
  const { account } = useAccount();
  const { abi } = useAccountABI(account?.contractAddress);

  return (
    <div>
      <h1 className={'text-center font-bold relative'}>
        App Store
        <span className={'absolute right-0 top-0 cursor-pointer'} onClick={() => router.push('/ownapp_setting')}>
          <Settings />
        </span>
      </h1>
      <img src={superdappImg.src} className={'w-full mt-4 rounded'} alt="" />
      <div className={'grid grid-cols-3 gap-4 mt-8'}>
        {abi &&
          DappList?.map((it) => {
            return <DappItem key={it.name} item={it} abi={abi} />;
          })}
      </div>
    </div>
  );
};

export default AppPage;
