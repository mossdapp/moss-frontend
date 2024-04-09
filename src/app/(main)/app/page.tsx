import {DappList} from "@/constants";
import superdappImg from '@/assets/super-dapp.png';


const AppPage = () => {
    return (
        <div>
            <h1 className={'text-center font-bold'}>App Store</h1>
            <img src={superdappImg.src} className={'w-full mt-4 rounded'} alt=""/>
            <div className={'grid grid-cols-3 gap-4 mt-8'}>
                {
                    DappList?.map(it => {
                        return (
                            <div key={it.name} className={'flex flex-col gap-4 cursor-pointer'}>
                                <img src={it.icon} alt={it.name} className={'w-20 h-20 mx-auto'}/>
                                <div className={'text-center text-sm text-muted-foreground'}>
                                    {it.name}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

 export default AppPage;