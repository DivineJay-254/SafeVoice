import React, { useState, useEffect } from 'react';
import { EducationModule, QuizQuestion, OfficialDocumentReference, PocketCard } from '../types';
import { DatabaseService } from '../services/databaseService';
import { GeminiService } from '../services/geminiService';
import { 
  CURRICULUM_TRACKS, 
  OFFICIAL_GBV_DOCUMENTS, 
  POCKET_GUIDES, 
  FIELD_DILEMMAS, 
  COMPREHENSIVE_CURRICULUM_MODULES 
} from '../services/curriculumData';
import { 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  BrainCircuit, 
  Loader2, 
  Award, 
  History, 
  CheckCircle, 
  CheckCircle2,
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Clock, 
  AlertTriangle, 
  HeartPulse, 
  Scale, 
  GraduationCap, 
  Users, 
  Printer, 
  Check, 
  RotateCcw,
  BookMarked,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Lock,
  Eye,
  Info,
  Download,
  Share2,
  FileCheck
} from 'lucide-react';

export type ActiveTab = 'academy' | 'pocket' | 'documents' | 'dilemmas' | 'progress' | 'toolkit';

export type DialectCode = 'en' | 'sw' | 'tu' | 'so' | 'om' | 'din' | 'ar_juba';

export interface DialectInfo {
  code: DialectCode;
  label: string;
  nativeName: string;
  speechLang: string;
}

export const DIALECTS: DialectInfo[] = [
  { code: 'en', label: 'English', nativeName: 'English (Original)', speechLang: 'en-KE' },
  { code: 'sw', label: 'Kiswahili', nativeName: 'Kiswahili (East Africa)', speechLang: 'sw-KE' },
  { code: 'tu', label: 'Turkana', nativeName: 'Ng’aturkana (Kakuma)', speechLang: 'sw-KE' },
  { code: 'so', label: 'Somali', nativeName: 'Af-Soomaali (Horn of Africa)', speechLang: 'so-SO' },
  { code: 'om', label: 'Oromo', nativeName: 'Afaan Oromoo (Great Lakes)', speechLang: 'om-ET' },
  { code: 'din', label: 'Dinka', nativeName: 'Thuɔŋjäŋ (South Sudan)', speechLang: 'en-KE' },
  { code: 'ar_juba', label: 'Juba Arabic', nativeName: 'Arabi Juba (Equatoria)', speechLang: 'ar-SD' },
];

export const getDialectVoicePrompt = (moduleTitle: string, dialect: DialectCode): { summaryTitle: string; voiceScript: string } => {
  switch (dialect) {
    case 'sw':
      return {
        summaryTitle: 'Muhtasari wa Sauti (Kiswahili)',
        voiceScript: `Huu ni muhtasari wa somo la Juasafety Yako: ${moduleTitle}. Kumbuka: Vurugu za kijinsia au za nyumbani hazikubaliki kisheria. Iwapo umeshambuliwa au kuna jeraha, tafadhali fika kliniki ya IRC ndani ya masaa 72 kupokea kinga ya dharura ya PEP dhidi ya virusi vya UKIMWI. Unaweza kupiga simu bure kwa 1195 au 1517 kwa siri bila gharama yoyote.`
      };
    case 'tu':
      return {
        summaryTitle: 'Ekiwape Ng’aturkana (Turkana)',
        voiceScript: `Ekiwape a ngina nyo kotere Juasafety Yako: ${moduleTitle}. Ani kitiye a ngina nyo eya a nyakatubokot ko Kakuma, topotooki kliniki a IRC kotere PEP a ngirisae 72. Kingar a akolong 1195 ka 1517 eya eyiengit a nyipuraet.`
      };
    case 'so':
      return {
        summaryTitle: 'Dulmar Maqal (Af-Soomaali)',
        voiceScript: `Kani waa dulmar ku saabsan cutubka Juasafety Yako: ${moduleTitle}. Xadgudubka ku saleysan jinsiga waa wax aan la aqbali karin. Haddii aad la kulanto weerar ama qasbid, u tag xarunta IRC 72 saacadood gudahood si aad u hesho daawada PEP ee ka hortagga HIV. Wac bilaash 1195 ama 1517 si laguu caawiyo.`
      };
    case 'om':
      return {
        summaryTitle: 'Gabaabaa Sagalee (Afaan Oromoo)',
        voiceScript: `Kun gabaabaa barnoota Juasafety Yako: ${moduleTitle}. Miidhaan saalaa kamiyyuu yakka fi hin hayyamamu. Yoo miidhaan ga'e, sa'aatii 72 keessatti gara kilinika IRC deemaa qoricha PEP fudhadhaa. Bilbila bilisaa 1195 yookaan 1517 fayyadamaa.`
      };
    case 'din':
      return {
        summaryTitle: 'Tɔ̈ŋ në Thuɔŋjäŋ (Dinka)',
        voiceScript: `Kënë ee gɛ̈ɛ̈r de Juasafety Yako në biäk de: ${moduleTitle}. Kɔc cï tɔ̈ŋ GBV yök, lɔ baai de akïm IRC në thaa 72 kɔ̈u bï yïn yök wal de PEP bï gël tuany de HIV. Kɔ̈c ke lɔŋ ku kony de Kakuma akeye tɔ̈ në namba 1195 ku 1517.`
      };
    case 'ar_juba':
      return {
        summaryTitle: 'Kalam Soti (Arabi Juba)',
        voiceScript: `De kalam mukhtasar min Juasafety Yako fi: ${moduleTitle}. Mafish zol andu haq yaadi banat wala niswan. Kan fi zol darabik wala ezaak, amshi sari sari fi clinic ta IRC gabil saa 72 ashik dawa ta PEP ta himaya min HIV. Dugo nomra bita 1195 wala 1517 bil batan kede.`
      };
    default:
      return {
        summaryTitle: 'English Audio Narration',
        voiceScript: `Core summary for Juasafety Yako module: ${moduleTitle}. Gender-based violence is a violation of fundamental human rights. If sexual assault has occurred, seeking clinical care within the 72-hour golden window for HIV Post-Exposure Prophylaxis and emergency contraception is critical. Call toll-free 1195 or 1517 for confidential camp triage.`
      };
  }
};

