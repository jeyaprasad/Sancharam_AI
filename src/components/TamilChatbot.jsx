import React, { useState, useEffect, useRef } from 'react';

const TamilChatbot = ({ floating = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'வணக்கம்! I am your Sancharam AI travel guide for Tamil Nadu. Ask me anything about places, local food, culture, or safety tips in Tamil or English! (என்னிடம் தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்)'
    }
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
          language: speechLang === 'ta-IN' ? 'tamil' : 'english'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsgObj = {
          role: 'assistant',
          content: data.reply || 'வணக்கம்! How can I assist your Tamil Nadu journey today?'
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
          content: 'வணக்கம்! I am here to help. You can explore heritage spots like Thanjavur Brihadeeswarar Temple (பிரகதீஸ்வரர் கோவில்) or taste Madurai Jigarthanda (மதுரை ஜிகர்தண்டா).'
        }
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

  const chatContent = (
    <div
      style={{
        background: '#14141d',
        border: '1px solid #282838',
        borderRadius: '16px',
        width: '100%',
        maxWidth: floating ? '380px' : '750px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: floating ? '480px' : '540px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}
    >
      {/* ── CHATBOT HEADER ── */}
      <div
        style={{
          padding: '0.85rem 1.2rem',
          background: '#1a1a28',
          borderBottom: '1px solid #282838',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid #FFD700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}
          >
            🛕
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>
              Sancharam AI
            </h3>
            <span style={{ color: '#FFD700', fontSize: '0.7rem', fontFamily: "'Yatra One', cursive" }}>
              தமிழ்நாடு வழிகாட்டி
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Global Mute / Auto-Speech Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMuted) window.speechSynthesis?.cancel();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? 'Unmute Auto-Speech' : 'Mute Auto-Speech'}
            style={{
              background: isMuted ? 'rgba(255, 77, 77, 0.15)' : 'rgba(46, 196, 182, 0.15)',
              color: isMuted ? '#ff4d4d' : '#2ec4b6',
              border: isMuted ? '1px solid #ff4d4d' : '1px solid #2ec4b6',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isMuted ? '🔇 Muted' : '🔊 Voice ON'}
          </button>

          {/* Voice Language Selector */}
          <button
            type="button"
            onClick={() => setSpeechLang((prev) => (prev === 'ta-IN' ? 'en-IN' : 'ta-IN'))}
            style={{
              background: '#222235',
              color: '#FFD700',
              border: '1px solid #444466',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🌐 {speechLang === 'ta-IN' ? 'தமிழ்' : 'Eng'}
          </button>

          {floating && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE MESSAGES LIST ── */}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
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
                gap: '0.5rem'
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#222235',
                    border: '1px solid #444466',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  🤖
                </div>
              )}

              <div
                style={{
                  maxWidth: '82%',
                  padding: '0.75rem 0.95rem',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isUser
                    ? 'linear-gradient(135deg, #FFD700, #ffb300)'
                    : '#1e1e2d',
                  color: isUser ? '#000' : '#fff',
                  border: isUser ? 'none' : '1px solid #2e2e42',
                  fontSize: '0.9rem',
                  lineHeight: '1.45',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  position: 'relative'
                }}
              >
                {msg.content}

                {/* Per-Message Speaker Icon Button on Assistant Cards */}
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => speakMessage(msg.content)}
                    title="Speak message aloud"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FFD700',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      marginLeft: '6px',
                      padding: '0 2px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    🔊
                  </button>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#FFD700',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  👤
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#222235',
                border: '1px solid #444466',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}
            >
              🤖
            </div>
            <div
              style={{
                background: '#1e1e2d',
                color: '#aaa',
                padding: '0.65rem 0.85rem',
                borderRadius: '16px 16px 16px 2px',
                fontSize: '0.8rem',
                border: '1px solid #2e2e42',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
              <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              <span style={{ marginLeft: '4px' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Unsupported Error Banner */}
      {voiceErrorMsg && (
        <div
          style={{
            background: 'rgba(255, 77, 77, 0.15)',
            color: '#ff4d4d',
            borderTop: '1px solid rgba(255, 77, 77, 0.3)',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          ⚠️ {voiceErrorMsg}
        </div>
      )}

      {/* ── INPUT ROW AT BOTTOM ── */}
      <form
        onSubmit={handleFormSubmit}
        style={{
          padding: '0.85rem 1rem',
          background: '#1a1a28',
          borderTop: '1px solid #282838',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
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
            padding: '0.75rem 0.95rem',
            background: '#12121a',
            border: isListening ? '2px solid #ff4d4d' : '1px solid #33334d',
            borderRadius: '50px',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'border-color 0.25s ease'
          }}
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          title={isListening ? 'Listening...' : 'Click to speak'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: isListening ? '#ff4d4d' : '#252538',
            color: isListening ? '#fff' : '#FFD700',
            border: isListening ? '2px solid #ff1a1a' : '1px solid #444466',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            animation: isListening ? 'micPulse 1.2s infinite' : 'none',
            boxShadow: isListening ? '0 0 15px rgba(255, 77, 77, 0.8)' : 'none',
            transition: 'all 0.25s ease'
          }}
        >
          {isListening ? '🎙️' : '🎤'}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          style={{
            padding: '0.75rem 1.1rem',
            background: loading || !inputMessage.trim() ? '#444' : 'var(--accent, #FFD700)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '0.88rem',
            border: 'none',
            borderRadius: '50px',
            cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
            transition: 'all 0.25s ease',
            flexShrink: 0
          }}
        >
          Send 🚀
        </button>
      </form>

      <style>{`
        .typing-dot {
          width: 5px;
          height: 5px;
          background: #FFD700;
          border-radius: 50%;
          animation: bounce 1.2s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes micPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(255, 77, 77, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
        }
      `}</style>
    </div>
  );

  if (floating) {
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000 }}>
        {isOpen && (
          <div style={{ marginBottom: '12px' }}>
            {chatContent}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #ff9800)',
            color: '#000',
            border: 'none',
            fontSize: '1.6rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
            transition: 'transform 0.3s ease'
          }}
          title="Sancharam AI Travel Assistant"
        >
          {isOpen ? '✕' : '🛕'}
        </button>
      </div>
    );
  }

  return chatContent;
};

export default TamilChatbot;
