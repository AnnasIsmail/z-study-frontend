import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Code, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-background)]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6">
            AI Platform
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              Masa Depan
            </span>
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-3xl mx-auto">
            Rasakan kekuatan artificial intelligence dengan berbagai fitur canggih yang membantu produktivitas dan kreativitas Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" icon={ArrowRight}>
                Mulai Gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-[var(--color-text-primary)] mb-12">
          Fitur-fitur Unggulan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: 'Text Generation',
              description: 'AI untuk membuat konten berkualitas tinggi'
            },
            {
              icon: Sparkles,
              title: 'Mind Map',
              description: 'Visualisasi ide dengan AI cerdas'
            },
            {
              icon: Code,
              title: 'Code Assistant',
              description: 'Bantuan coding dengan AI'
            },
            {
              icon: FileText,
              title: 'Document Analysis',
              description: 'Analisis dokumen otomatis'
            }
          ].map((feature, index) => (
            <Card key={index} hover className="p-6 text-center">
              <feature.icon className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Text Generation',
      description: 'Generate artikel, blog, dan konten berkualitas tinggi',
      color: 'from-purple-500 to-pink-500',
      credits: 10
    },
    {
      icon: Sparkles,
      title: 'Mind Map Generator',
      description: 'Buat mind map visual dari ide atau topik apapun',
      color: 'from-blue-500 to-cyan-500',
      credits: 15
    },
    {
      icon: Code,
      title: 'Code Assistant',
      description: 'Bantuan coding, debugging, dan optimasi kode',
      color: 'from-green-500 to-emerald-500',
      credits: 20
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Analisis dan ringkas dokumen PDF, Word, dan lainnya',
      color: 'from-orange-500 to-red-500',
      credits: 25
    },
    {
      icon: Brain,
      title: 'Image Generator',
      description: 'Buat gambar AI dari deskripsi teks',
      color: 'from-violet-500 to-purple-500',
      credits: 30
    },
    {
      icon: Sparkles,
      title: 'Voice Assistant',
      description: 'Asisten suara AI untuk berbagai keperluan',
      color: 'from-teal-500 to-blue-500',
      credits: 35
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Pilih fitur AI yang ingin Anda gunakan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover className="p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-xs px-2 py-1 rounded-full">
                  {feature.credits} credits
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {feature.description}
              </p>
              <Button className="w-full" size="sm">
                Gunakan Sekarang
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;