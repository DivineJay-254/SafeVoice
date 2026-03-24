
import React, { useState, useEffect } from 'react';
import { EducationModule, QuizQuestion } from '../types';
import { BackendService } from '../services/mockBackend';
import { GeminiService } from '../services/geminiService';
import { ChevronRight, ArrowLeft, BookOpen, BrainCircuit, Loader2, Award, History, CheckCircle, Zap, Globe, ShieldCheck } from 'lucide-react';

export const EducationView: React.FC = () => {
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [testHistory, setTestHistory] = useState<{title: string, score: number, total: number, date: string}[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'progress'>('modules');

  useEffect(() => {
    BackendService.getEducationModules().then(setModules);
    const savedHistory = JSON.parse(localStorage.getItem('safevoice_quiz_history') || '[]');
    setTestHistory(savedHistory);
  }, []);

  const handleStartQuiz = async () => {
    if (!selectedModule) return;
    setLoadingQuiz(true);
    setQuizMode(true);
    const questions = await GeminiService.generateQuizForTopic(selectedModule.title);
    setQuizQuestions(questions);
    setLoadingQuiz(false);
  };

  const saveScore = (score: number, total: number) => {
    if (!selectedModule) return;
    const newEntry = {
        title: selectedModule.title,
        score,
        total,
        date: new Date().toISOString()
    };
    const updated = [newEntry, ...testHistory].slice(0, 10);
    setTestHistory(updated);
    localStorage.setItem('safevoice_quiz_history', JSON.stringify(updated));
  };

  if (selectedModule) {
    if (quizMode) {
      return (
        <QuizComponent 
          title={selectedModule.title}
          questions={quizQuestions} 
          loading={loadingQuiz}
          onBack={() => { setQuizMode(false); }}
          onComplete={saveScore}
        />
      );
    }

    return (
      <div className="p-4 pb-20 animate-slide-up bg-white dark:bg-gray-900 min-h-full">
        <button onClick={() => setSelectedModule(null)} className="flex items-center text-gray-500 mb-6 font-bold text-sm">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Center
        </button>
        
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6 overflow-hidden border border-gray-200 dark:border-gray-700">
           <img src={selectedModule.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{selectedModule.title}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-line leading-relaxed">
          {selectedModule.content}
        </div>

        <button onClick={handleStartQuiz} className="w-full bg-brand-600 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
          <BrainCircuit className="w-5 h-5" /> Test Your Knowledge
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">Education Hub</h1>
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
           <button onClick={() => setActiveSubTab('modules')} className={`px-3 py-1.5 rounded-md text-xs font-bold ${activeSubTab === 'modules' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-400'}`}>Modules</button>
           <button onClick={() => setActiveSubTab('progress')} className={`px-3 py-1.5 rounded-md text-xs font-bold ${activeSubTab === 'progress' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm' : 'text-gray-400'}`}>Progress</button>
        </div>
      </div>

      {activeSubTab === 'modules' ? (
          <div className="space-y-4">
            <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4 mb-2">
                <ShieldCheck className="w-12 h-12 opacity-50 flex-shrink-0" />
                <div>
                    <h3 className="font-bold">Inter-Agency Prevention</h3>
                    <p className="text-xs text-indigo-100 mt-1">How hospitals, police, and legal teams coordinate to keep you safe.</p>
                </div>
            </div>
            
            <div className="grid gap-4">
              {modules.map(mod => (
                <div key={mod.id} onClick={() => setSelectedModule(mod)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                    <img src={mod.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{mod.title}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{mod.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
      ) : (
          <div className="animate-fade-in">
             <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-800 mb-6 text-center">
                <Award className="w-12 h-12 text-brand-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold dark:text-white">Your Achievements</h2>
                <p className="text-sm text-gray-500 mt-1">Track your tests and mastered topics.</p>
             </div>

             <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" /> Test Tracking History
                </h3>
                {testHistory.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">No tests completed yet.</div>
                ) : (
                    testHistory.map((test, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold dark:text-white">{test.title}</p>
                                <p className="text-[10px] text-gray-400">{new Date(test.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-brand-600">{test.score} / {test.total}</div>
                                {test.score === test.total && <div className="text-[8px] bg-green-100 text-green-700 px-2 rounded font-black uppercase">Mastered</div>}
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
      )}
    </div>
  );
};

const QuizComponent: React.FC<{
  title: string;
  questions: QuizQuestion[];
  loading: boolean;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}> = ({ title, questions, loading, onBack, onComplete }) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (loading) return <div className="flex flex-col items-center justify-center h-full pt-40"><Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" /><p className="text-gray-500 font-bold">Generating Test...</p></div>;
  if (questions.length === 0) return <div className="p-10 text-center"><p>Connection error. Could not load test.</p><button onClick={onBack} className="mt-4 text-brand-600 font-bold">Back</button></div>;

  const handleAnswer = (qIdx: number, optIdx: number) => { if (submitted) return; const newAns = [...answers]; newAns[qIdx] = optIdx; setAnswers(newAns); };
  const calculateScore = () => { 
      const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0);
      onComplete(score, questions.length);
      setSubmitted(true); 
  };
  const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0);

  return (
    <div className="p-4 pb-20 animate-slide-up">
      <button onClick={onBack} className="flex items-center text-gray-500 mb-6 font-bold text-sm"><ArrowLeft className="w-5 h-5 mr-1" /> Exit Test</button>
      <h1 className="text-xl font-bold mb-6">Testing: {title}</h1>
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-sm mb-4 leading-relaxed">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, optIdx) => {
                let btnClass = "w-full p-4 rounded-xl text-left text-xs font-bold border transition-all ";
                if (submitted) {
                  if (optIdx === q.correctIndex) btnClass += "bg-green-100 border-green-500 text-green-800 ";
                  else if (answers[qIdx] === optIdx) btnClass += "bg-red-100 border-red-500 text-red-800 ";
                  else btnClass += "border-gray-100 opacity-40 ";
                } else {
                  if (answers[qIdx] === optIdx) btnClass += "bg-brand-50 border-brand-600 text-brand-700 scale-[1.02] ";
                  else btnClass += "border-gray-100 hover:bg-gray-50 ";
                }
                return <button key={optIdx} onClick={() => handleAnswer(qIdx, optIdx)} className={btnClass} disabled={submitted}>{opt}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button onClick={calculateScore} disabled={answers.length < questions.length} className="w-full mt-10 bg-brand-600 text-white p-5 rounded-2xl font-bold shadow-lg disabled:opacity-50 active:scale-95 transition-all">Submit Test</button>
      ) : (
        <div className="mt-10 p-6 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-center border-2 border-brand-200">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Final Score</p>
          <p className="text-4xl font-black text-brand-700 dark:text-brand-400">{score} / {questions.length}</p>
          <button onClick={onBack} className="mt-6 w-full bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 py-3 rounded-xl font-bold border border-brand-100">Finish</button>
        </div>
      )}
    </div>
  );
};
