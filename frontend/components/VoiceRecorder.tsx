'use client';

import { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscribe: (text: string) => void;
  isPremium?: boolean;
}

export default function VoiceRecorder({ onTranscribe, isPremium = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    if (!isPremium) {
      alert('Voice-to-text transcription is available for Premium users only. Upgrade to unlock this feature!');
      return;
    }

    setIsTranscribing(true);
    
    try {
      // This would normally call your backend endpoint with OpenAI Whisper
      // For now, show a placeholder
      alert('Voice-to-text transcription requires OpenAI Whisper API integration. This is a premium feature.');
      
      // Example of what the real implementation would look like:
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const response = await fetch('/api/transcription/audio', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   body: formData
      // });
      // const { text } = await response.json();
      // onTranscribe(text);
      
    } catch (err) {
      alert('Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    chunksRef.current = [];
  };

  if (!isPremium) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎤</div>
          <div className="flex-1">
            <div className="font-medium text-purple-900">Voice-to-Text Notes</div>
            <div className="text-sm text-purple-700">Premium feature - Upgrade to unlock</div>
          </div>
          <a
            href="/dashboard/upgrade"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            Upgrade
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">🎤</div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">Voice Recording</div>
          <div className="text-sm text-gray-600">Record notes and transcribe with AI</div>
        </div>
      </div>

      {!audioBlob ? (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isRecording ? '⏸ Stop Recording' : '🎙 Start Recording'}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 text-center mb-3">
            ✓ Recording captured
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDiscard}
              className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Discard
            </button>
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
            >
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

