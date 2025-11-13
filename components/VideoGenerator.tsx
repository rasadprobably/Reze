import React, { useState, useEffect, useRef } from 'react';
import { generateVideoFromImage, pollVideoOperation } from '../services/geminiService';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

// Fix: Removed the conflicting global declaration for `window.aistudio`.
// The error messages indicate that a global type for `window.aistudio` already
// exists, and this local redeclaration was causing a conflict.

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const POLLING_MESSAGES = [
    "Initializing AI core...",
    "Analyzing source frame...",
    "Rendering video layers... (this may take a moment)",
    "Compositing animation...",
    "Finalizing render...",
];

const VideoGenerator: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [prompt, setPrompt] = useState<string>('A gentle breeze makes the leaves of the tree rustle.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [pollingMessage, setPollingMessage] = useState(POLLING_MESSAGES[0]);

  const pollingIntervalRef = useRef<number | null>(null);
  const messageIntervalRef = useRef<number | null>(null);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(keyStatus);
    }
  };

  useEffect(() => {
    checkApiKey();
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success and update UI immediately for better UX
      setHasApiKey(true);
    }
  };

  const cleanupPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    pollingIntervalRef.current = null;
    messageIntervalRef.current = null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('A source image is required to generate a video.');
      return;
    }
    setStatus('generating');
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      let operation = await generateVideoFromImage(prompt, imageBase64, imageFile.type, aspectRatio);
      setStatus('polling');

      // Start cycling through polling messages
      let messageIndex = 0;
      messageIntervalRef.current = window.setInterval(() => {
          messageIndex = (messageIndex + 1) % POLLING_MESSAGES.length;
          setPollingMessage(POLLING_MESSAGES[messageIndex]);
      }, 5000);

      pollingIntervalRef.current = window.setInterval(async () => {
        try {
          operation = await pollVideoOperation(operation);
          if (operation.done) {
            cleanupPolling();
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink && process.env.API_KEY) {
              setGeneratedVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
              setStatus('done');
            } else {
              throw new Error("Video generation finished, but no download link was found.");
            }
          }
        } catch (pollErr: any) {
            cleanupPolling();
            if (pollErr.message.includes('Requested entity was not found')) {
              setError("API key invalid. Please re-select your API key.");
              setHasApiKey(false); // Reset key state
            } else {
              setError(pollErr instanceof Error ? pollErr.message : 'An error occurred during polling.');
            }
            setStatus('error');
        }
      }, 10000);

    } catch (err: any) {
      if (err.message.includes('API_KEY')) {
         setError("API key is missing or invalid. Please select a valid key.");
         setHasApiKey(false);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
      setStatus('error');
    }
  };
  
  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  const AspectRatioButton: React.FC<{ value: '16:9' | '9:16', label: string }> = ({ value, label }) => (
    <button
      type="button"
      onClick={() => setAspectRatio(value)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
        aspectRatio === value ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800/70 text-gray-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  if (!hasApiKey) {
    return (
        <div className="text-center p-8 bg-slate-900/60 rounded-lg ring-1 ring-purple-500/30 shadow-2xl shadow-purple-500/10">
            <h3 className="text-xl font-bold mb-4 text-gray-200">API Key Required for Video Generation</h3>
            <p className="text-gray-400 mb-6">
                The Veo model requires a project with active billing. Please select your API key to continue.
            </p>
            <button
                onClick={handleSelectKey}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30">
                Select API Key
            </button>
            <p className="mt-4 text-xs text-gray-500">
                For more information, see the{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">
                    billing documentation
                </a>.
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-gray-200">
        Video Generation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-slate-900/40 rounded-lg ring-1 ring-white/10">
            <FileUpload onFileSelect={handleFileSelect} accept="image/*" label="Upload Source Image" />
            <div className="w-full bg-black/30 rounded-lg ring-1 ring-white/10 p-2 flex justify-center items-center min-h-[200px]">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-[25vh] object-contain rounded-md" />
                ) : <p className="text-gray-500">// Source image preview</p>}
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional: Describe the animation..."
                rows={2}
                className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
            />
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-400 font-medium">Aspect Ratio:</span>
                <AspectRatioButton value="16:9" label="16:9" />
                <AspectRatioButton value="9:16" label="9:16" />
            </div>
            <button
                type="submit"
                disabled={status === 'generating' || status === 'polling' || !imageFile}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/30 transform hover:scale-105"
            >
                {status === 'generating' || status === 'polling' ? 'Animating...' : 'Animate Image'}
            </button>
        </form>

        <div className="bg-black/30 rounded-lg p-4 flex justify-center items-center min-h-[400px] md:min-h-full ring-1 ring-white/10">
            {status === 'generating' && <Spinner text="Initializing..." />}
            {status === 'polling' && <Spinner text={pollingMessage} />}
            {status === 'done' && generatedVideoUrl && (
                <video src={generatedVideoUrl} controls autoPlay loop className="rounded-lg shadow-2xl shadow-black/60 w-full"></video>
            )}
            {status === 'error' && <p className="text-red-400 text-center text-md bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
            {status === 'idle' && <p className="text-gray-500">Your animated video will appear here</p>}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;