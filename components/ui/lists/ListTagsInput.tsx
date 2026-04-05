"use client";

import React, { useState, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';

interface ListTagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TAG_COLORS = [
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
];

export default function ListTagsInput({ tags, onChange, placeholder = 'Adicionar tag...' }: ListTagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Tag className="h-4 w-4" />
        <span>Tags</span>
      </div>
      
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg bg-white">
        {tags.map((tag, index) => {
          const color = TAG_COLORS[index % TAG_COLORS.length];
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Remover tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Pressione Enter para adicionar, Backspace para remover
      </p>
    </div>
  );
}