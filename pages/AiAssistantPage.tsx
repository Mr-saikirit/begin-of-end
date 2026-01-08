
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";

// Helpers for Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AiAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'creative' | 'finder'>('assistant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search/Maps Grounding States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{web?: {uri: string, title: string}, maps?: {uri: string, title: string}}[]>([]);

  // Creative States (Image/Video)
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);

  // Live Assistant States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{in: AudioContext, out: AudioContext} | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const handleSearchOrMaps = async (mode: 'search' | 'maps') => {
    setLoading(true);
    setSearchResult(null);
    setGroundingLinks([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let latLng = { latitude: 40.7128, longitude: -74.0060 }; // Default NY
      
      if (mode === 'maps' && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
              resolve(null);
            },
            () => resolve(null)
          );
        });
      }

      const response = await ai.models.generateContent({
        model: mode === 'search' ? 'gemini-3-flash-preview' : 'gemini-2.5-flash',
        contents: searchQuery,
        config: {
          tools: mode === 'search' ? [{ googleSearch: {} }] : [{ googleMaps: {} }],
          toolConfig: mode === 'maps' ? {
            retrievalConfig: { latLng }
          } : undefined
        },
      });

      setSearchResult(response.text || "No results found.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setGroundingLinks(chunks);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize }
        },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (e: any) {
      setError(e.message);
      if (e.message.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedImageUrl) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64 = generatedImageUrl.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/png' } },
            { text: editPrompt }
          ]
        },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!uploadedImageBase64) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        image: {
          imageBytes: uploadedImageBase64.split(',')[1],
          mimeType: 'image/png'
        },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startLiveAssistant = async () => {
    setIsLiveActive(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { in: inCtx, out: outCtx };
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are GiveBound, a helpful donation assistant. Speak warmly and guide users through community resources.'
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e: any) {
      setError(e.message);
      setIsLiveActive(false);
    }
  };

  const stopLiveAssistant = () => {
    setIsLiveActive(false);
    if (liveSessionRef.current) liveSessionRef.current.close();
    if (audioContextsRef.current) {
      audioContextsRef.current.in.close();
      audioContextsRef.current.out.close();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">GiveBound AI Suite</h1>
        <p className="text-slate-500">Intelligent tools to enhance your community impact.</p>
      </div>

      <div className="flex justify-center gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
        {(['assistant', 'creative', 'finder'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition capitalize ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 min-h-[500px]">
        {activeTab === 'assistant' && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center transition-all ${isLiveActive ? 'border-indigo-600 animate-pulse scale-110 shadow-indigo-100' : 'border-slate-100'}`}>
              <span className="text-5xl">{isLiveActive ? '🎙️' : '🤖'}</span>
            </div>
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Voice Assistant</h2>
              <p className="text-slate-500">Start a natural conversation to find donations, learn about our mission, or get help with your account.</p>
            </div>
            <button
              onClick={isLiveActive ? stopLiveAssistant : startLiveAssistant}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition ${isLiveActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
            >
              {isLiveActive ? 'Stop Assistant' : 'Talk to GiveBound'}
            </button>
            {error && <p className="text-red-500 font-medium">{error}</p>}
          </div>
        )}

        {activeTab === 'creative' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 text-sm">📸</span>
                Campaign Visuals
              </h3>
              <div className="space-y-4">
                <textarea
                  className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Describe an image for your NGO campaign..."
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <select className="border p-2 rounded-lg outline-none" value={imageSize} onChange={e => setImageSize(e.target.value as any)}>
                    <option value="1K">1K Res</option>
                    <option value="2K">2K Res</option>
                    <option value="4K">4K Res</option>
                  </select>
                  <button onClick={handleGenerateImage} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50">Generate</button>
                </div>
              </div>

              {generatedImageUrl && (
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-bold text-slate-700 text-sm uppercase">Quick Edit</h4>
                  <input
                    className="w-full p-3 border rounded-xl text-sm outline-none"
                    placeholder="e.g. 'Add a vintage filter' or 'Make it brighter'"
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                  />
                  <button onClick={handleEditImage} disabled={loading} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold">Apply Edit</button>
                </div>
              )}

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="bg-purple-100 p-1.5 rounded-lg text-purple-600 text-sm">🎬</span>
                  Animate Story (Veo)
                </h3>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                <textarea className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm" placeholder="Prompt for video (e.g. 'The character waves happily')..." value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} />
                <button onClick={handleGenerateVideo} disabled={loading || !uploadedImageBase64} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 w-full">Generate Video</button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-4 border border-dashed border-slate-200">
              {loading && (
                <div className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-600">GiveBound AI is creating magic...</p>
                </div>
              )}
              {!loading && generatedImageUrl && <img src={generatedImageUrl} className="rounded-xl shadow-lg max-h-80 object-contain mb-4" />}
              {!loading && videoUrl && <video src={videoUrl} controls className="rounded-xl shadow-lg w-full max-h-80" />}
              {!loading && !generatedImageUrl && !videoUrl && (
                <p className="text-slate-400 text-center text-sm italic">Generated visuals will appear here</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'finder' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                className="flex-grow p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                placeholder="Search NGOs near me, verified donation centers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => handleSearchOrMaps('search')} disabled={loading} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                  <span>Search</span>
                </button>
                <button onClick={() => handleSearchOrMaps('maps')} disabled={loading} className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition">
                  Maps
                </button>
              </div>
            </div>

            {searchResult && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-800 whitespace-pre-wrap">{searchResult}</p>
                </div>
                {groundingLinks.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {groundingLinks.map((link, i) => {
                        const data = link.web || link.maps;
                        if (!data) return null;
                        return (
                          <a key={i} href={data.uri} target="_blank" rel="noopener noreferrer" className="bg-white px-3 py-1.5 rounded-lg border text-xs text-indigo-600 hover:text-indigo-800 font-medium shadow-sm transition">
                            {data.title || 'Visit Source'}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
