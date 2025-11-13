import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio } from '../types';
import Spinner from './common/Spinner';
import { DownloadIcon } from './Icons';

const artStyles = ["Photorealistic", "Anime", "Cyberpunk", "Impressionism", "Steampunk", "Minimalist", "Fantasy Art", "Watercolor", "Abstract", "Cartoon", "Vintage"];
const moods = ["Dramatic", "Serene", "Cheerful", "Mysterious", "Energetic"];
const lightingOptions = ["Soft Light", "Cinematic", "Neon", "Golden Hour", "Low Light"];
const OTHER_STYLE_OPTION = "Other...";


const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A majestic lion with a crown of stars');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [style, setStyle] = useState<string | null>(artStyles[2]);
  const [customStyle, setCustomStyle] = useState<string>('');
  
  const [mood, setMood] = useState<string | null>(moods[0]);
  const [customMood, setCustomMood] = useState<string>('');
  
  const [lighting, setLighting] = useState<string | null>(lightingOptions[1]);
  const [customLighting, setCustomLighting] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const activeStyle = style === OTHER_STYLE_OPTION ? customStyle.trim() : style;
      const activeMood = mood === OTHER_STYLE_OPTION ? customMood.trim() : mood;
      const activeLighting = lighting === OTHER_STYLE_OPTION ? customLighting.trim() : lighting;
      
      const finalPrompt = [prompt, activeStyle, activeMood, activeLighting].filter(Boolean).join(', ');
      const imageUrl = await generateImage(finalPrompt, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? `API Error: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'reze-generated-image.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const AspectRatioButton: React.FC<{ value: AspectRatio, label: string }> = ({ value, label }) => (
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

  const OptionButton: React.FC<{ value: string, state: string | null, setter: (val: string | null) => void }> = ({ value, state, setter }) => {
    const isSelected = state === value;
    return (
       <button
        type="button"
        onClick={() => setter(isSelected ? null : value)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${
            isSelected ? 'bg-purple-500 border-purple-400 text-white' : 'bg-slate-800/70 border-slate-700 text-gray-300 hover:bg-slate-700 hover:border-purple-500'
        }`}
       >
        {value}
       </button>
    )
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-gray-200">
        Image Generation
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-slate-900/40 rounded-lg ring-1 ring-white/10">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a detailed prompt for image generation..."
          rows={3}
          className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
        />
        
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-4">
            <h3 className="font-semibold text-gray-300">Prompt Enhancer</h3>
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Art Style</p>
                <div className="flex flex-wrap gap-2">
                    {artStyles.map(s => <OptionButton key={s} value={s} state={style} setter={setStyle} />)}
                    <OptionButton key={OTHER_STYLE_OPTION} value={OTHER_STYLE_OPTION} state={style} setter={setStyle} />
                </div>
                {style === OTHER_STYLE_OPTION && (
                    <div className="pt-2 transition-all duration-300">
                         <input
                            type="text"
                            value={customStyle}
                            onChange={(e) => setCustomStyle(e.target.value)}
                            placeholder="Describe your custom art style..."
                            className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                            autoFocus
                        />
                    </div>
                )}
            </div>
             <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Mood</p>
                <div className="flex flex-wrap gap-2">
                    {moods.map(m => <OptionButton key={m} value={m} state={mood} setter={setMood} />)}
                    <OptionButton key={OTHER_STYLE_OPTION} value={OTHER_STYLE_OPTION} state={mood} setter={setMood} />
                </div>
                {mood === OTHER_STYLE_OPTION && (
                    <div className="pt-2 transition-all duration-300">
                         <input
                            type="text"
                            value={customMood}
                            onChange={(e) => setCustomMood(e.target.value)}
                            placeholder="Describe your custom mood..."
                            className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                            autoFocus
                        />
                    </div>
                )}
            </div>
             <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Lighting</p>
                <div className="flex flex-wrap gap-2">
                    {lightingOptions.map(l => <OptionButton key={l} value={l} state={lighting} setter={setLighting} />)}
                    <OptionButton key={OTHER_STYLE_OPTION} value={OTHER_STYLE_OPTION} state={lighting} setter={setLighting} />
                </div>
                {lighting === OTHER_STYLE_OPTION && (
                    <div className="pt-2 transition-all duration-300">
                         <input
                            type="text"
                            value={customLighting}
                            onChange={(e) => setCustomLighting(e.target.value)}
                            placeholder="Describe your custom lighting..."
                            className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-400 font-medium">Aspect Ratio:</span>
            <AspectRatioButton value="16:9" label="16:9" />
            <AspectRatioButton value="1:1" label="1:1" />
            <AspectRatioButton value="9:16" label="9:16" />
            <AspectRatioButton value="4:3" label="4:3" />
            <AspectRatioButton value="3:4" label="3:4" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/30 transform hover:scale-105"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>
      
      {error && <p className="text-red-400 text-center text-md bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}

      <div className="mt-4 flex flex-col justify-center items-center bg-black/30 rounded-lg min-h-[400px] p-4 ring-1 ring-white/10">
        {isLoading && <Spinner text="Rendering your vision..." />}
        {generatedImage && (
          <div className="w-full flex flex-col items-center gap-4">
            <img src={generatedImage} alt="Generated by AI" className="rounded-lg shadow-2xl shadow-black/60 max-w-full max-h-[50vh] sm:max-h-[65vh] object-contain" />
            <button
              onClick={handleDownload}
              className="mt-2 flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600/80 text-white font-semibold py-2 px-4 transition-all duration-300 rounded-lg shadow-md hover:shadow-purple-500/20"
            >
              <DownloadIcon className="h-5 w-5" />
              Download
            </button>
          </div>
        )}
        {!isLoading && !generatedImage && (
            <div className="text-center text-gray-500">
                <p>Your generated image will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
