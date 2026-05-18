import { useState, useEffect } from 'react';
import { useBalance } from '../context/BalanceContext';
import { Coins, ArrowDownLeft, ArrowUpRight, Copy, Check, AlertCircle, RefreshCw, Wallet as WalletIcon } from 'lucide-react';

const CRYPTO_ASSETS = [
  { 
    id: 'usdt', 
    name: 'Tether USD', 
    symbol: 'USDT', 
    network: 'TRON (TRC-20)',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 
    rate: 1.00, // 1 USDT = $1
    color: '#26a17b',
    qrData: 'https://chart.googleapis.com/chart?chs=150&cht=qr&chl=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&choe=UTF-8'
  },
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    network: 'Bitcoin Mainnet',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 
    rate: 65420.00, // 1 BTC = $65420
    color: '#f7931a',
    qrData: 'https://chart.googleapis.com/chart?chs=150&cht=qr&chl=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&choe=UTF-8'
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    network: 'Ethereum (ERC-20)',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 
    rate: 3450.00, // 1 ETH = $3450
    color: '#627eea',
    qrData: 'https://chart.googleapis.com/chart?chs=150&cht=qr&chl=0x71C7656EC7ab88b098defB751B7401B5f6d8976F&choe=UTF-8'
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOL', 
    network: 'Solana Mainnet',
    address: 'HN7cABvi4HM4AnWxcBf5NfG7cABvi4HM4AnWxcBf5NfG', 
    rate: 145.50, // 1 SOL = $145.50
    color: '#14f195',
    qrData: 'https://chart.googleapis.com/chart?chs=150&cht=qr&chl=HN7cABvi4HM4AnWxcBf5NfG7cABvi4HM4AnWxcBf5NfG&choe=UTF-8'
  }
];

