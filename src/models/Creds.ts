export class Creds{
    public static mode:CredMode;
    public static apiToken:string;
    public static serverPublicKey:string;
    public static clientPrivateKey:string;
}
export enum CredMode{
    test="TESTING",
    prod="PRODUCTION"
}