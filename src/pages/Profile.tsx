import React, { useState } from 'react';
import { User, Wallet, History, Calendar, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'topup' | 'usage'>('profile');
  const { user } = useAuth();

  const topupHistory = [
    { id: 1, date: '2024-01-15', amount: 100000, bonus: 10000, method: 'Transfer Bank', status: 'success' },
    { id: 2, date: '2024-01-10', amount: 50000, bonus: 0, method: 'GoPay', status: 'success' },
    { id: 3, date: '2024-01-05', amount: 250000, bonus: 35000, method: 'Virtual Account', status: 'success' },
  ];

  const usageHistory = [
    { id: 1, date: '2024-01-16', feature: 'Text Generation', credits: 10, description: 'Generated blog article' },
    { id: 2, date: '2024-01-16', feature: 'Code Assistant', credits: 20, description: 'JavaScript debugging help' },
    { id: 3, date: '2024-01-15', feature: 'Mind Map', credits: 15, description: 'Created project planning map' },
    { id: 4, date: '2024-01-15', feature: 'Document Analysis', credits: 25, description: 'Analyzed PDF report' },
    { id: 5, date: '2024-01-14', feature: 'Image Generator', credits: 30, description: 'Generated marketing banner' },
  ];

  const totalSpent = topupHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalCreditsUsed = usageHistory.reduce((sum, item) => sum + item.credits, 0);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Profile
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Kelola profil dan lihat riwayat aktivitas Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {user?.fullName}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile Info
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'topup'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  }`}
                  onClick={() => setActiveTab('topup')}
                >
                  <Wallet className="w-4 h-4 inline mr-2" />
                  TopUp History
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'usage'
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  }`}
                  onClick={() => setActiveTab('usage')}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  Usage History
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                    Account Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Full Name
                      </label>
                      <p className="text-[var(--color-text-primary)] font-medium">
                        {user?.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Email
                      </label>
                      <p className="text-[var(--color-text-primary)] font-medium">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                    Balance Overview
                  </h2>
                  <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg p-6 text-white mb-6">
                    <p className="text-sm opacity-90">Current Balance</p>
                    <p className="text-3xl font-bold mb-2">
                      Rp {user?.balance.toLocaleString('id-ID')}
                    </p>
                    <Link to="/topup">
                      <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 border-0">
                        Top Up Balance
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg">
                      <TrendingUp className="w-8 h-8 text-[var(--color-success)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-text-secondary)]">Total Spent</p>
                      <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Rp {totalSpent.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg">
                      <History className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-text-secondary)]">Credits Used</p>
                      <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {totalCreditsUsed}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-[var(--color-surface)] rounded-lg">
                      <Calendar className="w-8 h-8 text-[var(--color-secondary)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-text-secondary)]">Member Since</p>
                      <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                        Jan 2024
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'topup' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    TopUp History
                  </h2>
                  <Link to="/topup">
                    <Button size="sm">New TopUp</Button>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-3 text-[var(--color-text-secondary)] font-medium">Date</th>
                        <th className="text-left py-3 text-[var(--color-text-secondary)] font-medium">Amount</th>
                        <th className="text-left py-3 text-[var(--color-text-secondary)] font-medium">Bonus</th>
                        <th className="text-left py-3 text-[var(--color-text-secondary)] font-medium">Method</th>
                        <th className="text-left py-3 text-[var(--color-text-secondary)] font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topupHistory.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--color-border)]">
                          <td className="py-3 text-[var(--color-text-primary)]">
                            {new Date(item.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 text-[var(--color-text-primary)] font-medium">
                            Rp {item.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 text-[var(--color-success)]">
                            {item.bonus > 0 ? `+Rp ${item.bonus.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-3 text-[var(--color-text-secondary)]">
                            {item.method}
                          </td>
                          <td className="py-3">
                            <span className="bg-[var(--color-success)]/10 text-[var(--color-success)] px-2 py-1 rounded-full text-xs">
                              Success
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'usage' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                  Usage History
                </h2>

                <div className="space-y-4">
                  {usageHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-[var(--color-text-primary)]">
                            {item.feature}
                          </h3>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {new Date(item.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                            -{item.credits} credits
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;