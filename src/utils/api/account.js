import Lisk from 'oxy-nano-js';
import { requestToActivePeer } from './peers';
import { dposOffline } from 'dpos-offline';
import { loadingStarted, loadingFinished } from '../loading';

export const getAccount = (activePeer, address) =>
  new Promise((resolve, reject) => {
    activePeer.getAccount(address, (data) => {
      if (data.success) {
        resolve(data.account);
      } else if (!data.success && data.error === 'Account not found') {
        // when the account has no transactions yet (therefore is not saved on the blockchain)
        // this endpoint returns { success: false }
        resolve({
          address,
          balance: 0,
        });
      } else {
        reject(data);
      }
    });
  });

export const setSecondPassphrase = (activePeer, secondSecret, publicKey, secret) => {
  const wallet = new dposOffline.wallets.LiskLikeWallet(secret, 'X');
  const secondPublicKey = secondSecret === null ? undefined : new dposOffline.wallets.LiskLikeWallet(secondSecret, 'X').publicKey;
  if (typeof(secondPublicKey) !== 'undefined') {
    return Promise.reject(new Error('Error no pubkey for secondary passphrase'))
  }
  const tx = new dposOffline.transactions.CreateSignatureTx({
    signature: { publicKey },
  });
  const txOBJ = tx
    .set('amount', 0)
    .set('recipientId', recipientId)
    .set('fee', 10000000)
    .sign(wallet, secondPrivKey);

  loadingStarted('signatures');
  return activePeer.buildTransport()
    .postTransaction(txOBJ)
    .then((data) => {
      loadingFinished('signatures');
      return data;
    })
    .catch((err) => {
      loadingFinished('signatures');
      return Promise.reject(err);
    });
}
  requestToActivePeer(activePeer, 'signatures', { secondSecret, publicKey, secret });

export const send = (activePeer, recipientId, amount, secret, secondSecret = null) => {
  const tx = new dposOffline.transactions.SendTx();
  const wallet = new dposOffline.wallets.LiskLikeWallet(secret, 'X');
  const secondPrivKey = secondSecret === null ? undefined: new dposOffline.wallets.LiskLikeWallet(secondSecret, 'X').privKey;
  const txOBJ = tx
    .set('amount', amount)
    .set('recipientId', recipientId)
    .set('fee', 10000000)
    .sign(wallet, secondPrivKey);

  loadingStarted('transactions');
  return activePeer.buildTransport()
    .postTransaction(txOBJ)
    .then((data) => {
      loadingFinished('transactions');
      return data;
    })
    .catch((err) => {
      loadingFinished('transactions');
      return Promise.reject(err);
    });
};


export const transactions = (activePeer, address, limit = 20, offset = 0, orderBy = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'transactions', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    orderBy,
  });

export const unconfirmedTransactions = (activePeer, address, limit = 20, offset = 0, orderBy = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'transactions/unconfirmed', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    orderBy,
  });

export const extractPublicKey = passphrase => new dposOffline
  .wallets
  .LiskLikeWallet(passphrase, 'X')
  .publicKey;

/**
 * @param {String} data - passphrase or public key
 */
export const extractAddress = (data) => {
  if (data.indexOf(' ') < 0) {
    return Lisk.crypto.getAddress(data);
  }
  const { publicKey } = Lisk.crypto.getKeys(data);
  return Lisk.crypto.getAddress(publicKey);
};
