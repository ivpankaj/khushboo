
import React, { useState, useEffect } from 'react';
import { AppState, FaqData } from './types';
import FloatingHearts from './components/FloatingHearts';
import BackgroundMusic from './components/BackgroundMusic';
import { Heart, Cat, Gift, Sparkles, Star, Send, PartyPopper, User, Calendar, Palette, Trophy, LocateFixed, Utensils, MapPin, Music, Plane, PenTool } from 'lucide-react';
import { generateRomanticMessage } from './services/geminiService';
import { initTracking, saveFaqResponse, trackEvent, trackPageView } from './services/trackingService';


// Helper for Fruit Icon since it's not in standard imports sometimes unless specific
const AppleIcon = ({ className }: { className?: string }) => <span className={`text-2xl ${className}`}>🍎</span>;

const questions: { id: keyof FaqData; label: string; type: string; placeholder: string; options?: string[]; emoji: string }[] = [
  { id: 'guessName', label: 'First up, what is my name?', type: 'text', placeholder: 'Type my name...', emoji: '🧑‍💻' },
  { id: 'guessAge', label: 'Meri age kya hai?', type: 'number', placeholder: 'Enter age...', options: ['20', '21', '22', '23', '24', '25'], emoji: '🎂' },
  { id: 'guessColor', label: 'Mera favorite color?', type: 'text', placeholder: 'Pick a color...', options: ['Blue', 'Black', 'Red', 'Pink', 'White'], emoji: '🎨' },
  { id: 'guessCricketer', label: 'Mera favorite cricketer?', type: 'text', placeholder: 'Name the legend...', options: ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Sachin Tendulkar'], emoji: '🏏' },
  { id: 'guessFruit', label: 'Mera favorite fruit?', type: 'text', placeholder: 'Pick a fruit...', options: ['Mango', 'Apple', 'Banana', 'Grapes'], emoji: '🍇' },
  { id: 'guessPerson', label: 'Mera favorite person?', type: 'text', placeholder: 'I think you know...', options: ['Mom', 'Dad', 'You <3', 'My Best Friend'], emoji: '💑' },
  { id: 'guessLocation', label: 'Mai kaha rehta hu?', type: 'text', placeholder: 'City name...', options: ["Delhi", "Noida", "Greater Noida", "Kushinagar", "Meerut"], emoji: '📍' },
  { id: 'guessDish', label: 'Mera favorite dish?', type: 'text', placeholder: 'Yummy...', options: ['Pizza', 'Momos', 'Burger', 'Pasta'], emoji: '🥟' },
  { id: 'guessCity', label: 'Mera favorite city?', type: 'text', placeholder: 'Divine place...', options: ['Delhi', 'Mumbai', 'Banaras', 'Goa'], emoji: '🏙️' },
  { id: 'guessFestival', label: 'Mera favorite festival?', type: 'text', placeholder: 'Colors or Lights?', options: ['Diwali', 'Holi', 'Eid', 'Christmas'], emoji: '🎆' },
  { id: 'guessDestination', label: 'Mai tere saath kaha jaana chahta hu?', type: 'text', placeholder: 'Dream place...', options: ['Paris', 'Goa', 'Mathura', 'Maldives'], emoji: '✈️' },
  { id: 'aboutMe', label: 'Finally, tell me something sweet about me', type: 'textarea', placeholder: 'Pour your heart out...', emoji: '✍️' }
];

const CORRECT_ANSWERS: Partial<FaqData> = {
  guessAge: '22',
  guessColor: 'Black',
  guessCricketer: 'Rohit Sharma',
  guessFruit: 'Grapes',
  guessPerson: 'You <3',
  guessLocation: 'Greater Noida',
  guessDish: 'Momos',
  guessCity: 'Banaras',
  guessFestival: 'Holi',
  guessDestination: 'Mathura',
};

import ResultPage from './components/ResultPage';

// Helper to get current path
const currentPath = window.location.pathname;

const App: React.FC = () => {
  // Simple Router Check
  if (currentPath === '/result') {
    return <ResultPage />;
  }

  const [gameState, setGameState] = useState<AppState>(AppState.INTRO);
  const [faqData, setFaqData] = useState<FaqData>({
    girlfriendName: 'Khushbooo',
    guessName: '',
    guessAge: '',
    guessColor: '',
    guessCricketer: '',
    guessFruit: '',
    guessPerson: '',
    guessLocation: '',
    guessDish: '',
    guessCity: '',
    guessFestival: '',
    guessDestination: '',
    aboutMe: '',
  });
  const [romanticPoem, setRomanticPoem] = useState('');
  const [score, setScore] = useState(0);
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesButtonStyle, setYesButtonStyle] = useState({ scale: 1 });
  const [suspenseText, setSuspenseText] = useState('Preparing something special...');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    initTracking();
  }, []);

  useEffect(() => {
    trackPageView(gameState);
  }, [gameState]);

  const isFaqValid = Boolean(
    faqData.guessName &&
    faqData.guessAge &&
    faqData.guessColor &&
    faqData.guessCricketer &&
    faqData.guessFruit &&
    faqData.guessPerson &&
    faqData.guessLocation
  );

  const updateFaq =
    (field: keyof FaqData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFaqData((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleFaqSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('button_click', { id: 'faq_submit' });

    await saveFaqResponse(faqData);

    Object.entries(faqData).forEach(([field, value]) => {
      if (field === 'girlfriendName') return;
      trackEvent('faq_answer', { field, value });
    });

    let calculatedScore = 0;
    let totalScorable = 0;

    Object.entries(CORRECT_ANSWERS).forEach(([key, correctValue]) => {
      totalScorable++;
      if (faqData[key as keyof FaqData]?.toString().toLowerCase() === correctValue.toLowerCase()) {
        calculatedScore++;
      }
    });

    const finalPercentage = Math.round((calculatedScore / totalScorable) * 100);
    setScore(finalPercentage);
    setGameState(AppState.SCORE);
  };

  const handleScoreContinue = () => {
    setGameState(AppState.SUSPENSE);
  };

  const handleStart = () => {
    trackEvent('button_click', { id: 'start_journey' });
    setGameState(AppState.FAQ);
  };

  useEffect(() => {
    if (gameState === AppState.SUSPENSE) {
      const texts = [
        "Checking the alignment of the stars... ✨",
        "Consulting the council of cute cats... 🐱",
        "Gathering all the love in the universe... 💖",
        "Almost there, my princess... 👸"
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < texts.length) {
          setSuspenseText(texts[i]);
          i++;
        }
      }, 1000);

      const timer = setTimeout(() => {
        setGameState(AppState.PROPOSAL);
      }, 4500);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [gameState]);

  const handlePropose = async () => {
    trackEvent('button_click', { id: 'proposal_yes' });
    trackEvent('proposal_accept');
    // Trigger confetti
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    setIsLoadingPoem(true);
    setGameState(AppState.SUCCESS);
    trackEvent('poem_requested', { data: faqData });
    const poem = await generateRomanticMessage(faqData);
    setRomanticPoem(poem);
    setIsLoadingPoem(false);
    trackEvent('poem_ready', { length: poem.length });
  };

  const moveNoButton = () => {
    const padding = 100;
    const x = Math.max(padding, Math.min(window.innerWidth - padding, Math.random() * window.innerWidth));
    const y = Math.max(padding, Math.min(window.innerHeight - padding, Math.random() * window.innerHeight));
    setNoButtonPos({ x, y });
    setYesButtonStyle(prev => ({ scale: Math.min(prev.scale + 0.15, 3) }));
    trackEvent('button_evade', { id: 'proposal_no', x, y });
  };

  const renderContent = () => {
    switch (gameState) {
      case AppState.INTRO:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 md:p-6 animate-in fade-in duration-1000 relative overflow-hidden">

            {/* Background Stickers (Decorations) */}
            <div className="absolute top-12 left-10 text-6xl animate-bounce delay-700 hidden md:block opacity-60 select-none pointer-events-none">🧸</div>
            <div className="absolute bottom-1/4 right-16 text-5xl animate-pulse delay-100 hidden md:block opacity-60 select-none pointer-events-none">💌</div>
            <div className="absolute top-1/3 left-20 text-4xl animate-ping delay-300 opacity-20 hidden md:block select-none pointer-events-none">💖</div>
            <div className="absolute bottom-10 left-12 text-5xl animate-bounce delay-500 hidden md:block opacity-60 select-none pointer-events-none">🧸</div>
            <div className="absolute top-20 right-20 text-5xl animate-float delay-200 hidden md:block opacity-50 select-none pointer-events-none">💕</div>

            <div className="glass p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white/40 max-w-xl w-full mx-auto transition-transform hover:scale-[1.01] duration-500 relative z-10">
              <div className="relative mb-6 inline-block">
                <div className="absolute -inset-6 bg-pink-200 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <img
                  src="/khushboo.jpg"
                  alt="My Beautiful Khushboo"
                  className="relative z-10 rounded-full border-8 border-white shadow-2xl animate-float w-40 h-40 md:w-64 md:h-64 object-cover"
                />

                {/* Image Stickers */}
                <div className="absolute -top-2 -right-2 bg-white p-2 md:p-3 rounded-full shadow-lg z-20 text-2xl md:text-3xl animate-bounce">🎀</div>
                <div className="absolute bottom-2 -left-4 bg-white/90 p-2 rounded-full shadow-lg z-20 text-xl md:text-2xl animate-pulse delay-75">🧸</div>
              </div>

              <h1 className="text-4xl md:text-7xl font-romantic text-pink-600 mb-4 md:mb-6 drop-shadow-md leading-tight">
                Hi, Khushbooo! <span className="inline-block animate-pulse">✨</span>
              </h1>

              {/* Love Component - Quote Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-6 md:mb-8 border-2 border-pink-200 transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-sm mx-auto max-w-sm">
                <p className="text-base md:text-lg text-pink-500 font-romantic font-bold italic">
                  "You are my favorite notification." 💌
                </p>
              </div>

              <p className="text-lg md:text-xl text-pink-600 mb-6 md:mb-8 font-medium leading-relaxed">
                I have a tiny surprise hidden for you... <br className="hidden md:block" />
                are you ready to unlock it? 🗝️
              </p>

              <button
                onClick={handleStart}
                className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-4 md:py-5 px-8 md:px-12 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg md:text-xl group mx-auto"
              >
                <span>Start My Secret Journey</span>
                <Heart className="fill-current group-hover:scale-125 transition-transform" size={24} />
              </button>

              {/* Extra cute comment */}
              <p className="mt-6 text-pink-400 text-sm font-semibold tracking-wide uppercase opacity-80">
                P.S. I love you more than pizza 🍕
              </p>
            </div>
          </div>
        );

      case AppState.FAQ:
        const currentQuestion = questions[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === questions.length - 1;

        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6">
            <div className="glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-2xl w-full max-w-lg border-2 border-white/50 relative overflow-hidden transition-all duration-500">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-pink-100">
                <div
                  className="h-full bg-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              <div className="absolute top-4 right-4 text-pink-300 font-bold text-sm">
                {currentQuestionIndex + 1} / {questions.length}
              </div>

              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div className="p-3 md:p-4 bg-pink-100/80 rounded-full text-2xl md:text-3xl shadow-sm shrink-0">
                    {currentQuestion.emoji}
                  </div>
                  <h2 className="text-xl md:text-2xl font-romantic font-bold text-pink-600 leading-tight">
                    {currentQuestion.label}
                  </h2>
                </div>
                <div className="text-3xl animate-bounce ml-2 shrink-0">🐱</div>
              </div>

              <div className="min-h-[200px] flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Input Field (if not just options) */}
                  {currentQuestion.type === 'textarea' ? (
                    <textarea
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-lg bg-white/50 min-h-[120px] resize-none"
                      value={faqData[currentQuestion.id] as string}
                      onChange={updateFaq(currentQuestion.id)}
                      autoFocus
                    />
                  ) : (
                    <input
                      type={currentQuestion.type}
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-lg bg-white/50"
                      value={faqData[currentQuestion.id] as string}
                      onChange={updateFaq(currentQuestion.id)}
                      autoFocus
                    />
                  )}

                  {/* Options Chips */}
                  {currentQuestion.options && (
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setFaqData(prev => ({ ...prev, [currentQuestion.id]: option }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${faqData[currentQuestion.id] === option
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-white text-pink-500 border border-pink-200 hover:bg-pink-50 hover:border-pink-300'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                  )}

                  {isLastQuestion ? (
                    <button
                      onClick={(e) => handleFaqSubmit(e as any)}
                      disabled={!faqData[currentQuestion.id]}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Finish & Submit <Send size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      disabled={!faqData[currentQuestion.id]}
                      className="flex-1 bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>


            </div>
          </div>
        );



      case AppState.SCORE:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in zoom-in duration-500 relative overflow-hidden">
            {/* Background Confetti */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 animate-bounce text-4xl">🎉</div>
              <div className="absolute top-20 right-20 animate-pulse text-4xl">✨</div>
              <div className="absolute bottom-10 left-10 animate-spin-slow text-4xl" style={{ animationDuration: '3s' }}>🌸</div>
              <div className="absolute bottom-20 right-10 animate-bounce text-4xl delay-300">🧸</div>
            </div>

            <div className="glass p-12 rounded-[3.5rem] shadow-2xl max-w-lg border-4 border-white/60 relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 p-5 rounded-full shadow-2xl border-4 border-pink-100 z-10 animate-bounce">
                {score === 100 ? '😻' : score >= 80 ? '💖' : '🧸'}
              </div>

              <h2 className="text-4xl md:text-5xl font-romantic text-pink-600 mb-2 mt-8 drop-shadow-sm">
                For My Khushbooo 🌹
              </h2>

              <div className="my-8 relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 to-rose-200 blur-xl opacity-50 animate-pulse rounded-full"></div>
                <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-pink-500 to-rose-400 bg-clip-text text-transparent relative z-10 font-romantic">
                  {score}%
                </div>
              </div>

              <div className="bg-pink-50/80 rounded-2xl p-6 mb-8 border border-pink-100">
                <p className="text-xl text-pink-600 font-medium leading-relaxed italic">
                  {score === 100 ? (
                    <>
                      "Correct! You know every beat of my heart! <br />
                      You are truly my soulmate! �"
                    </>
                  ) : score >= 80 ? (
                    <>
                      "So close! You know me better than anyone else! <br />
                      You are my favorite person! 💕"
                    </>
                  ) : (
                    <>
                      "You know me well, but I promise to spend <br />
                      forever helping you know me even better! 😽"
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={handleScoreContinue}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 text-xl flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10">Reveal My Surprise</span>
                <Sparkles size={24} className="animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        );

      case AppState.SUSPENSE:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-ping"></div>
              <Gift size={100} className="text-pink-500 mx-auto mb-10 relative z-10 animate-float" />
            </div>
            <h1 className="text-4xl md:text-5xl font-romantic text-pink-600 mb-6 transition-all duration-500">{suspenseText}</h1>
            <div className="flex gap-3 justify-center">
              <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        );

      case AppState.PROPOSAL:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden">
            <div className="glass p-12 rounded-[4rem] shadow-2xl max-w-2xl border-4 border-white/80 z-10 relative transform animate-in zoom-in duration-500">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="bg-white p-4 rounded-full shadow-2xl border-4 border-pink-200">
                  <Heart size={60} className="text-pink-500 fill-pink-500 animate-pulse" />
                </div>
              </div>

              <div className="mt-8 mb-8">
                <img src="/khushboo.jpg" alt="Romantic Cat" className="mx-auto rounded-[2rem] border-4 border-pink-100 shadow-xl w-64 h-64 object-cover" />
              </div>

              <h1 className="text-4xl md:text-6xl font-romantic text-pink-600 mb-8 leading-tight">
                {faqData.girlfriendName}, my everything... <br />
                <span className="text-5xl md:text-7xl text-pink-500 mt-4 block">Will you be my Valentine? 💍</span>
              </h1>

              <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-12 relative min-h-[100px]">
                <button
                  onClick={handlePropose}
                  style={{ transform: `scale(${yesButtonStyle.scale})` }}
                  className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-6 px-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90 text-2xl z-20 flex items-center gap-3"
                >
                  YES, I DO! <PartyPopper size={28} />
                </button>

                <button
                  onMouseEnter={moveNoButton}
                  onClick={moveNoButton}
                  style={{
                    position: noButtonPos.x ? 'fixed' : 'relative',
                    left: noButtonPos.x || 'auto',
                    top: noButtonPos.y || 'auto',
                    zIndex: 50
                  }}
                  className="bg-gray-100 text-gray-400 font-bold py-4 px-12 rounded-full shadow-md transition-all hover:bg-gray-200"
                >
                  No 😢
                </button>
              </div>
            </div>

            <div className="absolute top-20 left-20 text-6xl animate-float opacity-30">🎀</div>
            <div className="absolute bottom-20 right-20 text-6xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🐱</div>
            <div className="absolute top-40 right-40 text-6xl animate-float opacity-30" style={{ animationDelay: '0.8s' }}>🌸</div>
          </div>
        );

      case AppState.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in zoom-in duration-700 bg-gradient-to-b from-[#fff5f7] to-[#ffe4e6]">
            <div className="relative mb-10">
              <div className="absolute -inset-8 bg-pink-400/30 rounded-full blur-2xl animate-pulse"></div>
              <img src="/khushboo.jpg" alt="Happy Anniversary" className="relative z-10 rounded-full border-8 border-white shadow-2xl w-48 h-48 md:w-64 md:h-64 object-cover" />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-xl z-20 animate-bounce">😻</div>
            </div>

            <h1 className="text-6xl md:text-8xl font-romantic text-pink-600 mb-8 drop-shadow-lg">You made me the luckiest! ❤️</h1>

            <div className="glass p-10 rounded-[3rem] shadow-2xl max-w-2xl border-2 border-white/80 relative">
              <Sparkles className="absolute -top-6 -left-6 text-yellow-400 w-12 h-12" />
              <Sparkles className="absolute -bottom-6 -right-6 text-yellow-400 w-12 h-12" />

              <div className="text-2xl md:text-3xl text-pink-700 italic font-romantic leading-relaxed">
                {isLoadingPoem ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-sans text-lg not-italic">Writing our love story with Gemini... 🖋️</p>
                  </div>
                ) : (
                  romanticPoem.split('\n').map((line, i) => (
                    <p key={i} className="mb-3">{line}</p>
                  ))
                )}
              </div>
            </div>

            <p className="mt-12 text-pink-500 font-bold flex items-center gap-3 text-2xl">
              <Star className="fill-current text-yellow-400 animate-spin" />
              Always & Forever Together
              <Star className="fill-current text-yellow-400 animate-spin" />
            </p>

            <div className="mt-12 flex gap-6">
              <div className="p-5 bg-white rounded-3xl shadow-xl animate-bounce hover:scale-110 transition-transform text-3xl">🐱</div>
              <div className="p-5 bg-white rounded-3xl shadow-xl animate-bounce hover:scale-110 transition-transform text-3xl" style={{ animationDelay: '0.2s' }}>🧸</div>
              <div className="p-5 bg-white rounded-3xl shadow-xl animate-bounce hover:scale-110 transition-transform text-3xl" style={{ animationDelay: '0.4s' }}>🧁</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden">
      <BackgroundMusic />
      <FloatingHearts />
      <div className="relative z-10">
        {renderContent()}
      </div>

      <footer className="fixed bottom-6 left-0 right-0 text-center text-pink-400/60 font-medium text-sm pointer-events-none tracking-widest uppercase">
        Crafted with endless love 💖
      </footer>
    </div>
  );
};

export default App;


