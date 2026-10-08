import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import ChatBubble from '../components/ChatBubble';
import { useAuth } from '../context/AuthContext';

/**
 * AI Chat with RAG + Multilingual Query Interface
 *
 * Supports:
 * - Normal text questions through Spring Boot -> Python AI service
 * - Voice questions through the Python /voice-query endpoint
 * - English, Tamil and Telugu
 */
export default function AiQuery() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'auto');

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load previous chat history
  useEffect(() => {
    api.get('/ai/history').then((res) => {
      const history = [...res.data].reverse().flatMap((q) => ([
        { text: q.originalQuestion, isUser: true },
        {
          text: q.finalAnswer,
          isUser: false,
          detectedLanguage: q.detectedLanguage,
        },
      ]));

      setMessages(history.length ? history : [
        {
          text: 'Hi! Ask me anything about crops, irrigation, fertilizers, pests or schemes - in English, Tamil or Telugu. I\'ll remember our conversation as we go.',
          isUser: false,
        },
      ]);
    }).catch(() => {
      setMessages([
        {
          text: 'Hi! Ask me anything about farming - in English, Tamil or Telugu.',
          isUser: false,
        },
      ]);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------------------------------------------------
  // Normal text question
  // ---------------------------------------------------------
  const handleSend = async (e) => {
    e.preventDefault();

    if (!question.trim() || loading || voiceLoading) return;

    const userMsg = {
      text: question,
      isUser: true,
    };

    setMessages((m) => [...m, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        question: userMsg.text,
        language,
      });

      setMessages((m) => [...m, {
        text: res.data.finalAnswer,
        isUser: false,
        detectedLanguage: res.data.detectedLanguage,
      }]);
    } catch (err) {
      setMessages((m) => [...m, {
        text: 'Sorry, something went wrong. Please make sure the AI service is running.',
        isUser: false,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Start recording
  // ---------------------------------------------------------
  const startRecording = async () => {
    if (recording || voiceLoading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        await sendVoiceQuery(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);

    } catch (err) {
      console.error('Microphone error:', err);

      setMessages((m) => [...m, {
        text: 'Microphone access was denied or is unavailable. Please allow microphone access in your browser.',
        isUser: false,
      }]);
    }
  };

  // ---------------------------------------------------------
  // Stop recording
  // ---------------------------------------------------------
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !recording) return;

    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // ---------------------------------------------------------
  // Send recorded audio to Python AI service
  // ---------------------------------------------------------
  const sendVoiceQuery = async (audioBlob) => {
    setVoiceLoading(true);

    try {
      const formData = new FormData();

      const extension = audioBlob.type.includes('webm')
        ? 'webm'
        : 'wav';

      formData.append(
        'file',
        audioBlob,
        `voice-query.${extension}`
      );

      formData.append('language', language);

      const response = await fetch(
        'http://localhost:8000/voice-query',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Voice request failed: ${response.status}`);
      }

      const data = await response.json();

      // Add the spoken question to the chat
      if (data.transcribed_text) {
        setMessages((m) => [
          ...m,
          {
            text: data.transcribed_text,
            isUser: true,
          },
          {
            text: data.final_answer,
            isUser: false,
            detectedLanguage: data.detected_language,
            audioUrl: data.audio_url,
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            text: data.final_answer || 'Sorry, I could not understand the audio.',
            isUser: false,
          },
        ]);
      }

      // Play the generated spoken answer automatically
      // if (data.audio_url) {
      //   const audio = new Audio(
      //     `http://localhost:8000${data.audio_url}`
      //   );

      //   audio.play().catch((err) => {
      //     console.log('Automatic audio playback was blocked:', err);
      //   });
      // }

    } catch (err) {
      console.error('Voice query error:', err);

      setMessages((m) => [
        ...m,
        {
          text: 'Sorry, the voice query failed. Please make sure the AI service is running on port 8000.',
          isUser: false,
        },
      ]);
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ask AI 🤖"
        subtitle="Multilingual RAG chatbot with memory — LangGraph + FAISS + Groq"
      />

      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '65vh',
        }}
      >

        {/* Language selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 10,
          }}
        >
          <select
            className="form-select"
            style={{ width: 200 }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={recording || voiceLoading}
          >
            <option value="auto">Auto-detect language</option>
            <option value="English">Reply in English</option>
            <option value="Tamil">Reply in Tamil</option>
            <option value="Telugu">Reply in Telugu</option>
          </select>
        </div>

        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 8,
          }}
        >
          {messages.map((m, i) => (
            <div key={i}>
              <ChatBubble
                text={m.text}
                isUser={m.isUser}
              />

              {!m.isUser && m.detectedLanguage && (
                <div
                  style={{
                    textAlign: 'left',
                    marginTop: -8,
                    marginBottom: 10,
                  }}
                >
                  <span className="badge badge-blue">
                    Detected: {m.detectedLanguage}
                  </span>
                </div>
              )}

              {/* Manual audio playback button */}
              {!m.isUser && m.audioUrl && (
                <div style={{ marginBottom: 10 }}>
                  <audio
                    controls
                    src={`http://localhost:8000${m.audioUrl}`}
                  />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <ChatBubble
              text="Thinking..."
              isUser={false}
            />
          )}

          {voiceLoading && (
            <ChatBubble
              text="Processing your voice..."
              isUser={false}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Text input */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
          }}
        >
          <input
            className="form-input"
            placeholder="e.g. பருத்தியில் பேன் பூச்சியை எப்படி கட்டுப்படுத்துவது?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading || recording || voiceLoading}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={
              loading ||
              recording ||
              voiceLoading ||
              !question.trim()
            }
          >
            Send
          </button>

          {/* Microphone button */}
          <button
            type="button"
            className="btn"
            onClick={recording ? stopRecording : startRecording}
            disabled={loading || voiceLoading}
            style={{
              minWidth: 55,
              fontSize: 22,
            }}
            title={
              recording
                ? 'Stop recording'
                : 'Start voice recording'
            }
          >
            {recording ? '⏹️' : '🎤'}
          </button>
        </form>

        {/* Recording status */}
        {recording && (
          <div
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            🔴 Recording... Click ⏹️ to stop
          </div>
        )}

      </div>
    </div>
  );
}