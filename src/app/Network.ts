const request = require('request');
const fs = require('fs');
import NodeRSA from 'node-rsa';
import { CredMode, Creds } from '../models/Creds';
export default class Network{
    private static BASE_URL="https://udyamadharregistration.com/api/kappa";

    private static encrypt(payload:any){
        let cert=Creds.pemKey.replace(/\\n/g,'\n');
        const key = new NodeRSA(cert);
        const encrypted= key.encrypt(JSON.stringify({...payload}));
        let encryptStr=Buffer.from(encrypted).toString('base64');
        return encryptStr;
    }

    private static decrypt(encData:string):any{
        let cert=Creds.pemKey.replace(/\\n/g,'\n');
        const key = new NodeRSA(cert);
        let encBuffer= Buffer.from(encData, 'base64')
        const decrypted = key.decrypt(encBuffer, 'utf8');
        let obj={};
        try{
            obj=JSON.parse(decrypted);
        } catch(err){

        }
        return obj;
    }

    public static POST(param:{
        url:string,
        body:any
    }):Promise<any>{
        let bodyStr="";
        if(Creds.mode===CredMode.test){
            bodyStr=JSON.stringify({...param.body});
        }else{
            bodyStr=JSON.stringify({encData:this.encrypt({...param.body})});
        }
        const options={
            url:this.BASE_URL+param.url,
            method:"POST",
            headers:{
                "x-api-key":Creds.mode===CredMode.test? "TESTING" :Creds.apiKey,
                'Content-Type': 'application/json'
            },
            body:bodyStr
        }
        return new Promise((resolve,reject)=>{
            request(options, async (error:any, response:any)=> {
                if (error) {
                    reject(error);
                }
                try{
                    const resText=response?.body;

                    let obj=JSON.parse(resText);
                    
                    if(obj.status=="success"){
                        if(Creds.mode===CredMode.test){
                            resolve(obj);
                        }else if(obj.encData){
                            let decrytedData=this.decrypt(obj.encData)
                            resolve(decrytedData);
                        }
                    }else{
                        reject(obj);
                    }
                    
                }catch(err){
                    reject(err);
                }
                
            });
        });
    }

}