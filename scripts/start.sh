#!/bin/zsh

ttab npx hardhat node

sleep 2

# new terminal
ttab npx hardhat run --network localhost ./scripts/deploy.js

sleep 2

ttab npx hardhat run --network localhost ./scripts/seed_exchange.js

## finally run webserver
npm run start