export const EducationView: React.FC = () => {
  const [modules, setModules] = useState<EducationModule[]>(COMPREHENSIVE_CURRICULUM_MODULES);
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('academy');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('All Tracks');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  
  // Document filter
  const [docOrgFilter, setDocOrgFilter] = useState<string>('All');
  
  // Quiz & Audio
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState<DialectCode>('en');
  
  // Dilemma state
  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>(FIELD_DILEMMAS[0].id);
  const [dilemmaSelectedOption, setDilemmaSelectedOption] = useState<number | null>(null);

  // Progress & Certification
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [testHistory, setTestHistory] = useState<{ title: string; score: number; total: number; date: string }[]>([]);
  const [learnerName, setLearnerName] = useState<string>('');
  
  // Strict curriculum progression tracking: modules where the user has read all content and objectives
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [readSectionsCompleted, setReadSectionsCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    DatabaseService.getEducationModules().then((data) => {
      if (data && data.length > 0) {
        setModules(data);
      }
    });

    const savedCompleted = JSON.parse(localStorage.getItem('juasafety_completed_modules') || '[]');
    setCompletedModuleIds(savedCompleted);

    const savedHistory = JSON.parse(localStorage.getItem('juasafety_yako_quiz_history') || '[]');
    setTestHistory(savedHistory);

    const savedName = localStorage.getItem('juasafety_learner_name') || '';
    setLearnerName(savedName);

    const savedRead = JSON.parse(localStorage.getItem('juasafety_curriculum_read_sections') || '{}');
    setReadSectionsCompleted(savedRead);
  }, []);

  // When a module is selected, reset scroll state and check if already reviewed
  useEffect(() => {
    if (selectedModule) {
      setHasScrolledToEnd(Boolean(readSectionsCompleted[selectedModule.id]));
    }
  }, [selectedModule, readSectionsCompleted]);

  const markModuleAsRead = (moduleId: string) => {
    const updated = { ...readSectionsCompleted, [moduleId]: true };
    setReadSectionsCompleted(updated);
    localStorage.setItem('juasafety_curriculum_read_sections', JSON.stringify(updated));
    setHasScrolledToEnd(true);
  };

  const toggleModuleCompletion = (moduleId: string) => {
    // Enforce: User cannot mark completed if they haven't gone through the curricula
    const hasReadCurriculum = Boolean(readSectionsCompleted[moduleId] || hasScrolledToEnd);
    const hasPassedEvaluation = testHistory.some(
      (t) => (t.title === selectedModule?.title || modules.find(m => m.id === moduleId)?.title === t.title) && (t.score / (t.total || 1)) >= 0.5
    );

    if (!hasReadCurriculum && !completedModuleIds.includes(moduleId)) {
      alert('Curriculum Requirement: You must review all sections of this module before it can be marked as completed.');
      return;
    }

    let updated: string[];
    if (completedModuleIds.includes(moduleId)) {
      updated = completedModuleIds.filter((id) => id !== moduleId);
    } else {
      updated = [...completedModuleIds, moduleId];
    }
    setCompletedModuleIds(updated);
    localStorage.setItem('juasafety_completed_modules', JSON.stringify(updated));
  };

  const handleStartQuiz = async () => {
    if (!selectedModule) return;
    setLoadingQuiz(true);
    setQuizMode(true);

    if (selectedModule.quiz && selectedModule.quiz.length > 0) {
      setQuizQuestions(selectedModule.quiz);
      setLoadingQuiz(false);
    } else {
      const questions = await GeminiService.generateQuizForTopic(selectedModule.title);
      setQuizQuestions(questions);
      setLoadingQuiz(false);
    }
  };

  const handleSpeechToggle = (moduleTitle: string, defaultContent: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const prompt = getDialectVoicePrompt(moduleTitle, selectedDialect);
      const textToSpeak = selectedDialect === 'en' 
        ? `${moduleTitle}. ${defaultContent.slice(0, 1200)}` 
        : prompt.voiceScript;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const dialectInfo = DIALECTS.find(d => d.code === selectedDialect);
      if (dialectInfo?.speechLang) {
        utterance.lang = dialectInfo.speechLang;
      }
      utterance.rate = 0.92;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const saveScore = (score: number, total: number) => {
    if (!selectedModule) return;
    const newEntry = {
      title: selectedModule.title,
      score,
      total,
      date: new Date().toISOString()
    };
    const updated = [newEntry, ...testHistory].slice(0, 20);
    setTestHistory(updated);
    localStorage.setItem('juasafety_yako_quiz_history', JSON.stringify(updated));

    if (!completedModuleIds.includes(selectedModule.id)) {
      toggleModuleCompletion(selectedModule.id);
    }
  };

  const handleSaveLearnerName = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('juasafety_learner_name', learnerName);
  };

  // Filter modules
  const filteredModules = modules.filter((m) => {
    const matchesTrack = selectedTrack === 'All Tracks' || m.track === selectedTrack;
    const matchesLevel = selectedLevel === 'All' || m.level === selectedLevel;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.organizationSources?.some((org) => org.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesLevel && matchesSearch;
  });

  // Filter documents
  const filteredDocuments = OFFICIAL_GBV_DOCUMENTS.filter((doc) => {
    return docOrgFilter === 'All' || doc.organization === docOrgFilter;
  });

  // Detail View of a Module
  if (selectedModule) {
    if (quizMode) {
      return (
        <QuizComponent
          title={selectedModule.title}
          questions={quizQuestions}
          loading={loadingQuiz}
          onBack={() => setQuizMode(false)}
          onComplete={saveScore}
        />
      );
    }

    const isCompleted = completedModuleIds.includes(selectedModule.id);

    return (
      <div className="p-4 pb-28 animate-slide-up bg-white dark:bg-gray-900 min-h-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 dark:bg-gray-900/95 py-2 z-10 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => {
              if (isSpeaking && typeof window !== 'undefined') window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setSelectedModule(null);
            }}
            className="flex items-center text-brand-600 dark:text-brand-400 font-bold text-xs hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Curriculum
          </button>
          
          <div className="flex items-center gap-1.5">
            <select
              value={selectedDialect}
              onChange={(e) => {
                if (isSpeaking && typeof window !== 'undefined') window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setSelectedDialect(e.target.value as DialectCode);
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              {DIALECTS.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>

            <button
              onClick={() => handleSpeechToggle(selectedModule.title, selectedModule.content)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-sm ${
                isSpeaking
                  ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
              }`}
              title="Read module summary in selected dialect"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Audio Guide'}</span>
            </button>
          </div>
        </div>

        {/* Dialect Voiceover Translated Prompt Banner (For Low Literacy / ESL Learners) */}
        {selectedDialect !== 'en' && (
          <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                {getDialectVoicePrompt(selectedModule.title, selectedDialect).summaryTitle}
              </span>
              <span className="text-[9px] uppercase tracking-wider bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                Native Camp Voice
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 italic leading-relaxed">
              "{getDialectVoicePrompt(selectedModule.title, selectedDialect).voiceScript}"
            </p>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <img
            src={selectedModule.imageUrl}
            alt={selectedModule.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/src/assets/images/gbv_camp_protection_1791740538544.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-brand-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                {selectedModule.track}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {selectedModule.level}
              </span>
              <span className="text-gray-200 text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {selectedModule.estimatedMinutes} min read
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              {selectedModule.title}
            </h1>
          </div>
        </div>

        {/* Sources & Standards Citation Bar */}
        {selectedModule.organizationSources && selectedModule.organizationSources.length > 0 && (
          <div className="mb-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              Standard Source:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedModule.organizationSources.map((org, i) => (
                <span
                  key={i}
                  className="bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md font-bold text-[10px]"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {selectedModule.learningObjectives && selectedModule.learningObjectives.length > 0 && (
          <div className="mb-5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-brand-600" /> Competency Objectives
            </h3>
            <ul className="space-y-1.5">
              {selectedModule.learningObjectives.map((obj, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comprehensive Content */}
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 mb-6 text-sm leading-relaxed space-y-3 whitespace-pre-line">
          {selectedModule.content}
        </div>

        {/* Operational Protocols */}
        {selectedModule.protocols && selectedModule.protocols.length > 0 && (
          <div className="mb-6 space-y-3">
            {selectedModule.protocols.map((proto, pIdx) => (
              <div
                key={pIdx}
                className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 p-4 rounded-xl"
              >
                <h4 className="text-xs font-black uppercase text-teal-800 dark:text-teal-300 mb-2.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-600" />
                  {proto.title}
                </h4>
                <div className="space-y-1.5">
                  {proto.steps.map((st, sIdx) => (
                    <div key={sIdx} className="text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Takeaways */}
        {selectedModule.keyTakeaways && selectedModule.keyTakeaways.length > 0 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl">
            <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Core Field Takeaways
            </h4>
            <ul className="space-y-1">
              {selectedModule.keyTakeaways.map((takeaway, tIdx) => (
                <li key={tIdx} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Reference Documents */}
        {selectedModule.officialDocuments && selectedModule.officialDocuments.length > 0 && (
          <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" /> Official International Frameworks
            </h4>
            <div className="space-y-2">
              {selectedModule.officialDocuments.map((doc, dIdx) => (
                <div key={dIdx} className="text-xs bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="font-bold text-gray-900 dark:text-white">{doc.title}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {doc.publisher} ({doc.year})
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">{doc.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Curricula Completion Verification Checklist */}
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Curriculum Mastery Verification
            </h4>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              {isCompleted ? '100% Completed' : (hasScrolledToEnd ? 'Step 1 Passed' : 'In Progress')}
            </span>
          </div>

          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
            To uphold humanitarian protection integrity, learners must review the core curriculum and pass the evaluation before marking this module as completed.
          </p>

          <div className="space-y-2 pt-1">
            {/* Step 1: Read all module curriculum */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              hasScrolledToEnd
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <div className="flex items-center gap-2">
                {hasScrolledToEnd ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <span className="font-bold">Step 1: Read & Review Full Curriculum Content</span>
                  <p className="text-[10px] opacity-75">Read all operational protocols and legal standards.</p>
                </div>
              </div>
              {!hasScrolledToEnd ? (
                <button
                  onClick={() => markModuleAsRead(selectedModule.id)}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex-shrink-0 shadow-sm"
                >
                  Verify Read
                </button>
              ) : (
                <span className="text-[10px] font-black uppercase text-green-700 dark:text-green-300">Verified</span>
              )}
            </div>

            {/* Step 2: Pass Module Knowledge Exam */}
            {(() => {
              const bestScore = testHistory.find((t) => t.title === selectedModule.title);
              const hasPassed = bestScore && (bestScore.score / (bestScore.total || 1)) >= 0.5;
              return (
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  hasPassed
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {hasPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <BrainCircuit className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">Step 2: Pass Standardized Competency Exam</span>
                      <p className="text-[10px] opacity-75">
                        {bestScore ? `Latest score: ${bestScore.score}/${bestScore.total}` : 'Grounding exam citing UNHCR/WHO standards.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartQuiz}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex-shrink-0 shadow-sm"
                  >
                    {hasPassed ? 'Retake Exam' : 'Take Exam'}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Action Buttons: Mark Complete & Start Quiz */}
        <div className="space-y-3 pt-2">
          {(() => {
            const bestScore = testHistory.find((t) => t.title === selectedModule.title);
            const hasPassed = bestScore && (bestScore.score / (bestScore.total || 1)) >= 0.5;
            const canComplete = hasScrolledToEnd && hasPassed;

            return (
              <>
                <button
                  onClick={() => toggleModuleCompletion(selectedModule.id)}
                  disabled={!canComplete && !isCompleted}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800'
                      : canComplete
                      ? 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700 shadow-md active:scale-95'
                      : 'bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-80'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : canComplete ? (
                    <BookMarked className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                  <span>
                    {isCompleted
                      ? 'Module Mastered (Click to Unmark)'
                      : canComplete
                      ? 'Confirm & Mark Module as Completed'
                      : 'Complete Curricula Steps Above to Unlock'}
                  </span>
                </button>

                {!canComplete && !isCompleted && (
                  <p className="text-[10px] text-center text-amber-600 dark:text-amber-400 font-medium">
                    * Completion locked: Please read the module and take the competency exam first.
                  </p>
                )}

                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white p-3.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 text-xs active:scale-95 transition-transform"
                >
                  <BrainCircuit className="w-4 h-4" /> Take Knowledge & Competency Exam
                </button>
              </>
            );
          })()}
        </div>
      </div>
    );
  }

  // Calculate Progress
  const totalModulesCount = modules.length;
  const completedCount = completedModuleIds.length;
  const progressPercentage = Math.round((completedCount / (totalModulesCount || 1)) * 100);

  return (
    <div className="p-4 pb-28 animate-slide-up">
      {/* Top Header */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                GBV Protection Academy
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                UNHCR, DRC, IASC & WHO International Curricula
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-brand-600 dark:text-brand-400">
              {progressPercentage}% Mastered
            </span>
            <div className="w-20 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4 scroll-smooth">
        <button
          onClick={() => setActiveTab('academy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'academy'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curricula ({modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pocket')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'pocket'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Pocket Guides (6)</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'documents'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Official Documents (8)</span>
        </button>

        <button
          onClick={() => setActiveTab('dilemmas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'dilemmas'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Field Dilemmas (3)</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'progress'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certification & Records</span>
        </button>

        <button
          onClick={() => setActiveTab('toolkit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            activeTab === 'toolkit'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peer Mobilizer Toolkit</span>
        </button>
      </div>

      {/* TAB 1: CURRICULA MODULES */}
      {activeTab === 'academy' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, clinical guidelines, PSEA..."
                className="w-full bg-white dark:bg-gray-800 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-brand-500 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tracks Filter Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
              {CURRICULUM_TRACKS.map((trk) => (
                <button
                  key={trk}
                  onClick={() => setSelectedTrack(trk)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    selectedTrack === trk
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {trk}
                </button>
              ))}
            </div>
          </div>

          {/* Core Mandate Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block">
                  Survivor-Centered Standard
                </span>
                <h3 className="font-black text-sm">Inter-Agency Humanitarian Standard</h3>
                <p className="text-[11px] text-indigo-100 mt-1 leading-snug">
                  Curricula compiled from UNHCR DRC, WHO Clinical Guidelines, IASC 2015, and the Panzi Model.
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-white/40 flex-shrink-0" />
            </div>
          </div>

          {/* Module Cards List */}
          <div className="space-y-3">
            {filteredModules.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No curricula matching criteria</p>
                <p className="text-xs text-gray-400 mt-1">Try resetting the search or track filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTrack('All Tracks');
                  }}
                  className="mt-3 text-xs font-bold text-brand-600 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredModules.map((mod) => {
                const isCompleted = completedModuleIds.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3.5 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] group"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={mod.imageUrl} 
                        alt={mod.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/src/assets/images/gbv_camp_protection_1791740538544.jpg';
                        }}
                      />
                      {isCompleted && (
                        <div className="absolute top-1 left-1 bg-green-600 text-white rounded-full p-0.5 shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                          {mod.track}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                          • {mod.estimatedMinutes} min
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] font-black text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.2 rounded">
                            Mastered
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-tight">
                        {mod.description}
                      </p>
                      
                      {mod.organizationSources && (
                        <div className="flex items-center gap-1 mt-2">
                          {mod.organizationSources.slice(0, 3).map((org, idx) => (
                            <span key={idx} className="text-[8px] font-black uppercase text-gray-400 border border-gray-200 dark:border-gray-700 px-1 rounded">
                              {org}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-600 transition-colors flex-shrink-0 mt-3" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POCKET REFERENCE GUIDES */}
      {activeTab === 'pocket' && (
        <div className="space-y-4">
          <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                Field Quick Reference
              </span>
              <h3 className="font-black text-sm">Emergency Pocket Action Cards</h3>
              <p className="text-[11px] text-amber-100 mt-1">
                Action checklists for frontline responders, clinic escorts, and community allies.
              </p>
            </div>
            <AlertTriangle className="w-9 h-9 text-white/40 flex-shrink-0" />
          </div>

          <div className="space-y-4">
            {POCKET_GUIDES.map((card) => {
              const isCritical = card.urgency === 'critical';
              return (
                <div
                  key={card.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border transition-all ${
                    isCritical
                      ? 'border-red-200 dark:border-red-900/50 bg-gradient-to-br from-white to-red-50/20 dark:from-gray-800 dark:to-red-950/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                            isCritical
                              ? 'bg-red-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {card.urgency.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {card.organization}
                        </span>
                      </div>
                      <h3 className="font-black text-sm text-gray-900 dark:text-white">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 space-y-1.5 bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl">
                    {card.steps.map((step, idx) => (
                      <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 leading-snug flex items-start gap-1.5">
                        <span className="font-bold text-brand-600 flex-shrink-0">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5 rounded-xl">
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 leading-tight">
                      <span className="font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mr-1">
                        Golden Rule:
                      </span>
                      {card.goldenRule}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL DOCUMENTS REPOSITORY */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                Official Standards Library
              </span>
              <h3 className="font-black text-sm">International Policy & Clinical Archive</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Full humanitarian frameworks from UNHCR, WHO, IASC, DRC, and Panzi Foundation.
              </p>
            </div>
            <FileText className="w-9 h-9 text-white/40 flex-shrink-0" />
          </div>

          {/* Org Filter Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {['All', 'UNHCR', 'DRC', 'WHO', 'IASC', 'Panzi Foundation', 'UNFPA', 'Government of Kenya'].map((org) => (
              <button
                key={org}
                onClick={() => setDocOrgFilter(org)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                  docOrgFilter === org
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}
              >
                {org}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                        {doc.organization}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {doc.year} • {doc.category}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white leading-snug">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {doc.summary}
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-teal-600" /> Core Mandated Principles
                  </h4>
                  <ul className="space-y-1">
                    {doc.corePrinciples.map((prin, pIdx) => (
                      <li key={pIdx} className="text-[11px] text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{prin}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 p-3 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" /> Frontline Field Checklist
                  </h4>
                  <ul className="space-y-1">
                    {doc.fieldActionChecklist.map((act, aIdx) => (
                      <li key={aIdx} className="text-[11px] text-teal-950 dark:text-teal-200 flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/60 pt-2 italic">
                  Contextual Enforcement: {doc.relevanceToKakumaDRC}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FIELD DILEMMAS (PRACTICAL CASE SCENARIOS) */}
      {activeTab === 'dilemmas' && (
        <div className="space-y-4">
          <div className="bg-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                Applied Case Studies
              </span>
              <h3 className="font-black text-sm">Displacement Field Dilemmas</h3>
              <p className="text-[11px] text-teal-100 mt-1">
                Make critical decisions under real-world camp pressures and receive policy feedback.
              </p>
            </div>
            <HelpCircle className="w-9 h-9 text-white/40 flex-shrink-0" />
          </div>

          {/* Dilemma Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5">
            {FIELD_DILEMMAS.map((dilemma, idx) => (
              <button
                key={dilemma.id}
                onClick={() => {
                  setSelectedDilemmaId(dilemma.id);
                  setDilemmaSelectedOption(null);
                }}
                className={`p-2 rounded-xl text-[10px] font-black transition-all border text-center ${
                  selectedDilemmaId === dilemma.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}
              >
                Case #{idx + 1}
              </button>
            ))}
          </div>

          {/* Active Dilemma View */}
          {(() => {
            const activeDilemma = FIELD_DILEMMAS.find((d) => d.id === selectedDilemmaId) || FIELD_DILEMMAS[0];
            return (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
                    Scenario Analysis
                  </span>
                </div>

                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {activeDilemma.title}
                </h3>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-800">
                  {activeDilemma.narrative}
                </div>

                <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <CompassIcon className="w-4 h-4 text-teal-600" />
                  <span>{activeDilemma.dilemma}</span>
                </div>

                {/* Decision Options */}
                <div className="space-y-2.5 pt-1">
                  {activeDilemma.options.map((opt, optIdx) => {
                    const isSelected = dilemmaSelectedOption === optIdx;
                    let optionStyle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 ';
                    if (dilemmaSelectedOption !== null) {
                      if (opt.correct) {
                        optionStyle = 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200 ';
                      } else if (isSelected && !opt.correct) {
                        optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 ';
                      } else {
                        optionStyle = 'border-gray-200 dark:border-gray-800 opacity-50 ';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setDilemmaSelectedOption(optIdx)}
                        className={`w-full p-3.5 rounded-xl text-left text-xs font-bold border transition-all ${optionStyle}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>
                        </div>

                        {dilemmaSelectedOption !== null && (isSelected || opt.correct) && (
                          <div className={`mt-2.5 pt-2 border-t text-[11px] leading-relaxed ${
                            opt.correct ? 'border-green-300 text-green-800 dark:text-green-300' : 'border-red-300 text-red-800 dark:text-red-300'
                          }`}>
                            <strong>{opt.correct ? 'Standard Protocol: ' : 'Violates Protocol: '}</strong>
                            {opt.explanation}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {dilemmaSelectedOption !== null && (
                  <button
                    onClick={() => setDilemmaSelectedOption(null)}
                    className="w-full text-center text-xs text-gray-500 hover:text-brand-600 font-bold py-2 flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Decision
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: CERTIFICATION & RECORDS */}
      {activeTab === 'progress' && (
        <div className="space-y-5 animate-fade-in">
          {/* Certificate Generation Card */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Credential Verification
                </span>
                <Award className="w-8 h-8 text-white/50" />
              </div>
              <h2 className="text-lg font-black leading-tight">
                Certificate in Humanitarian GBV Response & Survivor Care
              </h2>
              <p className="text-xs text-amber-100 mt-1">
                Compliant with UNHCR DRC, IASC 2015, WHO CMR, and Kenyan Statutory Standards.
              </p>

              {/* Enter Name Form */}
              <form onSubmit={handleSaveLearnerName} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  placeholder="Enter your name for Certificate"
                  className="flex-1 px-3 py-2 text-xs rounded-xl text-gray-900 font-bold focus:outline-none placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold shadow hover:bg-black transition-colors"
                >
                  Save
                </button>
              </form>
            </div>
          </div>

          {/* Official Printable Certificate Mockup */}
          {learnerName.trim() && (
            (() => {
              const hasCompletedRequired = completedModuleIds.length >= Math.min(3, modules.length);
              if (!hasCompletedRequired) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-800 text-center space-y-2">
                    <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Certificate Locked ({completedModuleIds.length}/{Math.min(3, modules.length)} Required Modules Mastered)
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                      To qualify for the official Certificate of Completion, you must review the curricula and pass evaluations for at least 3 core modules.
                    </p>
                    <button
                      onClick={() => setActiveTab('academy')}
                      className="mt-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Continue Curricula
                    </button>
                  </div>
                );
              }

              return (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-4 border-double border-amber-300 dark:border-amber-700 shadow-md text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      JUASAFETY YAKO HUMANITARIAN ACADEMY
                    </span>
                    <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">
                      CERTIFICATE OF COMPLETION
                    </h3>
                    <p className="text-[11px] text-gray-400">This is officially presented to:</p>
                  </div>

                  <div className="text-xl font-black text-brand-700 dark:text-brand-400 underline decoration-amber-400 underline-offset-4">
                    {learnerName}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
                    For successfully demonstrating competency across International Standards of Gender-Based Violence (GBV) Prevention, the 72-Hour Clinical Window (PEP), PSEA Accountability, and the Panzi Survivor-Centered Model.
                  </p>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[9px] text-gray-400 px-2 font-mono">
                    <div>DATE: {new Date().toLocaleDateString()}</div>
                    <div>ID: JY-GBV-{Math.abs(learnerName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 883).toString(16).toUpperCase()}</div>
                    <div>STATUS: VERIFIED</div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print / Save Certificate
                  </button>
                </div>
              );
            })()
          )}

          {/* Test History Records */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4" /> Examination Performance Log
            </h3>
            {testHistory.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-400 text-xs">
                No exam logs yet. Complete a module quiz to record certification scores.
              </div>
            ) : (
              testHistory.map((test, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                      {test.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(test.date).toLocaleDateString()} at{' '}
                      {new Date(test.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-brand-600 dark:text-brand-400">
                      {test.score} / {test.total}
                    </div>
                    {test.score === test.total && (
                      <span className="text-[8px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-0.5 rounded font-black uppercase">
                        Mastered
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: COMMUNITY CHAMPION / PEER EDUCATOR TOOLKIT */}
      {activeTab === 'toolkit' && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Field Mobilizer Guidebook
                </span>
                <Users className="w-5 h-5 text-purple-200" />
              </div>
              <h2 className="text-xl font-black leading-tight">
                Peer Educator & Champion Toolkit
              </h2>
              <p className="text-xs text-purple-100 max-w-sm">
                Standardized lesson summaries, icebreakers, and guided discussion prompts for running refugee residential block circles in Kakuma 1–4 and Kalobeyei.
              </p>
              
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white text-purple-900 hover:bg-purple-50 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF Pack
                </button>
              </div>
            </div>
          </div>

          {/* Facilitator Gold Standards */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl text-xs space-y-2">
            <h3 className="font-black text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Facilitator "Do No Harm" Core Rules
            </h3>
            <ul className="space-y-1.5 text-amber-900/90 dark:text-amber-300/90 text-[11px]">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Absolute Confidentiality:</strong> Everything shared in the circle stays in the circle unless there is imminent danger to life or child abuse.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>No Forced Sharing:</strong> Never pressure a participant to disclose personal trauma or assault incidents during group discussions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Survivor-Centered Referrals:</strong> If someone approaches you privately, connect them immediately to IRC clinic triage or call toll-free 1195/1517.</span>
              </li>
            </ul>
          </div>

          {/* 5 Modular Discussion Guides */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
              5 Residential Discussion Circle Modules
            </h3>

            {/* Circle 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-full">
                    Discussion Circle 1 • 45 Mins
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    Deconstructing Power, Gender Roles & Consent
                  </h4>
                  <p className="text-xs text-gray-500">Target Group: Youth Champions & Residential Block Residents</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  🧊 Icebreaker Question:
                </p>
                <p className="text-gray-600 dark:text-gray-300 italic text-[11px]">
                  "When a decision is made in a household in our block, who holds the final voice, and what happens when someone disagrees?"
                </p>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  💬 3 Facilitation Questions:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <li>What is the difference between biological sex and socially enforced gender expectations?</li>
                  <li>How does power imbalance lead to harassment around water distribution points or firewood gathering?</li>
                  <li>What does clear, enthusiastic consent mean in intimate relationships?</li>
                </ol>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  🎯 Block Action Commitment:
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                  Participants agree on a neighborhood mutual watch to accompany women and girls during evening water fetching.
                </p>
              </div>
            </div>

            {/* Circle 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                    Discussion Circle 2 • 45 Mins
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    Emergency Clinical Care & The 72-Hour Golden Window
                  </h4>
                  <p className="text-xs text-gray-500">Target Group: Women Caretaker Groups & Community Elders</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  🧊 Myth-Busting Question:
                </p>
                <p className="text-gray-600 dark:text-gray-300 italic text-[11px]">
                  "If sexual violence occurs, why do some families advise waiting for customary elders before seeing a doctor? What is the life-threatening cost of waiting?"
                </p>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  💬 3 Facilitation Questions:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <li>What is Post-Exposure Prophylaxis (PEP) and how does it prevent HIV within 72 hours?</li>
                  <li>Why must survivors avoid bathing or washing clothes before clinical exam to preserve evidence?</li>
                  <li>Where is the nearest 24/7 IRC medical clinic triage in our camp zone?</li>
                </ol>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  🎯 Block Action Commitment:
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                  Every attendee saves toll-free helpline 1195 and 1517 on their mobile device or memorizes the numbers.
                </p>
              </div>
            </div>

            {/* Circle 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">
                    Discussion Circle 3 • 40 Mins
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    Psychological First Aid (PFA) & Overcoming Stigma
                  </h4>
                  <p className="text-xs text-gray-500">Target Group: Block Volunteers & Community Health Promoters</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  🧊 Empathy Prompt:
                </p>
                <p className="text-gray-600 dark:text-gray-300 italic text-[11px]">
                  "If your sister or neighbor disclosed an assault to you in secret, what words would make her feel safe versus blamed?"
                </p>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  💬 3 Facilitation Questions:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <li>How do we practice Look, Listen, Link without interrogating the survivor?</li>
                  <li>Why does victim-blaming silence survivors and protect perpetrators?</li>
                  <li>How do we combat camp rumors and maintain strict confidentiality?</li>
                </ol>
              </div>
            </div>

            {/* Circle 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
                    Discussion Circle 4 • 50 Mins
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    Ending FGM & Child Marriage under Kenyan & International Law
                  </h4>
                  <p className="text-xs text-gray-500">Target Group: Community Elders, Clan Leaders & Parents</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  ⚖️ Legal Reality Check:
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                  Under the Prohibition of FGM Act 2011 and Children Act 2022, cutting or child marriage carries severe prison sentences and fines. Traditional rites of passage can be celebrated without physical cutting.
                </p>

                <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
                  💬 3 Facilitation Questions:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <li>What are the severe lifelong medical harms of FGM (hemorrhage, fistula, childbirth complications)?</li>
                  <li>How can we separate cultural identity and values from harmful bodily mutilation?</li>
                  <li>How can block champions safely report child marriage plans to Childline 116?</li>
                </ol>
              </div>
            </div>

            {/* Circle 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                    Discussion Circle 5 • 40 Mins
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                    Safe Anonymous Reporting with Juasafety Yako
                  </h4>
                  <p className="text-xs text-gray-500">Target Group: All Residential Camp Residents</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-750 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  📱 Practical Demonstration:
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                  Show how anonymous tracking codes work, how offline reports sync when internet returns, and how to dial *384*1195# or call 1517 with zero airtime.
                </p>
              </div>
            </div>
          </div>

          {/* Printable Session Log Template */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Printable Mobilizer Session Log Sheet
              </h4>
              <button
                onClick={() => window.print()}
                className="text-[10px] font-black text-brand-600 uppercase hover:underline"
              >
                Print Sheet
              </button>
            </div>

            <div className="border border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-xl text-[10px] text-gray-500 space-y-2 font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>CAMP ZONE / BLOCK: ___________________</div>
                <div>DATE: ___________________</div>
                <div>FACILITATOR NAME: ___________________</div>
                <div>MODULE DISCUSSED: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]</div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div>TOTAL ATTENDEES: [ ___ Women ] [ ___ Men ] [ ___ Youth ]</div>
                <div className="mt-1">CONFIDENTIAL REFERRALS INITIATED: [ ___ Clinic ] [ ___ Protection Desk ]</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quiz Subcomponent with Official Guidelines Explanations
const QuizComponent: React.FC<{
  title: string;
  questions: QuizQuestion[];
  loading: boolean;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}> = ({ title, questions, loading, onBack, onComplete }) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-40 p-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-gray-700 dark:text-gray-300 font-bold text-sm">
          Generating Standardized Exam...
        </p>
        <p className="text-xs text-gray-400 mt-1">Grounding in UNHCR/WHO GBV guidelines</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
          No questions available for this module.
        </p>
        <button onClick={onBack} className="mt-4 text-brand-600 font-bold text-xs">
          Return to Curricula
        </button>
      </div>
    );
  }

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    const newAns = [...answers];
    newAns[qIdx] = optIdx;
    setAnswers(newAns);
  };

  const calculateScore = () => {
    const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0);
    onComplete(score, questions.length);
    setSubmitted(true);
  };

  const score = answers.reduce((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0);

  return (
    <div className="p-4 pb-28 animate-slide-up bg-white dark:bg-gray-900 min-h-full">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 dark:bg-gray-900/95 py-2 z-10 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 font-bold text-xs hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Exit Exam
        </button>
        <span className="text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          Standardized Evaluation
        </span>
      </div>

      <div className="mb-4">
        <h1 className="text-base font-black text-gray-900 dark:text-white leading-tight">
          Competency Evaluation: {title}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Answer all questions to qualify for curriculum mastery.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3"
          >
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                {qIdx + 1}
              </span>
              <h3 className="font-bold text-xs text-gray-900 dark:text-white leading-snug">
                {q.question}
              </h3>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                let btnClass = 'w-full p-3 rounded-xl text-left text-xs font-bold border transition-all ';
                if (submitted) {
                  if (optIdx === q.correctIndex) {
                    btnClass += 'bg-green-100 dark:bg-green-950/40 border-green-500 text-green-900 dark:text-green-200 ';
                  } else if (answers[qIdx] === optIdx) {
                    btnClass += 'bg-red-100 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 ';
                  } else {
                    btnClass += 'border-gray-100 dark:border-gray-800 opacity-40 ';
                  }
                } else {
                  if (answers[qIdx] === optIdx) {
                    btnClass += 'bg-brand-50 dark:bg-brand-950/40 border-brand-600 text-brand-700 dark:text-brand-300 shadow-sm ';
                  } else {
                    btnClass += 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 ';
                  }
                }
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswer(qIdx, optIdx)}
                    className={btnClass}
                    disabled={submitted}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] opacity-60">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="mt-2.5 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl text-[11px] text-indigo-950 dark:text-indigo-200 leading-relaxed">
                <span className="font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-0.5">
                  Guideline Citation:
                </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={calculateScore}
          disabled={answers.length < questions.length}
          className="w-full mt-6 bg-brand-600 text-white p-4 rounded-xl font-bold text-xs shadow-lg disabled:opacity-50 active:scale-95 transition-all"
        >
          Submit Evaluation ({answers.length}/{questions.length} answered)
        </button>
      ) : (
        <div className="mt-6 p-5 bg-brand-50 dark:bg-brand-950/30 rounded-2xl text-center border-2 border-brand-200 dark:border-brand-800 space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Evaluation Score
          </p>
          <p className="text-3xl font-black text-brand-700 dark:text-brand-400">
            {score} / {questions.length}
          </p>
          <p className="text-xs text-gray-500">
            {score === questions.length
              ? '★ Perfect Score! Mastery badge recorded.'
              : 'Completed. Review the guideline explanations above.'}
          </p>
          <button
            onClick={onBack}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-xs shadow hover:bg-brand-700 transition-colors"
          >
            Return to Academy
          </button>
        </div>
      )}
    </div>
  );
};

const CompassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
