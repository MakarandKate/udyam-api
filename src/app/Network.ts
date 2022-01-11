const request = require('request');
import crypto from 'crypto';
import { CredMode, Creds } from '../models/Creds';
export default class Network{
    private static BASE_URL="https://udyamadharregistration.com/api/kappa";

    private static encrypt(payload:any){
        let str=JSON.stringify(payload);
        let encStrArr=str.match(/.{1,470}/g);
        let serverPublicKey=Creds.serverPublicKey.replace(/\\n/g,'\n');
        let encMsgArr=[];
        let encryptStr="";
        try{
            for(let i=0;i<encStrArr.length;i++){
                encMsgArr.push(crypto.publicEncrypt({
                    key:serverPublicKey
                }, Buffer.from(encStrArr[i])).toString("base64"))
            }
            encryptStr=encMsgArr.join(",");
            
        }catch(err){

        }
        
        return encryptStr;
    }

    private static decrypt(encData:string):any{
        let clientPrivateKey=Creds.clientPrivateKey.replace(/\\n/g,'\n');
        let encDataArr=encData.split(",");
        let decDataArr=[];
        for(let i=0;i<encDataArr.length;i++){
            decDataArr.push(crypto.privateDecrypt({key:clientPrivateKey}, Buffer.from(encDataArr[i], "base64")).toString("utf8"))
        }
        let decrypted=decDataArr.join();
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
                "x-api-token":Creds.mode===CredMode.test? "TESTING" :Creds.apiToken,
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