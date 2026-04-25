import React from 'react';
import { AlignLeft, AlignRight, FileText, CloudUpload, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ImageItem as ImageItemType } from '../types';

interface ImageItemProps {
  img: ImageItemType;
  idx: number;
  galleryView: 'grid' | 'list';
  isTrafficOptimized: boolean;
  onToggle: (idx: number) => void;
  onInsert: (url: string, name: string, pos: 'left' | 'plain' | 'right') => void;
  onHost: (url: string, name: string) => void;
  onDelete: (idx: number) => void;
  t: (key: any) => string;
}

const ImageItem = React.memo(({ 
  img, 
  idx, 
  galleryView, 
  isTrafficOptimized,
  onToggle, 
  onInsert, 
  onHost, 
  onDelete, 
  t 
}: ImageItemProps) => {
  const displayUrl = isTrafficOptimized && img.url.startsWith('http')
    ? `https://steemitimages.com/${galleryView === 'grid' ? '640x0' : '128x128'}/${img.url}`
    : img.url;

  return (
    <div 
      className={cn(
        "group relative rounded-lg overflow-hidden border transition-all cursor-pointer bg-slate-900 flex flex-col shadow-sm flex-none",
        galleryView === 'grid' ? "w-full min-h-[140px]" : "flex-row items-center p-1.5 gap-2 min-h-[50px]",
        img.selected ? "border-cyan-500 ring-1 ring-cyan-500/20" : "border-slate-800 hover:border-slate-700"
      )}
      onClick={() => onToggle(idx)}
    >
      <div className={cn(
        "overflow-hidden relative flex-none bg-slate-950",
        galleryView === 'grid' ? "aspect-square w-full" : "w-10 h-10 rounded"
      )}>
        <img 
          src={displayUrl} 
          alt={img.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          referrerPolicy="no-referrer" 
          loading="lazy"
        />
        
        <div className={cn(
          "absolute inset-x-0 bottom-0 bg-slate-950/90 backdrop-blur-sm px-1 py-1.5 flex flex-row items-center justify-center gap-1 transition-all z-10",
          "lg:opacity-0 lg:group-hover:opacity-100"
        )}>
          <button onClick={(e) => { e.stopPropagation(); onInsert(img.url, img.name, 'left'); }} className="p-1.5 bg-slate-800 rounded flex-1 hover:bg-cyan-600 outline-none text-white transition-colors flex justify-center items-center" title={t('leftText')}><AlignLeft size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onInsert(img.url, img.name, 'plain'); }} className="p-1.5 bg-slate-800 rounded flex-1 hover:bg-cyan-600 outline-none text-white transition-colors flex justify-center items-center" title={t('asIs')}><FileText size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onInsert(img.url, img.name, 'right'); }} className="p-1.5 bg-slate-800 rounded flex-1 hover:bg-cyan-600 outline-none text-white transition-colors flex justify-center items-center" title={t('rightText')}><AlignRight size={12} /></button>
          
          {(!img.url.includes('steemitimages.com') && 
            !img.url.includes('pexels.com') && 
            !img.url.includes('pixabay.com') && 
            !img.url.includes('unsplash.com')) && (
            <button 
              onClick={(e) => { e.stopPropagation(); onHost(img.url, img.name); }} 
              className="p-1.5 bg-slate-800 rounded flex-1 hover:bg-green-600 outline-none text-white transition-colors flex justify-center items-center" 
              title={t('uploadToSteemit')}
            >
              <CloudUpload size={12} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(idx); }} className="p-1.5 bg-slate-800 rounded flex-1 hover:bg-red-600 outline-none text-white transition-colors flex justify-center items-center" title={t('delete')}><Trash2 size={12} /></button>
        </div>
      </div>
      
      <div className={cn(
        "min-w-0 flex flex-col justify-center shrink-0",
        galleryView === 'grid' ? "p-1.5 bg-slate-900" : "flex-1"
      )}>
        <p className="text-[9px] font-medium text-slate-300 truncate leading-tight uppercase tracking-tight">{img.name}</p>
      </div>
    </div>
  );
});

export default ImageItem;
