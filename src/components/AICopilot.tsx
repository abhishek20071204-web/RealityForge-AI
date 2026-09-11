import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  User,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { SimulationScenario, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';
import { AIService } from '../services/aiService';

interface AICopilotProps {
  scenario: SimulationScenario;
  currentYear: number;
  currentStepData: TimeStepMetric;
  userOverrides: Record<string, number>;
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  scenario,
  currentYear,
  currentStepData,
  userOverrides,
  language,
}) => {
  const t = translations[language];

  const initialMessages: ChatMessage[] = [
    {
      id: 'm1',
      sender: 'copilot',
      text:
        language === 'ta'
          ? `வணக்கம்! நான் உங்கள் ரியாலிட்டிஃபோர்ஜ் AI முடிவு வழிகாட்டி (Copilot). தற்போது **${scenario.titleTa}** காட்சி மற்றும் **${currentYear}** ஆம் ஆண்டின் உருவகப்படுத்தப்பட்ட தரவுகளுடன் இணைக்கப்பட்டுள்ளேன். கீழே உள்ள பரிந்துரைக்கப்பட்ட கேள்விகளில் ஒன்றை கிளிக் செய்யலாம் அல்லது உங்கள் சொந்த கேள்வியை கேட்கலாம்.`
          : `Greetings. I am your RealityForge AI Decision Copilot, initialized with the telemetry of **${scenario.title}** at year **${currentYear}**. Ask me any causal inquiry, sensitivity diagnosis, or trade-off evaluation below.`,
      timestamp: 'Just now',
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    t.copilotQ1,
    t.copilotQ2,
    t.copilotQ3,
    t.copilotQ4,
    t.copilotQ5,
  ];

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const simulationContext = {
      scenarioTitle: scenario.title,
      currentYear,
      variables: currentStepData?.values || {},
      userOverrides,
      systemStress: currentStepData?.systemStress,
      riskLevel: currentStepData?.riskLevel,
    };

    try {
      const response = await AIService.askCopilot(questionText, simulationContext, language);
      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (e) {
      console.error('Copilot error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Bot className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 10: CONTEXTUAL AI DECISION COPILOT</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'AI முடிவு வழிகாட்டி (Decision Copilot)' : 'AI Decision Copilot & Reasoning Agent'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'காரணங்கள், மிக முக்கியமான மாறிகள் மற்றும் ஆபத்துகளைப் பற்றி இயல்பான மொழியில் விவாதியுங்கள்.'
              : 'Direct bidirectional dialogue with the underlying causal engine to synthesize policy insights.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-950 px-3 py-1.5 text-cyan-300">
            CONTEXT YEAR: {currentYear}
          </span>
          <button
            onClick={() => setMessages(initialMessages)}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white"
            title="Reset Chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Chat History Panel */}
        <div className="flex flex-col rounded-2xl border border-cyan-500/30 bg-[#060a19] p-5 shadow-2xl lg:col-span-8 h-[540px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'copilot' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950 text-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'border border-slate-800 bg-slate-900/80 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  <div
                    className={`mt-2 font-mono text-[9px] ${
                      m.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950 text-cyan-400">
                  <Bot className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="font-mono">Copilot is synthesizing causal vectors...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleFormSubmit} className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-1.5 focus-within:border-cyan-400">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'கேள்வி அல்லது பகுப்பாய்வு கோரிக்கையை உள்ளிடவும்...'
                    : 'Ask Copilot about simulation trade-offs, anomalies, or strategies...'
                }
                className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Inquiries Side Panel */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended Inquiries</span>
            </h3>

            <div className="mt-3 space-y-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="w-full text-left rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-cyan-950/20 hover:text-cyan-200"
                >
                  <p className="font-medium">{q}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Contextual Telemetry Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Context Telemetry
            </h4>
            <div className="mt-3 space-y-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Scenario:</span>
                <span className="font-bold truncate max-w-[180px]">{scenario.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temporal Horizon:</span>
                <span className="font-bold text-cyan-400">Year {currentYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">System Stress:</span>
                <span className="font-bold text-amber-400">{currentStepData?.systemStress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risk Assessment:</span>
                <span className="font-bold text-rose-400">{currentStepData?.riskLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
