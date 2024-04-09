'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useSearchParams} from "next/navigation";


export default function TransferPage() {
    const searchParams = useSearchParams();

    const symbol = searchParams.get('symbol');
    return (
        <Container>
            <TabBar title={`Transfer ${symbol}`}/>
            <div className="space-y-4 mt-8">
                <div>
                    <Label>To Address</Label>
                    <Input placeholder={'To Address'}/>
                </div>
                <div>
                    <Label>Amount</Label>
                    <Input placeholder={'Enter Amount'}/>
                </div>
                <div className={'pt-8'}>
                    <Button className={'w-full'}>Transfer</Button>
                </div>
            </div>
        </Container>
    )
}