import dayjs from 'dayjs';

export const shortenAddress = (address?:string) =>{
    if(!address) return null
    return `${address?.substring(0,6)}...${address?.substring(address.length -4, address.length)}`
}

export const formatDate = (time: string | number) => {
    return dayjs(new Date(time)).format('YYYY/MM/DD');
}

export const formatTime = (time: string | number) => {
    return dayjs(new Date(Number(time) * 1000)).format('YYYY/MM/DD HH:mm:ss');
}