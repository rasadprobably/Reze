
import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';
import { DownloadIcon } from '../../App';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:image/jpeg;base64,
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Add a dramatic, cinematic retro filter.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setEditedImage(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !imageFile) {
      setError('An image and a prompt are required to begin editing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const imageUrl = await editImage(prompt, imageBase64, imageFile.type);
      setEditedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? `API ERROR: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = 'reze-edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center text-gray-200">
        Image Editor
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-slate-900/40 rounded-lg ring-1 ring-white/10">
        <FileUpload onFileSelect={handleFileSelect} accept="image/*" label="Upload Image" />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how you want to edit the image..."
          rows={2}
          className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
        />
        <button
          type="submit"
          disabled={isLoading || !imageFile}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/30 transform hover:scale-105"
        >
          {isLoading ? 'Applying Edits...' : 'Edit Image'}
        </button>
      </form>
      
      {error && <p className="text-red-400 text-center text-md bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
        <div className="bg-slate-900/40 ring-1 ring-white/10 rounded-lg p-4 flex flex-col justify-center items-center">
            <h3 className="font-semibold text-lg mb-4 text-gray-400">Original</h3>
            {imagePreview ? (
                <img src={imagePreview} alt="Original" className="rounded-lg shadow-xl shadow-black/50 max-w-full max-h-[40vh] object-contain" />
            ) : <p className="text-gray-500">Upload an image to start</p>}
        </div>
        <div className="bg-slate-900/40 ring-1 ring-white/10 rounded-lg p-4 flex flex-col justify-center items-center">
            <h3 className="font-semibold text-lg mb-4 text-gray-400">Edited</h3>
            {isLoading ? <Spinner text="Applying edits..." /> : editedImage ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <img src={editedImage} alt="Edited by AI" className="rounded-lg shadow-xl shadow-black/50 max-w-full max-h-[40vh] object-contain" />
                   <button
                    onClick={handleDownload}
                    className="mt-2 flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600/80 text-white font-semibold py-2 px-4 transition-all duration-300 rounded-lg shadow-md hover:shadow-purple-500/20"
                  >
                    <DownloadIcon className="h-5 w-5" />
                    Download
                  </button>
                </div>
            ) : <p className="text-gray-500">Your edited image will appear here</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
