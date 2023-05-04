# Web3 Academy Course by Marco Besier at https://membership.marcobesier.com/


## Start up for hardhat node & deploy + seed scripts

```shell
npx hardhat node

// new terminal 
npx hardhat run --network localhost scripts/deploy.js

// TODO improve that
// manually get the deploy addresses and set them in the config.json
npx hardhat run --network localhost scripts/seed_exchange.js

// finally run webserver
npm run start
```
