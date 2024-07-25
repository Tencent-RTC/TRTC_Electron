// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LibGenerateTestUserSig from "./lib-generate-test-usersig.min.js";
console.warn("LibGenerateTestUserSig:", LibGenerateTestUserSig);
/*
 * Module:   GenerateTestUserSig
 *
 * Function: Used to generate UserSig for testing, UserSig is a security protection signature designed by Tencent Cloud for its cloud services.
 *           Its calculation method is to encrypt SDKAppID, UserID, and EXPIRETIME, with the encryption algorithm being HMAC-SHA256.
 *
 * Attention: Please do not publish the following code in your official online version of the App, for the following reasons:
 *
 *            Although the code in this file can correctly calculate UserSig, it is only suitable for quickly getting the basic functions of the SDK to work and is not suitable for online products.
 *            This is because the SECRETKEY in the client code can be easily decompiled and cracked, especially the difficulty of cracking the code on the web side is almost zero. 
 *            Once your key is leaked, attackers can calculate the correct UserSig to steal your Tencent Cloud traffic.
 *
 *            The correct approach is to place the calculation code for UserSig and the encryption key on your business server, and then have the App obtain the UserSig calculated in real-time from your server as needed.
 *            Since the cost of cracking a server is higher than that of cracking a client app, the server calculation scheme can better protect your encryption key.
 *
 * Reference：https://cloud.tencent.com/document/product/647/17275#Server
 */
const genTestUserSig = function (userID: string) {
  /**
   * Tencent Cloud SDKAppID, which should be replaced with user's SDKAppID.
   * Enter Tencent Cloud TRTC [Console] (https://console.cloud.tencent.com/trtc ) to create an application,
   * and you will see the SDKAppID.
   * It is a unique identifier used by Tencent Cloud to identify users.
   */
  const SDKAppID = 0;

  /**
   * Encryption key for calculating signature, which can be obtained in the following steps:
   *
   * Step1. Enter Tencent Cloud TRTC [Console](https://console.cloud.tencent.com/rav ),
   * and create an application if you don't have one.
   * Step2. Click your application to find "Quick Start".
   * Step3. Click "View Secret Key" to see the encryption key for calculating UserSig,
   * and copy it to the following variable.
   *
   * Notes: this method is only applicable for debugging Demo. Before official launch,
   * please migrate the UserSig calculation code and key to your backend server to avoid
   * unauthorized traffic use caused by the leakage of encryption key.
   * Document: https://intl.cloud.tencent.com/document/product/647/35166#Server
   */
  const SDKSecretKey = "";

  /**
   * Signature expiration time, which should not be too short
   * Time unit: second
   * Default time: 7 * 24 * 60 * 60 = 604800 = 7days
   */
  const EXPIRETIME = 604800;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (SDKAppID === 0 || SDKSecretKey === "") {
    const msg =
      "Please config your 'SDKAppID' and 'SDKSecretKey' in file 'src/debug/gen-test-user-sig.js'";
    console && console.error(msg);
    alert && alert(msg);
  }

  const generator = new LibGenerateTestUserSig(SDKAppID, SDKSecretKey, EXPIRETIME);
  const userSig = generator.genTestUserSig(userID);

  return {
    sdkAppId: SDKAppID,
    userSig: userSig,
  };
};

export default genTestUserSig;
