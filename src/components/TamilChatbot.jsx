import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  X,
  AlertTriangle,
  User,
} from 'lucide-react';
import vaagaiFlower from '@/assets/vaagai-flower.png';

const TamilChatbot = ({ floating = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'வணக்கம்! I am Vaagai, your Sancharam travel companion for Tamil Nadu. Ask me anything about places, local food, culture, or safety tips in Tamil or English! (என்னிடம் தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்)',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechLang, setSpeechLang] = useState('ta-IN'); // 'ta-IN' for Tamil, 'en-IN' for Indian English
  const [voiceErrorMsg, setVoiceErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Text-to-Speech (TTS) Engine using SpeechSynthesis
  const speakMessage = (text) => {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel(); // Stop active playback before starting new

    const utterance = new SpeechSynthesisUtterance(text);
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    utterance.lang = isTamil ? 'ta-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak new assistant messages if unmuted
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length;
      const latest = messages[messages.length - 1];
      if (latest && latest.role === 'assistant' && !isMuted) {
        speakMessage(latest.content);
      }
    }
  }, [messages, isMuted]);

  // Auto-scroll to bottom of message list on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!floating || isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, floating]);

  // Unified send message function
  const sendTextMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsgObj = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: speechLang === 'ta-IN' ? 'tamil' : 'english',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsgObj = {
          role: 'assistant',
          content: data.reply || 'வணக்கம்! How can I assist your Tamil Nadu journey today?',
        };
        setMessages((prev) => [...prev, assistantMsgObj]);
      } else {
        throw new Error('Chat API returned an error');
      }
    } catch (err) {
      console.warn('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'வணக்கம்! I am here to help. You can explore heritage spots like Mylapore Kapaleeshwarar Temple (மயிலாப்பூர் கபாலீஸ்வரர் கோவில்) or taste Marina Beach Sundal (மெரினா பீச் சுண்டல்).',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendTextMessage(inputMessage);
  };

  // ── WEB SPEECH API RECOGNITION ──
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceErrorMsg('Voice input is not supported in this browser. Please type your question.');
      setTimeout(() => setVoiceErrorMsg(''), 6000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceErrorMsg('');
      };

      recognition.onresult = (event) => {
        setIsListening(false);
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInputMessage(transcript);
          sendTextMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceErrorMsg('Voice input is not supported in this browser. Please type your question.');
        setTimeout(() => setVoiceErrorMsg(''), 6000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition exception:', err);
      setIsListening(false);
      setVoiceErrorMsg('Voice input is not supported in this browser. Please type your question.');
      setTimeout(() => setVoiceErrorMsg(''), 6000);
    }
  };

  const BotAvatar = ({ size = 30 }) => (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'rgba(255, 250, 240, 0.92)',
        border: '1px solid rgba(180, 83, 10, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(180, 83, 10, 0.15)',
      }}
    >
      <img
        src={vaagaiFlower}
        alt="Vaagai flower"
        style={{ width: `${size * 0.72}px`, height: `${size * 0.72}px`, objectFit: 'contain' }}
      />
    </div>
  );

  const chatContent = (
    <div
      style={{
        background: 'rgba(253, 248, 240, 0.98)',
        border: '1px solid rgba(180, 83, 10, 0.22)',
        borderRadius: '22px',
        width: '100%',
        maxWidth: floating ? '384px' : '750px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: floating ? '520px' : '560px',
        boxShadow: '0 24px 60px -18px rgba(46, 36, 26, 0.4), 0 4px 16px rgba(180, 83, 10, 0.12)',
        overflow: 'hidden',
        animation: floating ? 'vaagaiRise 0.32s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: '0.9rem 1.1rem',
          background: 'linear-gradient(120deg, #8a3c06 0%, #b4530a 55%, #c96a1f 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* subtle texture glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120px 60px at 85% 20%, rgba(255, 236, 200, 0.22), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', position: 'relative' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 250, 240, 0.95)',
              border: '2px solid rgba(255, 236, 200, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(60, 25, 4, 0.35)',
            }}
          >
            <img
              src={vaagaiFlower}
              alt="Vaagai flower"
              style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h3
              style={{
                color: '#fff8ec',
                fontSize: '1.05rem',
                margin: 0,
                fontFamily: "'Noto Serif Tamil', 'Libre Baskerville', serif",
                fontWeight: 700,
                letterSpacing: '0.01em',
                lineHeight: 1.1,
              }}
            >
              வாகை <span style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic' }}>Vaagai</span>
            </h3>
            <span
              style={{
                color: 'rgba(255, 236, 200, 0.85)',
                fontSize: '0.68rem',
                fontFamily: "'Libre Baskerville', serif",
                letterSpacing: '0.06em',
              }}
            >
              உங்கள் தமிழ்நாடு பயண தோழி · travel companion
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
          {/* Mute / Auto-Speech Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMuted) window.speechSynthesis?.cancel();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? 'Unmute auto-speech' : 'Mute auto-speech'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isMuted ? 'rgba(255, 77, 77, 0.25)' : 'rgba(255, 248, 236, 0.16)',
              color: isMuted ? '#ffd2d2' : '#fff8ec',
              border: `1px solid ${isMuted ? 'rgba(255, 120, 120, 0.6)' : 'rgba(255, 236, 200, 0.35)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Voice Language Selector */}
          <button
            type="button"
            onClick={() => setSpeechLang((prev) => (prev === 'ta-IN' ? 'en-IN' : 'ta-IN'))}
            title="Toggle voice language"
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 248, 236, 0.16)',
              color: '#fff8ec',
              border: '1px solid rgba(255, 236, 200, 0.35)',
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: "'Noto Serif Tamil', 'Libre Baskerville', serif",
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Languages size={13} />
            {speechLang === 'ta-IN' ? 'தமிழ்' : 'Eng'}
          </button>

          {floating && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close Vaagai"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 248, 236, 0.16)',
                color: '#fff8ec',
                border: '1px solid rgba(255, 236, 200, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        style={{
          flex: 1,
          padding: '1rem 1rem 0.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          background:
            'radial-gradient(400px 200px at 50% -40px, rgba(180, 83, 10, 0.06), transparent 70%)',
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              {!isUser && <BotAvatar />}

              <div
                style={{
                  maxWidth: '82%',
                  padding: '0.7rem 0.95rem',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser
                    ? 'linear-gradient(135deg, #b4530a, #8a3c06)'
                    : '#ffffff',
                  color: isUser ? '#fff8ec' : '#2e241a',
                  border: isUser ? 'none' : '1px solid rgba(180, 83, 10, 0.18)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  fontFamily: "'Libre Baskerville', 'Noto Serif Tamil', serif",
                  boxShadow: isUser
                    ? '0 6px 16px rgba(180, 83, 10, 0.28)'
                    : '0 2px 10px rgba(46, 36, 26, 0.08)',
                  position: 'relative',
                }}
              >
                {msg.content}

                {/* Per-Message Speaker Button on Assistant Cards */}
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => speakMessage(msg.content)}
                    title="Speak message aloud"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#b4530a',
                      cursor: 'pointer',
                      marginLeft: '6px',
                      padding: '0 2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      verticalAlign: 'middle',
                      opacity: 0.75,
                    }}
                  >
                    <Volume2 size={13} />
                  </button>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#1d6b5f',
                    color: '#f5efe4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(29, 107, 95, 0.3)',
                  }}
                >
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
            <BotAvatar />
            <div
              style={{
                background: '#ffffff',
                color: '#8a6a4a',
                padding: '0.65rem 0.9rem',
                borderRadius: '18px 18px 18px 4px',
                fontSize: '0.8rem',
                border: '1px solid rgba(180, 83, 10, 0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: "'Libre Baskerville', 'Noto Serif Tamil', serif",
              }}
            >
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
              <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              <span style={{ marginLeft: '4px' }}>Vaagai யோசிக்கிறது...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Unsupported Error Banner */}
      {voiceErrorMsg && (
        <div
          style={{
            background: 'rgba(180, 83, 10, 0.08)',
            color: '#8a3c06',
            borderTop: '1px solid rgba(180, 83, 10, 0.25)',
            padding: '0.45rem 0.9rem',
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: "'Libre Baskerville', serif",
          }}
        >
          <AlertTriangle size={13} />
          {voiceErrorMsg}
        </div>
      )}

      {/* ── INPUT ROW ── */}
      <form
        onSubmit={handleFormSubmit}
        style={{
          padding: '0.75rem 0.9rem',
          background: '#fdf8f0',
          borderTop: '1px solid rgba(180, 83, 10, 0.16)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            isListening
              ? `Listening in ${speechLang === 'ta-IN' ? 'Tamil' : 'English'}...`
              : 'Ask in English or Tamil...'
          }
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            background: '#ffffff',
            border: isListening ? '2px solid #b91c1c' : '1px solid rgba(180, 83, 10, 0.25)',
            borderRadius: '999px',
            color: '#2e241a',
            fontSize: '0.85rem',
            fontFamily: "'Libre Baskerville', 'Noto Serif Tamil', serif",
            outline: 'none',
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#b4530a';
            e.target.style.boxShadow = '0 0 0 3px rgba(180, 83, 10, 0.14)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = isListening ? '#b91c1c' : 'rgba(180, 83, 10, 0.25)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title={isListening ? 'Listening...' : 'Click to speak'}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isListening ? '#b91c1c' : '#ffffff',
            color: isListening ? '#fff8ec' : '#b4530a',
            border: isListening ? '2px solid #b91c1c' : '1px solid rgba(180, 83, 10, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            animation: isListening ? 'micPulse 1.2s infinite' : 'none',
            boxShadow: isListening ? '0 0 15px rgba(185, 28, 28, 0.5)' : '0 2px 8px rgba(46,36,26,0.08)',
            transition: 'all 0.25s ease',
          }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          title="Send message"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: loading || !inputMessage.trim() ? '#e8e0d2' : 'linear-gradient(135deg, #b4530a, #8a3c06)',
            color: loading || !inputMessage.trim() ? '#a89880' : '#fff8ec',
            border: 'none',
            cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !inputMessage.trim() ? 'none' : '0 6px 16px rgba(180, 83, 10, 0.35)',
            transition: 'all 0.25s ease',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .typing-dot {
          width: 5px;
          height: 5px;
          background: #b4530a;
          border-radius: 50%;
          animation: bounce 1.2s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes micPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.5); }
          70% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(185, 28, 28, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(185, 28, 28, 0); }
        }
        @keyframes vaagaiRise {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vaagaiPulse {
          0% { box-shadow: 0 0 0 0 rgba(180, 83, 10, 0.35), 0 8px 24px rgba(46, 36, 26, 0.35); }
          70% { box-shadow: 0 0 0 14px rgba(180, 83, 10, 0), 0 8px 24px rgba(46, 36, 26, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(180, 83, 10, 0), 0 8px 24px rgba(46, 36, 26, 0.35); }
        }
      `}</style>
    </div>
  );

  if (floating) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000 }}>
        {isOpen && <div style={{ marginBottom: '14px' }}>{chatContent}</div>}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: isOpen
              ? '#2e241a'
              : 'linear-gradient(135deg, #b4530a 0%, #c96a1f 60%, #d9822b 100%)',
            color: '#fff8ec',
            border: '2px solid rgba(255, 248, 236, 0.55)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
            transition: 'transform 0.3s ease, background 0.3s ease',
            animation: isOpen ? 'none' : 'vaagaiPulse 2.6s infinite',
          }}
          title="Vaagai · Sancharam travel companion"
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.07)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isOpen ? (
            <X size={22} />
          ) : (
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 250, 240, 0.96)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(60, 25, 4, 0.3)',
              }}
            >
              <img
                src={vaagaiFlower}
                alt="Open Vaagai assistant"
                style={{ width: '34px', height: '34px', objectFit: 'contain' }}
              />
            </div>
          )}
        </button>
      </div>
    );
  }

  return chatContent;
};

export default TamilChatbot;
