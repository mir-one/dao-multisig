import { execFift } from "../utils.js";

const args = process.argv.slice(2);
if (!args || args.length != 1) {
  console.info('usage: node generateKeyPair.js <privateKeyPath>');
} else {
  execFift(`new-key.fif ${args[0] || "./data/key"}`, console.log);
}


