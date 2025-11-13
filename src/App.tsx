
import React, { useState } from 'react';
import { AppMode } from './types';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Chat from './components/Chat';
// Fix: Import VideoGenerator and FilmIcon to integrate the video generation feature.
import VideoGenerator from './components/VideoGenerator';
import { SparklesIcon, BrushIcon, BoltIcon, FilmIcon } from './components/Icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.ImageGeneration);

  const renderContent = () => {
    switch (mode) {
      case AppMode.ImageGeneration:
        return <ImageGenerator />;
      case AppMode.ImageEditing:
        return <ImageEditor />;
      // Fix: Add a case to render the VideoGenerator component.
      case AppMode.VideoGeneration:
        return <VideoGenerator />;
      case AppMode.Chat:
        return <Chat />;
      default:
        return <ImageGenerator />;
    }
  };

  const NavButton: React.FC<{
    appMode: AppMode;
    label: string;
    icon: React.ReactElement;
  }> = ({ appMode, label, icon }) => {
    const isActive = mode === appMode;
    return (
       <button
        onClick={() => setMode(appMode)}
        className={`relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-300 group ${
          isActive ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        {React.cloneElement(icon, { className: 'h-5 w-5 transition-transform duration-300 group-hover:scale-110' })}
        <span>{label}</span>
        <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
      </button>
    )
  };

  return (
    <div className="min-h-screen text-gray-200 p-4 sm:p-6 md:p-8 flex flex-col items-center">
       <div className="w-full max-w-7xl mx-auto bg-slate-900/50 rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-sm flex flex-col min-h-[calc(100vh-4rem)]">
        <header className="p-4 sm:p-6 text-center border-b border-white/10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
              Reze
            </h1>
            <p className="text-gray-400 mt-2 text-md">
                An AI-powered suite for creative image generation and editing, assisted by a helpful bot.
            </p>
        </header>

        <div className="p-4 md:p-6 flex-grow flex flex-col">
            <nav className="mb-6 flex justify-center flex-wrap border-b border-white/10">
                <NavButton
                  appMode={AppMode.ImageGeneration}
                  label="Generate"
                  icon={<SparklesIcon />}
                />
                <NavButton
                  appMode={AppMode.ImageEditing}
                  label="Edit"
                  icon={<BrushIcon />}
                />
                {/* Fix: Add a NavButton for the VideoGenerator component. */}
                <NavButton
                  appMode={AppMode.VideoGeneration}
                  label="Animate"
                  icon={<FilmIcon />}
                />
                <NavButton
                  appMode={AppMode.Chat}
                  label="Assistant"
                  icon={<BoltIcon />}
                />
            </nav>

            <main className="flex-grow">
              {renderContent()}
            </main>
        </div>
        
        <footer className="border-t border-white/10 p-4 text-center text-gray-500 text-sm">
           <p>&copy; {new Date().getFullYear()} Reze. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
