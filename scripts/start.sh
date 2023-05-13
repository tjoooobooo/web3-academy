#!/bin/zsh

ttab npx hardhat node

sleep 2

# new terminal
ttab npx hardhat run --network localhost ./scripts/deploy.js
ttab npx hardhat run --network localhost ./scripts/seed_exchange.js

## finally run webserver
npm run start
