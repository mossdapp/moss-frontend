import {nanoid} from "nanoid";

export const getPasskeyOptions = () => {
    return {
        "challenge": Buffer.from(nanoid(20)),
        "rp": {
            "name": "moss",
            "id": window.location.hostname
        },
        "user": {
            "id": Buffer.from("GOVsRuhMQWNoScmh_cK02QyQwTolHSUSlX5ciH242Y4"),
            "name": "moss-user",
            "displayName": "moss-user"
        },
        "pubKeyCredParams": [
            {
                "alg": -7,
                "type": "public-key" as const
            }
        ],
        "timeout": 60000,
        "excludeCredentials": [
        ],
        "authenticatorSelection": {
            "authenticatorAttachment": "platform" as const,
            "requireResidentKey": true,
            "residentKey": "required" as const
        },
        "extensions": {
            "credProps": true
        }
    }
}