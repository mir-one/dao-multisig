import express from "express";
import { getSignersSet, Order } from "../utils.js";
import "dotenv/config";

const PORT = process.env.PORT || 8090;
const signers = getSignersSet();
const N = signers.size;
const K = process.env.K;
console.log({ N, K });

const signatureCount = {};

const app = express();
app.use(express.json());

app.post("/new-transaction", async (req, res) => {
  console.log("/new-transaction", req.body);
  const { address, amount, signer } = req.body;
  const signerIndex = [...signers].indexOf(signer);

  const order = new Order(`${address}-${amount}`);

  if (!order.exists()) {
    order.create(address, amount, () => {
      console.log("new order created");
      signatureCount[`${address}-${amount}`] = new Set();
      res.send({ boc: order.export(), index: signerIndex });
    });
  } else {
    console.log("found existing order");
    res.send({ boc: order.export(), index: signerIndex });
  }
});

app.post("/signed-data", async (req, res) => {
  console.log("/signed-data", req.body);
  const { boc, address, amount, signer } = req.body;
  const key = `${address}-${amount}`;

  const order = new Order(key).restore(Buffer.from(boc.data));

  signatureCount[key].add(signer);
  console.log(signatureCount);
  if (signatureCount[key].size == K) {
    res.send({ boc: order.export(), walletAddrBoc: order.getWalletAddrBoc() });
    return;
  }

  res.send({ response: `need ${K - signatureCount[key].size} more signatures` });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
