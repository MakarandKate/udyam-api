# Introduction
Udyam Aadhar API can be used for
Order Lists:
Applying new certificate | Finding the certificate by phone or email | Checking if Udyam is already registered or not

# Getting Started
To start with API you need to get **API Key** and **pkcs8-pem** key.
To obtain API credentials contact admin

# Installation
`npm i @makarandkate/udyam-api`

# Initialization
```
import { UdyamApi } from '@makarandkate/udyam-api';
import { CredMode } from '@makarandkate/udyam-api/lib/models/Creds';
UdyamApi.init({
    mode:CredMode.test,
    apiToken:"API_TOKEN",
    serverPublicKeyPath:"path_to_public_key",
    clientPrivateKeyPath:"path_to_private_key"
})
```



# Usage
## Get Certificate
```
UdyamApi.getCertificate({
    phone:"",
    email:""
})
```
## Generate Link 

```
let link=await UdyamApi.generateLink("7588763862").catch(err=>{
        console.log(err);
});
```