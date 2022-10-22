import "dotenv/config";
import { exec } from "child_process";
import fs from "fs";
import TonWeb from "TonWeb";

const exportFiftpath = `export FIFTPATH=${process.env.FIFTPATH};`;

function execFift(command, callback) {
  const x = exec(
    `${exportFiftpath} fift -s ${command}`,
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(error, stderr);
        return;
      }
      callback(stdout);
    });
  x.stdout.pipe(process.stdout);
}

const deployBoc = (data) => {
  return fetch(process.env.TON_BOC_ENDPOINT, {
    body: JSON.stringify({ boc: TonWeb.utils.bytesToBase64(data) + "", }),
    headers: { Accept: "application/json", "Content-Type": "application/json", },
    method: "POST",
  });
}

const createMultisig = (k = 2, callbackFn) => {
  execFift(`new-multisig.fif 0 0 new_wallet ${k} ./data/keys.pub`, callbackFn);
}

const deployMultisig = (callbackFn) => {
  const walletBoc = fs.readFileSync("./new_wallet.boc");
  deployBoc(walletBoc).then(async e => callbackFn(await e.json()));
}

const getSignersSet = () => {
  return new Set(fs.readFileSync("./data/keys.pub").toString().replace(/(^[ \t]*\n)/gm, "").split(/\r\n|\r|\n/).filter(n => n));
}

class Order {
  constructor(filePrefix) {
    this.filePrefix = filePrefix;
  }

  create(toAddress, amountInTon, callbackFn) {
    execFift(
      `create-msg.fif ${toAddress} ${amountInTon} ${this.filePrefix}msg`,
      () => execFift(`create-order.fif 0 ${this.filePrefix}msg -o ${this.filePrefix}order`, callbackFn)
    );
  }

  addSignature(key = "keys0", keyIndex = 0, callbackFn) {
    execFift(`add-signature.fif ${key} ${keyIndex} -i ${this.filePrefix}order -o ${this.filePrefix}order`, callbackFn);
  }

  submitExternalMessage(key = "keys0", keyIndex = 0, walletAddrBoc, callbackFn) {
    fs.writeFileSync("new_wallet.addr", walletAddrBoc);
    execFift(
      `create-external-message.fif new_wallet ${key} ${keyIndex} -i ${this.filePrefix}order -o ${this.filePrefix}tx`,
      () => {
        const orderBoc = fs.readFileSync(`${this.filePrefix}tx`);
        deployBoc(orderBoc).then(async e => callbackFn(await e.json()));
      }
    );
  }

  getWalletBoc() {
    return fs.readFileSync("./new_wallet.boc");
  }

  getWalletAddrBoc() {
    return fs.readFileSync("./new_wallet.addr");
  }

  restore(boc) {
    fs.writeFileSync(`${this.filePrefix}order.boc`, boc);
    return this;
  }

  exists() {
    return fs.existsSync(`${this.filePrefix}order.boc`);
  }

  export() {
    if (fs.existsSync(`${this.filePrefix}order.boc`)) {
      return fs.readFileSync(`${this.filePrefix}order.boc`);
    } else {
      return false;
    }
  }

  delete() {
    fs.unlinkSync(`${this.filePrefix}order.boc`);
  }
}

export { execFift, deployBoc, createMultisig, deployMultisig, Order, getSignersSet}