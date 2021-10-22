#!/bin/sh
npm i
truffle init
npm install ganache-cli -g
ganache-cli
truffle compile
truffle migrate
npm run start
