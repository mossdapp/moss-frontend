'use client';
import { TabBar } from '@/components/TabBar';
import QRCode from 'react-qr-code';
import { Container } from '@/components/Container';
import { CopyText } from '@/components/CopyText';
import { useAccount } from '@/hooks/useAccount';

export default function DepositPage() {
  const { account } = useAccount();

  console.log(account?.contractAddress);
  return (
    <Container>
      <TabBar title={'Deposit'} />
      <div className={'p-8 flex flex-col justify-center items-center'}>
        <QRCode value={account?.contractAddress || ''} />
        <div className={'mt-6'}>
          <CopyText text={account!.contractAddress} className={'block'}>
            <div className={'break-all text-gray-600'}>{account?.contractAddress}</div>
          </CopyText>
        </div>
      </div>
    </Container>
  );
}
