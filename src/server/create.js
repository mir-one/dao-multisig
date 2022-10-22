import "dotenv/config";
import { createMultisig, getSignersSet } from "../utils.js";

const args = process.argv.slice(2);
if (!args || args.length != 1) {
  console.info('usage: node create.js <minSignatures k>');
} else {
  const signers = getSignersSet();
  if (process.env.N >= process.env.K && process.env.N == signers.size && process.env.K == args[0]) {
    createMultisig(args[0], console.log);
  } else {
    console.info("Wrong K and N values. Check .env, ./data/keys.pub and this fn argument");
  }
}

