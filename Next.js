// app/page.tsx - Ana Sayfa
"use client";

import React, { useState, useEffect } from "react";
import freighterApi from "@stellar/freighter-api";
import { Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE } from "@stellar/stellar-sdk";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

export default function HomePage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
  const [redeemAmount, setRedeemAmount] = useState<number>(50);

  // Cüzdan bağlantısını kontrol et
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
          await getBalance(address);
        }
      } catch (error) {
        console.error("Cüzdan kontrolü hatası:", error);
      }
    };

    checkWallet();
  }, []);

  // Cüzdanı bağla
  const connectWallet = async () => {
    try {
      setLoading(true);
      await freighterApi.setAllowed();
      const { address } = await freighterApi.getAddress();
      setPublicKey(address);
      await getBalance(address);
    } catch (error) {
      console.error("Cüzdan bağlantı hatası:", error);
      alert("Cüzdan bağlantısında hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // Bakiye sorgula
  const getBalance = async (address: string) => {
    try {
      const server = new SorobanRpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const tx = new TransactionBuilder(await server.getAccount(address), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("balance", address))
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      if (result.result) {
        setBalance(Number(result.result.retval));
      }
    } catch (error) {
      console.error("Bakiye sorgulama hatası:", error);
    }
  };

  // Alışveriş yap ve puan kazan
  const makePurchase = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const server = new SorobanRpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const tx = new TransactionBuilder(await server.getAccount(publicKey), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("earn_points", publicKey, purchaseAmount))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const signedTx = await freighterApi.signTransaction(preparedTx.toXDR(), {
        network: NETWORK_PASSPHRASE,
        accountToSign: publicKey,
      });

      const result = await server.sendTransaction(signedTx);
      console.log("İşlem başarılı:", result);
      
      await getBalance(publicKey);
      alert(`${purchaseAmount} TL alışveriş yaptınız! ${Math.floor(purchaseAmount / 10)} puan kazandınız.`);
    } catch (error) {
      console.error("Alışveriş hatası:", error);
      alert("Alışveriş işleminde hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // Puan kullan
  const redeemPoints = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const server = new SorobanRpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const tx = new TransactionBuilder(await server.getAccount(publicKey), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("redeem_points", publicKey, redeemAmount))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const signedTx = await freighterApi.signTransaction(preparedTx.toXDR(), {
        network: NETWORK_PASSPHRASE,
        accountToSign: publicKey,
      });

      const result = await server.sendTransaction(signedTx);
      console.log("Kullanım başarılı:", result);
      
      await getBalance(publicKey);
      alert(`${redeemAmount} puan başarıyla kullanıldı!`);
    } catch (error) {
      console.error("Puan kullanım hatası:", error);
      alert("Puan kullanımında hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🎁 Sadakat Programı
          </h1>
          <p className="text-xl text-gray-300">
            Stellar üzerinde modern sadakat sistemi
          </p>
        </header>

        {/* Cüzdan Bağlantısı */}
        <div className="max-w-4xl mx-auto">
          {!publicKey ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Başlamak için cüzdanınızı bağlayın
              </h2>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Bağlanıyor..." : "🔗 Freighter Cüzdanını Bağla"}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Kullanıcı Paneli */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">👤 Hesap Bilgileri</h3>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">Cüzdan Adresi:</p>
                  <p className="text-white font-mono text-xs break-all">{publicKey}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-center">
                  <p className="text-white font-semibold">Toplam Puanınız</p>
                  <p className="text-3xl font-bold text-white">{balance}</p>
                </div>
                <button
                  onClick={() => getBalance(publicKey)}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  🔄 Bakiyeyi Yenile
                </button>
              </div>

              {/* İşlemler Paneli */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🛒 İşlemler</h3>
                
                {/* Alışveriş */}
                <div className="mb-6">
                  <label className="block text-white mb-2">Alışveriş Tutarı (TL)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-purple-500 focus:outline-none"
                      placeholder="100"
                    />
                    <button
                      onClick={makePurchase}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      💰 Alışveriş Yap
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Her 10 TL için 1 puan kazanırsınız
                  </p>
                </div>

                {/* Puan Kullanımı */}
                <div>
                  <label className="block text-white mb-2">Kullanılacak Puan</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-purple-500 focus:outline-none"
                      placeholder="50"
                    />
                    <button
                      onClick={redeemPoints}
                      disabled={loading || balance < redeemAmount}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      🎁 Puan Kullan
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Puanlarınızı ödüllerle değiştirin
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Özellikler */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h4 className="text-xl font-bold text-white mb-2">Puan Kazan</h4>
            <p className="text-gray-300">Her alışverişte otomatik puan kazanın</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h4 className="text-xl font-bold text-white mb-2">Ödül Al</h4>
            <p className="text-gray-300">Puanlarınızı değerli ödüllerle değiştirin</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-xl font-bold text-white mb-2">Güvenli</h4>
            <p className="text-gray-300">Stellar blockchain güvencesi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/transfer/page.tsx - Puan Transfer Sayfası
"use client";

import React, { useState, useEffect } from "react";
import freighterApi from "@stellar/freighter-api";
import { Contract, SorobanRpc, TransactionBuilder, Networks, BASE_FEE } from "@stellar/stellar-sdk";
import Link from "next/link";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

export default function TransferPage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<number>(10);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
          await getBalance(address);
        }
      } catch (error) {
        console.error("Cüzdan kontrolü hatası:", error);
      }
    };

    checkWallet();
  }, []);

  const getBalance = async (address: string) => {
    try {
      const server = new SorobanRpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const tx = new TransactionBuilder(await server.getAccount(address), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("balance", address))
        .setTimeout(30)
        .build();

      const result = await server.simulateTransaction(tx);
      if (result.result) {
        setBalance(Number(result.result.retval));
      }
    } catch (error) {
      console.error("Bakiye sorgulama hatası:", error);
    }
  };

  const transferPoints = async () => {
    if (!publicKey || !recipientAddress) return;

    try {
      setLoading(true);
      const server = new SorobanRpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ADDRESS);
      
      const tx = new TransactionBuilder(await server.getAccount(publicKey), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("transfer", publicKey, recipientAddress, transferAmount))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const signedTx = await freighterApi.signTransaction(preparedTx.toXDR(), {
        network: NETWORK_PASSPHRASE,
        accountToSign: publicKey,
      });

      const result = await server.sendTransaction(signedTx);
      console.log("Transfer başarılı:", result);
      
      await getBalance(publicKey);
      alert(`${transferAmount} puan başarıyla transfer edildi!`);
      setRecipientAddress("");
    } catch (error) {
      console.error("Transfer hatası:", error);
      alert("Transfer işleminde hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link href="/" className="text-white hover:text-green-300 transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            💸 Puan Transfer
          </h1>
          <p className="text-xl text-gray-300">
            Puanlarınızı arkadaşlarınızla paylaşın
          </p>
        </header>

        {/* Transfer Form */}
        <div className="max-w-2xl mx-auto">
          {publicKey ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">💰 Mevcut Bakiyeniz</h3>
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">{balance} Puan</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Alıcı Cüzdan Adresi</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 text-white rounded-lg border border-white/30 focus:border-green-500 focus:outline-none"
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Transfer Edilecek Puan Miktarı</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/20 text-white rounded-lg border border-white/30 focus:border-green-500 focus:outline-none"
                    placeholder="10"
                    max={balance}
                  />
                </div>

                <button
                  onClick={transferPoints}
                  disabled={loading || !recipientAddress || transferAmount > balance || transferAmount <= 0}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? "Transfer Ediliyor..." : "💸 Puan Transfer Et"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Transfer için cüzdanınızı bağlayın
              </h2>
              <Link href="/" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                Ana Sayfaya Git
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// app/layout.tsx - Layout
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stellar Sadakat Programı',
  description: 'Stellar blockchain üzerinde modern sadakat programı',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
