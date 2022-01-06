import Network from "./app/Network";
import { CertificateDetails } from "./models/CertificateDetails";
import { LookUpParams } from "./models/LookUpParams";
import fs from 'fs';
import { CredMode, Creds } from "./models/Creds";

export class UdyamApi{

    public static init(params:{mode:CredMode,apiKey:string,pemKeyPath:string}){
        Creds.mode=params.mode;
        Creds.apiKey=params.apiKey;
        Creds.pemKey=fs.readFileSync(params.pemKeyPath).toString();
    }

    public static getCertificate(params:LookUpParams):Promise<CertificateDetails[]>{
        let resultArr:CertificateDetails[]=[];
        return new Promise(async (resolve,reject)=>{
            try{
                let resObj=await Network.POST({
                    url:'/getCertificate',
                    body:{
                        phone:params.phone,
                        email:params.email
                    }
                })
                if(resObj.status=="success" && resObj.urcCerts){
                    resObj=resObj.urcCerts;
                }
                if(resObj.length>0){
                    resObj.forEach( (el:CertificateDetails) => {
                        resultArr.push(el);
                    });
                }
            }catch(err){
                reject(err);
            }
            resolve(resultArr);
        });
    }
}