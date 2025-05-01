# Akamai Token Generator

[![Publish](https://github.com/danitt/akamai-token-generator/actions/workflows/master.yml/badge.svg)](https://github.com/danitt/akamai-token-generator/actions/workflows/master.yml)
[![npm version](https://img.shields.io/npm/v/@danitt/akamai-auth-token.svg)](https://www.npmjs.com/package/@danitt/akamai-auth-token)

A ESM-only typed fork of the original abandoned [akamai-auth-token](https://github.com/anilGupta/akamai-token-generator).

## Installation

using **yarn**:

`yarn add @danitt/akamai-auth-token`

Or with **npm**:

`npm install @danitt/akamai-auth-token`

## Uses

```ts
import Akamai from '@danitt/akamai-auth-token';
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
