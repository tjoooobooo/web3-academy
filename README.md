# Web3 Academy Course by Marco Besier at https://membership.marcobesier.com/


## Start up for hardhat node & deploy + seed scripts

```shell 
# NOTE: can be run with npm run dev.doStartUp 

npx hardhat node

// new terminal 
npx hardhat run --network localhost scripts/deploy.js

// manually get the deploy addresses and set them in the config.json
npx hardhat run --network localhost scripts/seed_exchange.js

// finally run webserver
npm run start
```

# Foundry - https://book.getfoundry.sh/forge/tests

## Why? 
* Rust implementation
* Foundry is multiple times faster than running jest tests
* Can execute fuzzy testing
* Forge tool provided by Foundry - Eth testing framework 
* Manipulate blockchain state 

## How to add foundry to a hardhat project?
* https://www.helpmegeek.com/how-to-integrate-foundry-hardhat-project/

* Run Test with ```forge test```

## Specialities
* ``vm.prank()`` - Can change owner etc
* ``vm.expectRevert("message")`` - expect revert to occur
