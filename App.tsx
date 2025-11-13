
import React, { useState } from 'react';
import { AppMode } from './types';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Chat from './components/Chat';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.ImageGeneration);

  const renderContent = () => {
    switch (mode) {
      case AppMode.ImageGeneration:
        return <ImageGenerator />;
      case AppMode.ImageEditing:
        return <ImageEditor />;
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

// Icons - updated to accept className
const SparklesIcon:React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v2.586l1.707-1.707a1 1 0 111.414 1.414L12.414 8H15a1 1 0 110 2h-2.586l1.707 1.707a1 1 0 11-1.414 1.414L11 11.414V14a1 1 0 11-2 0v-2.586l-1.707 1.707a1 1 0 11-1.414-1.414L7.586 10H5a1 1 0 110-2h2.586L5.793 6.293a1 1 0 011.414-1.414L9 6.586V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
);
const BrushIcon:React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
);
const BoltIcon:React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
);
export const DownloadIcon:React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
);

export default App;
