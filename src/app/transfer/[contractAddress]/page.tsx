import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";


export default function TransferPage() {
    return (
        <Container>
            <TabBar title={'Transfer'}/>
            <div className="space-y-4 mt-8">
                <div>
                    <Label>To Address</Label>
                    <Input placeholder={'To Address'}/>
                </div>
                <div>
                    <Label>Amount</Label>
                    <Input placeholder={'Enter Amount'}/>
                </div>
            </div>
        </Container>
    )
}