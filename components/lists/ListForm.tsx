"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Globe, Lock, Search, Plus, Star, MapPin, ChevronRight, ChevronLeft, Save, Sparkles, Info, Tag, Image, X, Check } from "lucide-react";
import Link from "next/link";
import { VisibilityToggle } from "components/ui/lists/ListFormFields";
import ListTagsInput from "components/ui/lists/ListTagsInput";
import FormSection from "@/components/ui/common/FormSection";
import ListFormProgress from "./ListFormProgress";
import ListFormPreview from "./ListFormPreview";
import ListFormCelebration from "./ListFormCelebration";

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  price_per_person?: number;
  location?: string;
  cuisine_types: any[];
}

interface ListFormData {
  name: string;
  description: string;
  isPublic: boolean;
  cover_image_url: string;
  tags: string[];
}

interface ListFormProps {
  mode: "create" | "edit";
  formData: ListFormData;
  selectedRestaurants: Restaurant[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  backLink: string;
  backText: string;
  onFormChange: (data: Partial<ListFormData>) => void;
  onSubmit: () => void;
  onAddRestaurant: (restaurant: Restaurant) => void;
  onRemoveRestaurant: (restaurantId: string) => void;
  availableRestaurants: Restaurant[];
}

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <Info className="w-5 h-5" />,
  2: <Globe className="w-5 h-5" />,
  3: <Search className="w-5 h-5" />,
  4: <Tag className="w-5 h-5" />,
  5: <Image className="w-5 h-5" />,
  6: <Sparkles className="w-5 h-5" />,
};

