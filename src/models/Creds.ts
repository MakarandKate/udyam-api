export class Creds{
    public static mode:CredMode;
    public static apiKey:string;
    public static pemKey:string;
}
export enum CredMode{
    test="TESTING",
    prod="PRODUCTION"
}