import axios from "axios";

export async function GET(request: Request) {
    console.log(request.body)
    return Response.json({ message: 'Get graph data' })
}

const endpoint = "https://graphql-sepolia.starkscan.co/";

export async function POST(request: Request) {
    const body = await request.json();

    const headers = {
        "Accept": "application/json",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"macOS\"",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "Referer": "https://sepolia.starkscan.co/",
        "Origin": "https://sepolia.starkscan.co",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    };

    try {
        const res = await axios.post(endpoint, body, {headers: headers});
        return Response.json(res.data)
    } catch (error) {
        console.log(error);
        return Response.json(error)
    }
}