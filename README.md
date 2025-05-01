A ESM-only typed fork of the original abandoned [akamai-auth-token](https://github.com/anilGupta/akamai-token-generator) library by @anilGupta.

## Installation

using **yarn**:

`yarn add akamai-auth-token`

Or with **npm**:

`npm install akamai-auth-token`

## Uses

```ts
import Akamai from 'akamai-auth-token';
const config = {
         algorithm : 'SHA256',
         acl : '/*',
         window : 6000,
         key : "myPrivateKey",
         encoding: false
    };


const akamai = new Akamai(config);
const token = akamai.generateToken();
```