export default function Wallet() {
  const { balance, updateBalance, transactions, addTransaction, updateTransactionStatus } = useBalance();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transactions'>('deposit');
  
  // Deposit States
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_ASSETS[0]);
  const [usdAmount, setUsdAmount] = useState<string>('20');
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Withdrawal States
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawCoins, setWithdrawCoins] = useState('');
  const [withdrawCrypto, setWithdrawCrypto] = useState(CRYPTO_ASSETS[0]);
  const [withdrawStatus, setWithdrawStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const coinRate = 5; // $1 = 5 Coins
  const coinsToReceive = (Number(usdAmount) || 0) * coinRate;
  const cryptoAmount = (Number(usdAmount) || 0) / selectedCrypto.rate;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    const amt = Number(usdAmount);
    if (!amt || amt <= 0) return;

    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationStep('Detecting transaction in the mempool...');

    // Phase 1: mempool detection
    setTimeout(() => {
      setSimulationProgress(35);
      setSimulationStep('Pending 1 confirmation on blockchain...');
      
      // Add transaction to history as pending
      addTransaction({
        type: 'deposit',
        crypto: selectedCrypto.symbol,
        cryptoAmount: cryptoAmount,
        usdAmount: amt,
        coinsAmount: coinsToReceive,
        status: 'pending',
        address: selectedCrypto.address
      });

      // Phase 2: Confirmation
      setTimeout(() => {
        setSimulationProgress(70);
        setSimulationStep('Updating your Hexbet account balances...');

        // Phase 3: Finalized
        setTimeout(() => {
          setSimulationProgress(100);
          setSimulationStep('Success! Funds credited to your account.');
          
          // Complete transaction
          updateBalance(coinsToReceive);
          
          // Find that pending transaction and complete it
          // In localstate we can find by matching the crypto amount
          // Let's call the context status updater
          // Since we need to update state, we can simulate updating the transaction status
          // The addTransaction generated its own ID, so we can find it in transactions list
          setIsSimulating(false);
          setUsdAmount('20');
        }, 1500);

      }, 2000);

    }, 2000);
  };

  // Whenever a new pending transaction is added, we automatically complete it after a delay
  useEffect(() => {
    const pending = transactions.find(t => t.status === 'pending');
    if (pending) {
      const timer = setTimeout(() => {
        updateTransactionStatus(pending.id, 'completed');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const coins = Number(withdrawCoins);
    if (!coins || coins <= 0) {
      setWithdrawStatus({ success: false, msg: 'Please enter a valid amount of Coins.' });
      return;
    }
    if (coins > balance) {
      setWithdrawStatus({ success: false, msg: 'Insufficient balance.' });
      return;
    }
    if (!withdrawAddress.trim() || withdrawAddress.length < 20) {
      setWithdrawStatus({ success: false, msg: 'Please enter a valid destination address.' });
      return;
    }

    const usdVal = coins / coinRate;
    const cryptVal = usdVal / withdrawCrypto.rate;

    updateBalance(-coins);
    addTransaction({
      type: 'withdrawal',
      crypto: withdrawCrypto.symbol,
      cryptoAmount: cryptVal,
      usdAmount: usdVal,
      coinsAmount: coins,
      status: 'pending',
      address: withdrawAddress
    });

    setWithdrawStatus({ 
      success: true, 
      msg: `Withdrawal of ${coins} Coins successfully requested! It will be processed shortly.` 
    });
    setWithdrawCoins('');
    setWithdrawAddress('');

    setTimeout(() => {
      setWithdrawStatus(null);
    }, 5000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold flex items-center gap-3">
              <WalletIcon className="w-10 h-10 text-primary" />
              Hexbet <span className="text-primary">Wallet</span>
            </h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Safe & Secured</span>
          </div>
          <p className="text-gray-400 mt-2">Manage your funds. Instant deposits & withdrawals at competitive rates.</p>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-primary/20 bg-card/20">
          <div className="p-2 rounded-lg bg-primary/10">
            <Coins className="w-6 h-6 text-warning" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Balance</div>
            <div className="text-xl font-mono font-bold text-white">{balance.toFixed(2)} COINS</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-surface rounded-2xl p-1.5 border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'deposit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'withdraw' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Withdraw
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" /> Transactions ({transactions.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Deposit Tab Content */}
        {activeTab === 'deposit' && (
          <>
            {/* Left Col: Deposit Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5 bg-card/10">
                <h3 className="text-2xl font-bold font-display">Deposit Cryptocurrency</h3>
                
                {/* Crypto Select Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Crypto Asset</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CRYPTO_ASSETS.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedCrypto(asset)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 relative overflow-hidden ${
                          selectedCrypto.id === asset.id 
                            ? 'border-primary bg-primary/5 text-white' 
                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                          style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                        >
                          {asset.symbol}
                        </div>
                        <div className="text-xs font-black">{asset.symbol}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-black">{asset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversion Rates */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-sm">
                  <div className="text-gray-400 font-bold">Exchange Rate</div>
                  <div className="font-mono text-white flex items-center gap-2">
                    <span className="text-primary font-black">$1.00 USD</span>
                    <span>=</span>
                    <span className="text-warning font-black">{coinRate} COINS</span>
                  </div>
                </div>

                {/* Deposit Address Box */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Send Funds to This Address</label>
                    <span className="text-[10px] bg-primary/20 text-primary font-black px-2 py-0.5 rounded uppercase tracking-wider">{selectedCrypto.network}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 bg-surface border border-white/10 rounded-xl p-4 font-mono text-sm font-bold text-white break-all flex items-center justify-between">
                      {selectedCrypto.address}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="p-4 bg-primary hover:bg-primary/95 text-white rounded-xl transition-all flex items-center justify-center active:scale-95 shrink-0"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Simulated Deposit Tool */}
                <div className="p-6 bg-warning/5 border border-warning/10 rounded-3xl space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black text-warning uppercase tracking-wide">Developer Sandbox Tools</h4>
                      <p className="text-xs text-gray-400 mt-1">Hexbet is currently operating in simulation mode. You can instantly simulate payments from an external crypto wallet using the simulation panel below.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Deposit Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          type="number"
                          value={usdAmount}
                          onChange={(e) => setUsdAmount(e.target.value)}
                          className="w-full bg-surface border border-white/10 rounded-xl p-3 pl-8 text-white font-mono font-bold outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Crediting To Account</div>
                      <div className="text-lg font-black text-warning font-mono bg-surface border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2">
                        <Coins className="w-5 h-5 text-warning" />
                        {coinsToReceive.toFixed(2)} COINS
                      </div>
                    </div>
                  </div>

                  {/* Simulate Progress Bar */}
                  {isSimulating && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-warning flex items-center gap-2 font-bold uppercase tracking-wider">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {simulationStep}
                        </span>
                        <span className="font-mono font-bold text-white">{simulationProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-warning to-orange-500 transition-all duration-500 rounded-full"
                          style={{ width: `${simulationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSimulateDeposit}
                    disabled={isSimulating || !usdAmount || Number(usdAmount) <= 0}
                    className="w-full py-4 bg-gradient-to-r from-warning to-orange-600 hover:scale-[1.01] active:scale-95 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50"
                  >
                    {isSimulating ? 'Processing Transaction...' : 'Simulate Payment'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: QR Code & Stats */}
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-3xl border-white/5 flex flex-col items-center text-center space-y-6 bg-card/10 h-full justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 opacity-70"></div>
                  <div className="relative bg-white p-4 rounded-3xl shadow-xl shadow-black/40">
                    {/* Generates placeholder premium QR code */}
                    <img 
                      src={selectedCrypto.qrData} 
                      alt="Wallet Address QR" 
                      className="w-40 h-40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-white">Scan Wallet QR Code</h4>
                  <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Scan this QR code from your mobile cryptocurrency wallet app to instantly prepare your transfer.</p>
                </div>

                <div className="w-full border-t border-white/5 pt-6 flex items-center justify-between text-left text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <div>
                    <div>Network</div>
                    <div className="text-white font-black mt-1">{selectedCrypto.network}</div>
                  </div>
                  <div className="text-right">
                    <div>Estimated Time</div>
                    <div className="text-white font-black mt-1">Instant (1-2 Min)</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Withdraw Tab Content */}
        {activeTab === 'withdraw' && (
          <div className="lg:col-span-3">
            <div className="glass-panel p-8 rounded-3xl border-white/5 bg-card/10 max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-display">Withdraw Coins</h3>
                <p className="text-sm text-gray-400 mt-1">Convert your Hexbet Coins back to cryptocurrency and transfer directly to your blockchain wallet.</p>
              </div>

              {withdrawStatus && (
                <div className={`p-4 rounded-xl text-center font-bold text-sm ${
                  withdrawStatus.success ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}>
                  {withdrawStatus.msg}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-6">
                
                {/* Crypto Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Crypto Asset</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CRYPTO_ASSETS.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setWithdrawCrypto(asset)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          withdrawCrypto.id === asset.id 
                            ? 'border-primary bg-primary/5 text-white' 
                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                          style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                        >
                          {asset.symbol}
                        </div>
                        <div className="text-xs font-black">{asset.symbol}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coin input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Amount of Coins to Withdraw</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Min. 50"
                        value={withdrawCoins}
                        onChange={(e) => setWithdrawCoins(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white font-mono font-bold outline-none focus:border-primary"
                      />
                      <button 
                        type="button"
                        onClick={() => setWithdrawCoins(balance.toFixed(2))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-primary uppercase"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="text-xs text-gray-500 font-bold uppercase mb-1">Value you will receive</div>
                    <div className="text-sm font-black text-success font-mono bg-surface border border-white/5 px-4 py-3.5 rounded-xl flex items-center justify-between">
                      <span>${(Number(withdrawCoins) / coinRate || 0).toFixed(2)} USD</span>
                      <span className="text-gray-500">
                        ≈ {((Number(withdrawCoins) / coinRate || 0) / withdrawCrypto.rate).toFixed(6)} {withdrawCrypto.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Destination Blockchain Address</label>
                  <input
                    type="text"
                    placeholder={`Enter your ${withdrawCrypto.network} address`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl p-4 font-mono text-sm font-bold text-white outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Please double check your network and destination address. Blockchain transactions are irreversible.</p>
                </div>

                <button
                  type="submit"
                  disabled={!withdrawCoins || !withdrawAddress || Number(withdrawCoins) > balance}
                  className="w-full py-4 btn-primary font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  Confirm Withdrawal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-3xl overflow-hidden border-white/5 bg-card/10">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold font-display flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" /> Transaction Ledger
                </h3>
                <span className="text-xs text-gray-500">{transactions.length} total operations</span>
              </div>
              
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 space-y-4">
                  <WalletIcon className="w-12 h-12 text-gray-600 mx-auto" />
                  <div>
                    <h4 className="font-bold text-white text-lg">No Transactions Yet</h4>
                    <p className="text-sm mt-1">Make your first deposit or withdrawal simulation to see transaction logs.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface/50 text-gray-400 text-[10px] font-black uppercase tracking-wider border-b border-white/5">
                        <th className="p-4">Tx ID</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">USD Value</th>
                        <th className="p-4">Blockchain Amount</th>
                        <th className="p-4">Coins Impact</th>
                        <th className="p-4">Address</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-gray-500 text-xs">{tx.id}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                              tx.type === 'deposit' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                            }`}>
                              {tx.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-white">${tx.usdAmount.toFixed(2)}</td>
                          <td className="p-4 font-mono text-gray-400">
                            {tx.cryptoAmount.toFixed(6)} {tx.crypto}
                          </td>
                          <td className="p-4 font-mono text-white">
                            <span className={tx.type === 'deposit' ? 'text-success' : 'text-primary'}>
                              {tx.type === 'deposit' ? '+' : '-'}{tx.coinsAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-gray-500 text-xs truncate max-w-[120px]" title={tx.address}>
                            {tx.address}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                              tx.status === 'completed' ? 'bg-success/15 border-success/30 text-success' :
                              tx.status === 'pending' ? 'bg-warning/15 border-warning/30 text-warning animate-pulse' :
                              'bg-danger/15 border-danger/30 text-danger'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-right text-gray-500 text-xs font-mono">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
