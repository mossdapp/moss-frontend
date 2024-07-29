'use client';
import { Container } from '@/components/Container';
import { TabBar } from '@/components/TabBar';
import { DappList } from '@/constants';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { useAccount } from '@/hooks/useAccount';

export default function OwnappSetting() {
  const { account } = useAccount();
  const [dappList, setDappList] = useState(
    DappList?.map((it) => {
      return {
        ...it,
        selected: false
      };
    })
  );

  const selectedDapp = dappList?.filter((it) => it.selected);

  const handleSubmit = async (isAll?: boolean) => {
    const classHashs = selectedDapp?.map((it) => it.classHash);
    try {
      const transactions = isAll
        ? [
            {
              contractAddress: account?.contractAddress as string,
              entrypoint: 'set_approval_all_dapps',
              calldata: [1]
            }
          ]
        : [
            {
              contractAddress: account?.contractAddress as string,
              entrypoint: 'set_own_dapps',
              calldata: [classHashs, new Array(classHashs.length).fill(1)]
            }
          ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      toast.success('Transaction submitted successfully');
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };
  return (
    <Container>
      <TabBar title={'Ownapp Setting'} />
      <div className="py-6">
        <div className={'text-center text-gray-400'}>Select your ownapp</div>
        <div className={'grid grid-cols-3 gap-4 mt-8'}>
          {dappList?.map((it) => {
            return (
              <div
                key={it.name}
                className={'flex flex-col gap-4 cursor-pointer relative'}
                onClick={() => {
                  setDappList(
                    dappList.map((item) => {
                      if (item.name === it.name) {
                        item.selected = !item.selected;
                      }
                      return item;
                    })
                  );
                }}
              >
                <img src={it.icon} alt={it.name} className={'w-20 h-20 mx-auto'} />
                <div className={'text-center text-sm text-muted-foreground'}>{it.name}</div>
                {it.selected && (
                  <div className={'absolute top-0 right-0'}>
                    <ShieldCheck className={'fill-green-500 text-white'} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={'mt-5 flex items-center gap-5'}>
          <Button className={'w-full'} onClick={() => handleSubmit()} disabled={!selectedDapp?.length}>
            Approval Selected
          </Button>
          <Button className={'w-full'} onClick={() => handleSubmit(true)}>
            Approval All
          </Button>
        </div>
      </div>
    </Container>
  );
}
