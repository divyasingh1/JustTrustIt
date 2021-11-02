# deployement
1.Install mongodb and node js
2. create .env file with following variables:
```
DB_URL= 'mongodb://localhost:27017/cryptorentals'
ADMIN_ADDRESS = '0xfCB0f528E95EaBB3fC3667c923aB1F84CFE20C77'
```
3. npm i

4. Run following command
``` 
npm i truffle -g
truffle init
npm install ganache-cli -g
ganache-cli
truffle compile
truffle migrate
```

**Run command to start the project:**
``` 
npm run start
```
**Backend service will be up on:**
base url: http://localhost:8082
