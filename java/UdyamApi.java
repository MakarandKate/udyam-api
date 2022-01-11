
import java.net.URI;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;




import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.File;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;




public class UdyamApi {
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();
    static String node_rsa_init = "RSA/ECB/OAEPWithSHA1AndMGF1Padding";
    
    public static void main(String[] args) throws Exception {

        System.out.println("Testing 2 - Send Http POST request");
        UdyamApi udyamApi=new UdyamApi();
        udyamApi.getCertificate("PHONE_NUMBER","");
        
    }


    private void getCertificate(String phone,String email) throws Exception {

        String payload= "{\"phone\":\""+phone+"\"}";
        String payload2 = "{\"encData\": \""+encrypt(payload)+"\"}";
        
        HttpRequest request = HttpRequest.newBuilder()
        .POST(HttpRequest.BodyPublishers.ofString(payload2))
                .uri(URI.create("https://udyamadharregistration.com/api/kappa/getCertificate"))
                .setHeader("x-api-token", "7lIKEDIfhiLbrOO8") // add request header
                .header("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    

        System.out.println(decrypt(response.body()));

    }

    

    private String encrypt(String payload) throws Exception{
        return encryptStringWithPublicKey(payload, "/home/mak/dev/udyam-api/keys/server_public_key.pem");
    }

    private String decrypt(String encMsg) throws Exception{
        encMsg=encMsg.replace("{\"status\":\"success\",\"encData\":\"", "").replace("\"}", "");
        System.out.println(encMsg);
        String[] encMsgArr=encMsg.split(",");
        String decrypted="";
        for(int i=0;i<encMsgArr.length;i++){
            decrypted+=decryptStringWithPrivateKey(encMsgArr[i],"/home/mak/dev/udyam-api/keys/client_private_key.pem");
        }
        
        return decrypted;
    }

    private static String encryptStringWithPublicKey(String s, String keyFilename) throws Exception {
        Cipher cipher = Cipher.getInstance(node_rsa_init);
        PublicKey pubkey = readPublicKeyFromPem(keyFilename);
        // encrypt
        // cipher init compatible with node.js crypto module!
        cipher.init(Cipher.ENCRYPT_MODE, pubkey,
                new OAEPParameterSpec("SHA-1", "MGF1", MGF1ParameterSpec.SHA1, PSource.PSpecified.DEFAULT));
        String enc = Base64.getEncoder().encodeToString(cipher.doFinal(s.getBytes("UTF-8")));
        return enc;
    }
  
    private static String decryptStringWithPrivateKey(String s, String keyFilename)  throws Exception {
        Cipher cipher = Cipher.getInstance(node_rsa_init);
        PrivateKey pkey = readPrivateKeyFromPem(keyFilename);
        // cipher init compatible with node.js crypto module!
        cipher.init(Cipher.DECRYPT_MODE, pkey,
                new OAEPParameterSpec("SHA-1", "MGF1", MGF1ParameterSpec.SHA1, PSource.PSpecified.DEFAULT));
        String dec = new String(cipher.doFinal(Base64.getDecoder().decode(s)), "UTF-8");
        return dec;
    }
  
    private static PrivateKey readPrivateKeyFromPem(String keyFilename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(new File(keyFilename).toPath());
        String keyString = new String(keyBytes);
  
        if (keyString.contains("BEGIN PRIVATE KEY")) {
            // PCKS8 format key
            return readPrivateKeyFromPem_PKCS8(keyFilename);
        }
        else if(keyString.contains("BEGIN RSA PRIVATE KEY")){
            // PCKS1 format key
            return readPrivateKeyFromPem_PKCS1(keyFilename);
        }
        // unknown format
        throw new Exception("Unknown private key format in "+keyFilename);
    }
  
    // https://docs.oracle.com/javase/8/docs/api/java/security/spec/PKCS8EncodedKeySpec.html
    private static PrivateKey readPrivateKeyFromPem_PKCS8(String keyFilename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(new File(keyFilename).toPath());
        String keyString = new String(keyBytes);
        String privKeyPEM = keyString.replace("-----BEGIN PRIVATE KEY-----", "");
        privKeyPEM = privKeyPEM.replace("-----END PRIVATE KEY-----", "");
        privKeyPEM = privKeyPEM.replace("\r", "");
        privKeyPEM = privKeyPEM.replace("\n", "");
        keyBytes = Base64.getDecoder().decode(privKeyPEM);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }
  
    // https://docs.oracle.com/javase/8/docs/api/java/security/spec/X509EncodedKeySpec.html
    private static PublicKey readPublicKeyFromPem(String keyFilename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(new File(keyFilename).toPath());
        String keyString = new String(keyBytes);
        String privKeyPEM = keyString.replace("-----BEGIN PUBLIC KEY-----", "");
        privKeyPEM = privKeyPEM.replace("-----END PUBLIC KEY-----", "");
        privKeyPEM = privKeyPEM.replace("\r", "");
        privKeyPEM = privKeyPEM.replace("\n", "");
        keyBytes = Base64.getDecoder().decode(privKeyPEM);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }
  
    // https://stackoverflow.com/questions/7216969/getting-rsa-private-key-from-pem-base64-encoded-private-key-file/55339208#55339208
    // https://github.com/Mastercard/client-encryption-java/blob/master/src/main/java/com/mastercard/developer/utils/EncryptionUtils.java
    // https://docs.oracle.com/javase/8/docs/api/java/security/spec/PKCS8EncodedKeySpec.html
    private static PrivateKey readPrivateKeyFromPem_PKCS1(String keyFilename) throws Exception {
        byte[] keyBytes = Files.readAllBytes(new File(keyFilename).toPath());
        String keyString = new String(keyBytes);
        String privKeyPEM = keyString.replace("-----BEGIN RSA PRIVATE KEY-----", "");
        privKeyPEM = privKeyPEM.replace("-----END RSA PRIVATE KEY-----", "");
        privKeyPEM = privKeyPEM.replace("\r", "");
        privKeyPEM = privKeyPEM.replace("\n", "");
  
        keyBytes = Base64.getDecoder().decode(privKeyPEM);
  
        // We can't use Java internal APIs to parse ASN.1 structures, so we build a PKCS#8 key Java can understand
        int pkcs1Length = keyBytes.length;
        int totalLength = pkcs1Length + 22;
        byte[] pkcs8Header = new byte[] {
                0x30, (byte) 0x82, (byte) ((totalLength >> 8) & 0xff), (byte) (totalLength & 0xff), // Sequence + total length
                0x2, 0x1, 0x0, // Integer (0)
                0x30, 0xD, 0x6, 0x9, 0x2A, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xF7, 0xD, 0x1, 0x1, 0x1, 0x5, 0x0, // Sequence: 1.2.840.113549.1.1.1, NULL
                0x4, (byte) 0x82, (byte) ((pkcs1Length >> 8) & 0xff), (byte) (pkcs1Length & 0xff) // Octet string + length
        };
        keyBytes = join(pkcs8Header, keyBytes);
  
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }
  
    private static byte[] join(byte[] byteArray1, byte[] byteArray2){
        byte[] bytes = new byte[byteArray1.length + byteArray2.length];
        System.arraycopy(byteArray1, 0, bytes, 0, byteArray1.length);
        System.arraycopy(byteArray2, 0, bytes, byteArray1.length, byteArray2.length);
        return bytes;
   }

}
