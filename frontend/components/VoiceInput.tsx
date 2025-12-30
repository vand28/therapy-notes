'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, onError, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can be made configurable

      recognition.onresult = (event) => {
        const current = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        const error = event.error;
        if (error === 'no-speech') {
          // User didn't speak, just stop
          setIsListening(false);
        } else if (error === 'not-allowed') {
          onError?.('Microphone access denied. Please enable microphone permissions.');
          setIsListening(false);
        } else {
          onError?.(`Speech recognition error: ${error}`);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onError]);

  const startListening = () => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (err) {
        onError?.('Failed to start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Send final transcript
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript('');
      }
    }
  };

  const handleInsert = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? (
            <>
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              Stop Recording
            </>
          ) : (
            <>
              <span>🎤</span>
              Start Voice Input
            </>
          )}
        </button>

        {transcript && (
          <button
            type="button"
            onClick={handleInsert}
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium"
          >
            Insert Text
          </button>
        )}
      </div>

      {isListening && (
        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
          Listening... {transcript && `"${transcript}"`}
        </div>
      )}

      {transcript && !isListening && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">{transcript}</div>
        </div>
      )}
    </div>
  );
}


