import React, { useState, useEffect } from 'react';
import { EducationModule, QuizQuestion } from '../types';
import { BackendService } from '../services/mockBackend';
import { GeminiService } from '../services/geminiService';
import { ChevronRight, ArrowLeft, BookOpen, BrainCircuit, Loader2 } from 'lucide-react';

export const EducationView: React.FC = () => {
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    BackendService.getEducationModules().then(setModules);
  }, []);

  const handleStartQuiz = async () => {
    if (!selectedModule) return;
    setLoadingQuiz(true);
    setQuizMode(true);
    const questions = await GeminiService.generateQuizForTopic(selectedModule.title);
    setQuizQuestions(questions);
    setLoadingQuiz(false);
    setQuizScore(null);
  };

  const handleBack = () => {
    if (quizMode) {
      setQuizMode(false);
      setQuizScore(null);
    } else {
      setSelectedModule(null);
    }
  };

  if (selectedModule) {
    if (quizMode) {
      return (
        <QuizComponent 
          title={selectedModule.title}
          questions={quizQuestions} 
          loading={loadingQuiz}
          onBack={handleBack}
        />
      );
    }

    return (
      <div className="p-4 pb-20 animate-slide-up bg-white dark:bg-gray-900 min-h-full">
        <button onClick={handleBack} className="flex items-center text-gray-500 mb-4 hover:text-brand-600">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
        
        <img 
          src={selectedModule.imageUrl} 
          alt={selectedModule.title} 
          className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md"
        />
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{selectedModule.title}</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-line">
          {selectedModule.content}
        </div>

        <button 
          onClick={handleStartQuiz}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <BrainCircuit className="w-5 h-5" />
          Take AI Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 animate-slide-up">
      <h1 className="text-2xl font-bold mb-6 text-brand-700 dark:text-brand-400">Education Center</h1>
      <div className="grid gap-4">
        {modules.map(mod => (
          <div 
            key={mod.id} 
            onClick={() => setSelectedModule(mod)}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                <img src={mod.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{mod.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{mod.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Sub-component for Quiz
const QuizComponent: React.FC<{
  title: string;
  questions: QuizQuestion[];
  loading: boolean;
  onBack: () => void;
}> = ({ title, questions, loading, onBack }) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-40">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-gray-500">Generating quiz with AI...</p>
      </div>
    );
  }

  if (questions.length === 0) {
      return (
        <div className="p-4 text-center">
            <p>Could not load quiz.</p>
            <button onClick={onBack} className="mt-4 text-brand-600">Go Back</button>
        </div>
      )
  }

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    const newAns = [...answers];
    newAns[qIndex] = optIndex;
    setAnswers(newAns);
  };

  const calculateScore = () => {
    setSubmitted(true);
  };

  const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0);

  return (
    <div className="p-4 pb-20 animate-slide-up">
      <button onClick={onBack} className="flex items-center text-gray-500 mb-4">
        <ArrowLeft className="w-5 h-5 mr-1" /> Exit Quiz
      </button>

      <h1 className="text-xl font-bold mb-2">Quiz: {title}</h1>
      <p className="text-sm text-gray-500 mb-6">Test your knowledge.</p>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">{q.question}</h3>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                let btnClass = "w-full p-3 rounded-lg text-left text-sm border transition-colors ";
                
                if (submitted) {
                  if (optIdx === q.correctIndex) btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-200 ";
                  else if (answers[qIdx] === optIdx) btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-200 ";
                  else btnClass += "border-gray-200 dark:border-gray-700 opacity-50 ";
                } else {
                  if (answers[qIdx] === optIdx) btnClass += "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 ";
                  else btnClass += "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ";
                }

                return (
                  <button 
                    key={optIdx}
                    onClick={() => handleAnswer(qIdx, optIdx)}
                    className={btnClass}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button 
          onClick={calculateScore}
          disabled={answers.length < questions.length}
          className="w-full mt-8 bg-brand-600 text-white p-4 rounded-xl font-bold disabled:opacity-50"
        >
          Submit Answers
        </button>
      ) : (
        <div className="mt-8 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-center">
          <p className="text-lg font-bold text-brand-800 dark:text-brand-200">
            You scored {score} / {questions.length}
          </p>
          <button onClick={onBack} className="mt-4 text-sm underline text-brand-600">
            Back to Modules
          </button>
        </div>
      )}
    </div>
  );
};
