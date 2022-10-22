import "dotenv/config";
import { Order } from "../utils.js";

const args = process.argv.slice(2);
if (!args || args.length <= 1) {
  console.info('usage: node sendTransaction.js <toAddress> <amountInTon> [<publicKey>] [<privateKeyPath>]');
} else {
  start(args[0], args[1], args[2], args[3]);
}

async function start(address, amount, signer, key = "./data/key") {
  let dataToSign = await sendJsonData("new-transaction", { address, amount, signer }).then((r) => r.json());
  console.log("new-transaction", dataToSign);

  let order = new Order(`${address}-${amount}`).restore(Buffer.from(dataToSign.boc.data));
  order.addSignature(key, dataToSign.index, async () => {
    const boc = order.export();
    console.log("addSignature", dataToSign.index, boc);
    let response = await sendJsonData("signed-data", { boc, address, amount, signer }).then((r) => r.json());
    console.log("signed-data", response);
    if (response.boc) {
      order = new Order(`${address}-${amount}`).restore(Buffer.from(response.boc.data));
      order.submitExternalMessage(key, dataToSign.index, Buffer.from(response.walletAddrBoc.data), async (r) => {
        console.log(r);
        order.delete();
      });
    }
  });
}

function sendJsonData(endpoint, data) {
  return fetch(process.env.SERVER_URI + endpoint, {
    body: JSON.stringify(data),
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
  });
}