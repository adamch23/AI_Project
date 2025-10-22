import { useState } from 'react';
import { Sparkles, Brain, Code2, ArrowRight, Zap } from 'lucide-react';
import CVQuizGenerator from './components/CVQuizGenerator.jsx';
import CVChallengeGenerator from './components/CVChallengeGenerator.jsx';

type Page = 'home' | 'quiz' | 'challenges';

function LandingPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950 text-white">
      {/* Glowing Blobs Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-purple-600 opacity-30 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500 opacity-25 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-pink-500 opacity-30 blur-[120px] rounded-full animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <header className="sticky top-0 backdrop-blur-md bg-white/5 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              CVMaster
            </h1>
          </div>
          <p className="text-gray-300 hidden md:block">AI-Powered Interview Prep</p>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Transform Your CV Into{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-md">
            Interview Success
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
          Upload your CV and let AI generate personalized coding challenges or quizzes tailored to your skills.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Quiz Card */}
          <div
            onClick={() => onNavigate("quiz")}
            className="cursor-pointer bg-gradient-to-br from-purple-500/20 to-purple-700/10 hover:from-purple-500/30 hover:to-purple-700/20 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-md transition-all hover:scale-105"
          >
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quiz Generator</h3>
            <p className="text-gray-300 mb-4">
              Test your knowledge with AI-generated quiz questions tailored to your CV.
            </p>
            <span className="inline-flex items-center gap-2 text-purple-300 font-semibold">
              Start Now <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Challenge Card */}
          <div
            onClick={() => onNavigate("challenges")}
            className="cursor-pointer bg-gradient-to-br from-blue-500/20 to-blue-700/10 hover:from-blue-500/30 hover:to-blue-700/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-md transition-all hover:scale-105"
          >
            <Code2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Challenge Generator</h3>
            <p className="text-gray-300 mb-4">
              Get coding challenges matched to your tech stack and experience level.
            </p>
            <span className="inline-flex items-center gap-2 text-blue-300 font-semibold">
              Start Now <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <Sparkles className="w-6 h-6 text-purple-400 mb-3" />
            <h4 className="font-semibold text-lg mb-2">AI-Powered</h4>
            <p className="text-gray-400 text-sm">
              Our advanced AI analyzes your CV to generate context-aware questions.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <Zap className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="font-semibold text-lg mb-2">Instant Results</h4>
            <p className="text-gray-400 text-sm">
              Receive customized coding challenges in seconds.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <Brain className="w-6 h-6 text-pink-400 mb-3" />
            <h4 className="font-semibold text-lg mb-2">Skill Matching</h4>
            <p className="text-gray-400 text-sm">
              Challenges perfectly tailored to your tech stack and level.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-white/5 mt-20 backdrop-blur-md py-6 text-center text-gray-400">
        Built with ❤️ & AI • CVMaster v1.0
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}


export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: Page): void => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleBack = (): void => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  if (currentPage === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
          <button onClick={handleBack} className="fixed top-6 left-6 z-50 px-6 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg transition font-semibold">
            ← Back
          </button>
          <CVQuizGenerator />
        </div>
  <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          `}</style>
      </div>
    );
  }

  if (currentPage === 'challenges') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
          <button onClick={handleBack} className="fixed top-6 left-6 z-50 px-6 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg transition font-semibold">
            ← Back
          </button>
          <CVChallengeGenerator />
        </div>
  <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          `}</style>
      </div>
    );
  }

  return <LandingPage onNavigate={handleNavigate} />;
}