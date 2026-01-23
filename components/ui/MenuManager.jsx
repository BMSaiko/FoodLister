import React, { useState, useEffect } from 'react';
import { X, Plus, Link as LinkIcon, Image as ImageIcon, AlertCircle, Globe, FileText } from 'lucide-react';
import ImageUploader from './ImageUploader';
import Image from 'next/image';

/**
 * MenuManager component - simplified version using only standard React/Next.js
 * Supports up to 5 external links and 10 uploaded images
 */
export default function MenuManager({
  menuLinks = [],
  menuImages = [],
  onMenuLinksChange,
  onMenuImagesChange,
  disabled = false
}) {
  // Local state for managing images (simplified approach)
  const [localImages, setLocalImages] = useState(Array.isArray(menuImages) ? menuImages : []);

  // Tab state
  const [activeTab, setActiveTab] = useState('links');

  // Sync local images with parent when they change
  useEffect(() => {
    setLocalImages(Array.isArray(menuImages) ? menuImages : []);
  }, [menuImages]);

  // Sync local images back to parent
  useEffect(() => {
    onMenuImagesChange(localImages);
  }, [localImages, onMenuImagesChange]);

  // Ensure menuLinks is always an array
  const safeMenuLinks = Array.isArray(menuLinks) ? menuLinks : [];

  // State for link input
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');

  // Validate URL format
  const validateUrl = (url) => {
    if (!url || url.trim() === '') return true;
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  // Add a new link
  const handleAddLink = () => {
    const trimmedLink = linkInput.trim();
    if (!trimmedLink) {
      setLinkError('Por favor, insira um link válido');
      return;
    }

    if (!validateUrl(trimmedLink)) {
      setLinkError('Por favor, insira um URL válido (começando com http:// ou https://)');
      return;
    }

    if (safeMenuLinks.length >= 5) {
      setLinkError('Máximo de 5 links permitidos');
      return;
    }

    if (safeMenuLinks.includes(trimmedLink)) {
      setLinkError('Este link já foi adicionado');
      return;
    }

    const newLinks = [...safeMenuLinks, trimmedLink];
    onMenuLinksChange(newLinks);
    setLinkInput('');
    setLinkError('');
  };

  // Remove a link
  const handleRemoveLink = (index) => {
    const newLinks = safeMenuLinks.filter((_, i) => i !== index);
    onMenuLinksChange(newLinks);
  };

  // Add an image (using local state)
  const handleImageUploaded = (imageUrl) => {
    if (localImages.length >= 10) {
      return; // Safety check
    }
    setLocalImages(prev => [...prev, imageUrl]);
  };

  // Remove an image
  const handleRemoveImage = (index) => {
    setLocalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Enter key in link input
  const handleLinkKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex border-b border-amber-200 bg-amber-50/30 rounded-t-lg">
        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'links'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-white rounded-t-lg'
              : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50/50'
          }`}
        >
          <Globe className="h-4 w-4 mr-2" />
          Links Externos
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'links' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {safeMenuLinks.length}/5
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'images'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-white rounded-t-lg'
              : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50/50'
          }`}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Imagens do Menu
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'images' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {localImages.length}/10
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg border border-t-0 border-amber-200 p-6">
        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                    if (linkError) setLinkError('');
                  }}
                  onKeyPress={handleLinkKeyPress}
                  placeholder="https://exemplo.com/menu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  disabled={disabled || safeMenuLinks.length >= 5}
                />
                {linkError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {linkError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                disabled={disabled || safeMenuLinks.length >= 5 || !linkInput.trim()}
                className="flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Link
              </button>
            </div>

            {/* Links List */}
            {safeMenuLinks.length > 0 ? (
              <div className="space-y-3">
                {safeMenuLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-200 transition-colors">
                    <LinkIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:text-blue-800 hover:underline truncate font-medium"
                    >
                      {link}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Remover link"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-6 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200">
                <Globe className="h-8 w-8 mx-auto text-amber-400 mb-3" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Nenhum link adicionado</h3>
                <p className="text-sm text-amber-600">Adicione links externos para menus do restaurante</p>
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            {/* Image Uploader */}
            {localImages.length < 10 && !disabled && (
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                maxFiles={10 - localImages.length}
              />
            )}

            {/* Images Grid */}
            {localImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {localImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <Image
                        src={imageUrl}
                        alt={`Menu ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                      title="Remover imagem"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-6 bg-amber-50/50 rounded-xl border-2 border-dashed border-amber-200">
                <ImageIcon className="h-8 w-8 mx-auto text-amber-400 mb-3" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Nenhuma imagem adicionada</h3>
                <p className="text-sm text-amber-600">Faça upload de imagens dos menus do restaurante</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 text-center space-y-1 bg-gray-50 p-3 rounded-lg">
        <p>• Links externos: {safeMenuLinks.length}/5 máximo</p>
        <p>• Imagens do menu: {localImages.length}/10 máximo</p>
        <p>• Menus são opcionais - você pode adicionar links, imagens ou ambos</p>
      </div>
    </div>
  );
}
