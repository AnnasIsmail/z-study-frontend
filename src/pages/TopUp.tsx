import React, { useState } from 'react';
import { CreditCard, Wallet, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const TopUp: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, updateBalance } = useAuth();

  const topUpOptions = [
    { amount: 50000, bonus: 0, popular: false },
    { amount: 100000, bonus: 10000, popular: true },
    { amount: 250000, bonus: 35000, popular: false },
    { amount: 500000, bonus: 75000, popular: false },
  ];

  const handleTopUp = async () => {
    if (!selectedAmount) return;
    
    setLoading(true);
    
    // Simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bonusAmount = topUpOptions.find(option => option.amount === selectedAmount)?.bonus || 0;
    updateBalance(selectedAmount + bonusAmount);
    
    setLoading(false);
    alert(`Top up berhasil! Saldo Anda bertambah Rp ${(selectedAmount + bonusAmount).toLocaleString('id-ID')}`);
    setSelectedAmount(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Top Up Balance
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Tambah saldo untuk menggunakan fitur AI Premium
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Saldo Saat Ini
              </h2>
              <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Total Balance</p>
                <p className="text-3xl font-bold">
                  Rp {user?.balance.toLocaleString('id-ID')}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                Pilih Nominal Top Up
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topUpOptions.map((option) => (
                  <div
                    key={option.amount}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAmount === option.amount
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                    onClick={() => setSelectedAmount(option.amount)}
                  >
                    {option.popular && (
                      <div className="absolute -top-2 left-4 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-full">
                        Populer
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                          Rp {option.amount.toLocaleString('id-ID')}
                        </p>
                        {option.bonus > 0 && (
                          <p className="text-sm text-[var(--color-success)]">
                            + Bonus Rp {option.bonus.toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                      {selectedAmount === option.amount && (
                        <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                    {option.bonus > 0 && (
                      <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                        Total: Rp {(option.amount + option.bonus).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Ringkasan Pembayaran
              </h3>
              
              {selectedAmount ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Nominal Top Up</span>
                    <span className="text-[var(--color-text-primary)]">
                      Rp {selectedAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  {topUpOptions.find(option => option.amount === selectedAmount)?.bonus ? (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Bonus</span>
                      <span className="text-[var(--color-success)]">
                        + Rp {topUpOptions.find(option => option.amount === selectedAmount)?.bonus?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ) : null}
                  
                  <hr className="border-[var(--color-border)]" />
                  
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--color-text-primary)]">Total Saldo</span>
                    <span className="text-[var(--color-text-primary)]">
                      Rp {(selectedAmount + (topUpOptions.find(option => option.amount === selectedAmount)?.bonus || 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    icon={CreditCard}
                    loading={loading}
                    onClick={handleTopUp}
                  >
                    Bayar Sekarang
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--color-text-secondary)]">
                    Pilih nominal top up terlebih dahulu
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                  Metode Pembayaran
                </h4>
                <div className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <p>• Transfer Bank</p>
                  <p>• E-Wallet (GoPay, OVO, Dana)</p>
                  <p>• Virtual Account</p>
                  <p>• Kartu Kredit/Debit</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;