import Network from "./app/Network";
import { CertificateDetails } from "./models/CertificateDetails";
import { LookUpParams } from "./models/LookUpParams";
import fs from 'fs';
import { CredMode, Creds } from "./models/Creds";

export class UdyamApi{

    public static init(params:{
        mode:CredMode,
        apiToken:string,
        serverPublicKeyPath:string,
        clientPrivateKeyPath:string
    }){
        Creds.mode=params.mode;
        Creds.apiToken=params.apiToken;
        Creds.serverPublicKey=fs.readFileSync(params.serverPublicKeyPath).toString();
        Creds.clientPrivateKey=fs.readFileSync(params.clientPrivateKeyPath).toString();
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


    public static generateLink(phone:string):Promise<string>{
        let link:string="";
        return new Promise(async (resolve,reject)=>{
            try{
                let resObj=await Network.POST({
                    url:'/generateLink',
                    body:{
                        phone
                    }
                })
                if(resObj.status=="success" && resObj.link){
                    link=resObj.link;
                }else if(resObj.link){
                    link=resObj.link;
                }
                
            }catch(err){
                reject(err);
            }
            resolve(link);
        });
    }
    
}