export default function ListForm({
  mode, formData, selectedRestaurants, loading, saving, error,
  backLink, backText, onFormChange, onSubmit, onAddRestaurant,
  onRemoveRestaurant, availableRestaurants
}: ListFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [createdListId, setCreatedListId] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const isCreate = mode === "create";

  // Extract unique cuisines from available restaurants
  const availableCuisines = useMemo(() => {
    const map = new Map<string, number>();
    availableRestaurants.forEach(r => {
      (r.cuisine_types || []).forEach((c: any) => {
        const name = c.cuisine_type?.name || c.name || "Outro";
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [availableRestaurants]);

  // Filter restaurants by search + cuisine
  const filteredRestaurants = useMemo(() => {
    return availableRestaurants.filter(r => {
      const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCuisine = !selectedCuisine || (r.cuisine_types || []).some((c: any) =>
        (c.cuisine_type?.name || c.name) === selectedCuisine
      );
      const notSelected = !selectedRestaurants.some(sr => sr.id === r.id);
      return matchesSearch && matchesCuisine && notSelected;
    });
  }, [availableRestaurants, searchQuery, selectedCuisine, selectedRestaurants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    onSubmit();
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ListFormCelebration
        show={showCelebration}
        listId={createdListId}
        listName={formData.name}
        onClose={() => {
          setShowCelebration(false);
          window.location.href = `/lists/${createdListId}`;
        }}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 md:pb-8">
        {/* Back link */}
        <Link href={backLink} className="inline-flex items-center text-white/40 hover:text-purple-400 mb-4 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backText}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
            {isCreate ? "Criar Nova Lista" : "Editar Lista"}
          </h1>
          <p className="text-white/35 mt-1 text-sm">
            {isCreate ? "Reune os teus restaurantes favoritos numa lista personalizada." : "Atualiza os detalhes da tua lista."}
          </p>
        </div>

        {/* Progress */}
        <ListFormProgress currentStep={currentStep} onStepClick={goToStep} />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <FormSection title="Informacoes Basicas" icon={SECTION_ICONS[1]} description="Dá um nome e descrição à tua lista.">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1.5">Nome da Lista *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => onFormChange({ name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                        placeholder="Ex: Melhores restaurantes italianos"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1.5">Descricao</label>
                      <textarea
                        value={formData.description}
                        onChange={e => onFormChange({ description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all resize-none"
                        placeholder="Descreve o tema desta lista..."
                      />
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Step 2: Visibility */}
              {currentStep === 2 && (
                <FormSection title="Visibilidade" icon={SECTION_ICONS[2]} description="Escolhe quem pode ver esta lista.">
                  <VisibilityToggle
                    isPublic={formData.isPublic}
                    onChange={isPublic => onFormChange({ isPublic })}
                  />
                </FormSection>
              )}

              {/* Step 3: Add Restaurants */}
              {currentStep === 3 && (
                <FormSection title="Adicionar Restaurantes" icon={SECTION_ICONS[3]} description="Pesquisa e adiciona restaurantes à tua lista.">
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar por nome..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                      />
                    </div>

                    {/* Cuisine filter */}
                    {availableCuisines.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCuisine(null)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            !selectedCuisine ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25" : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]"
                          }`}
                        >
                          Todas
                        </button>
                        {availableCuisines.map(([name, count]) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setSelectedCuisine(selectedCuisine === name ? null : name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              selectedCuisine === name ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25" : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]"
                            }`}
                          >
                            {name} <span className="text-white/20 ml-0.5">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Restaurant list */}
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                      {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.slice(0, 20).map(r => (
                          <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors">
                            {r.image_url ? (
                              <img src={r.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🍽️</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/75 truncate">{r.name}</p>
                              {r.location && <p className="text-xs text-white/30 truncate">{r.location}</p>}
                            </div>
                            {r.rating != null && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-400/50 flex-shrink-0">
                                <Star className="w-3 h-3 fill-current" />{r.rating.toFixed(1)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onAddRestaurant(r)}
                              className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="p-6 text-center text-sm text-white/25">
                          {searchQuery || selectedCuisine ? "Nenhum restaurante encontrado" : "Pesquisa para adicionar restaurantes"}
                        </p>
                      )}
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Step 4: Cover Image & Tags */}
              {currentStep === 4 && (
                <FormSection title="Capa e Tags" icon={SECTION_ICONS[4]} description="Personaliza a aparência da tua lista.">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1.5">URL da Imagem de Capa</label>
                      <input
                        type="url"
                        value={formData.cover_image_url || ""}
                        onChange={e => onFormChange({ cover_image_url: e.target.value })}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div>
                      <ListTagsInput
                        tags={formData.tags || []}
                        onChange={tags => onFormChange({ tags })}
                        placeholder="Adiciona tags (Enter para confirmar)"
                      />
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Step 5: Selected Restaurants Review */}
              {currentStep === 5 && (
                <FormSection title="Restaurantes Selecionados" icon={SECTION_ICONS[5]} description={`${selectedRestaurants.length} restaurante(s) na tua lista.`}>
                  {selectedRestaurants.length === 0 ? (
                    <div className="text-center py-10">
                      <Search className="h-10 w-10 text-white/10 mx-auto mb-3" />
                      <p className="text-sm text-white/30">Ainda nao adicionaste restaurantes.</p>
                      <button type="button" onClick={() => goToStep(3)} className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Adicionar restaurantes →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {selectedRestaurants.map((r, i) => (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group">
                          <span className="text-xs text-white/20 w-5 text-center font-medium">{i + 1}</span>
                          {r.image_url ? (
                            <img src={r.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">🍽️</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/75 truncate">{r.name}</p>
                            {r.location && <p className="text-xs text-white/30 truncate">{r.location}</p>}
                          </div>
                          {r.rating != null && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-400/50 flex-shrink-0">
                              <Star className="w-3 h-3 fill-current" />{r.rating.toFixed(1)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveRestaurant(r.id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>
              )}

              {/* Step 6: Create */}
              {currentStep === 6 && (
                <FormSection title="Concluir" icon={SECTION_ICONS[6]} description="Revisão final antes de criar a lista.">
                  <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/30">Nome</span>
                        <p className="text-white/80 font-medium truncate">{formData.name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-white/30">Visibilidade</span>
                        <p className="text-white/80 font-medium flex items-center gap-1">
                          {formData.isPublic ? <><Globe className="w-3.5 h-3.5 text-emerald-400" />Publica</> : <><Lock className="w-3.5 h-3.5 text-red-400" />Privada</>}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/30">Restaurantes</span>
                        <p className="text-white/80 font-medium">{selectedRestaurants.length}</p>
                      </div>
                      <div>
                        <span className="text-white/30">Tags</span>
                        <p className="text-white/80 font-medium">{(formData.tags || []).length}</p>
                      </div>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => currentStep > 1 ? goToStep(currentStep - 1) : (window.location.href = backLink)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white/80 transition-colors min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {currentStep === 1 ? "Cancelar" : "Anterior"}
                </button>

                <span className="text-xs text-white/20">{currentStep} de 6</span>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => goToStep(currentStep + 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/15 text-purple-400 text-sm font-semibold rounded-xl hover:bg-purple-500/25 transition-all min-h-[44px]"
                  >
                    Proximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {saving ? "A criar..." : isCreate ? "Criar Lista" : "Guardar"}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}
            </form>
          </div>

          {/* Preview (desktop only) */}
          <div className="hidden lg:block">
            <ListFormPreview
              name={formData.name}
              description={formData.description}
              isPublic={formData.isPublic}
              coverImageUrl={formData.cover_image_url}
              tags={formData.tags || []}
              selectedRestaurants={selectedRestaurants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
