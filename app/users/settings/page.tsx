"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/data/useSettings";
import { toast } from "react-toastify";
import Link from "next/link";
import Navbar from "@/components/ui/navigation/Navbar";
import ScrollToTopButton from "@/components/ui/common/ScrollToTopButton";
import FormSection from "@/components/ui/common/FormSection";
import { usePageTitle } from "@/hooks/usePageTitle";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from '@/components/loading/ToviSpinner';
import Icon from '@/components/ui/icons/Icon';

interface FormErrors {
  display_name?: string;
  website?: string;
  bio?: string;
}

interface UserProfile {
  id: string;
  userId?: string;
  userIdCode?: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  website?: string;
  phoneNumber?: string;
  publicProfile: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
}

const SECTION_ICONS: Record<number, React.ReactNode> = {
  1: <Icon name="perfil" className="w-5 h-5" />,
  2: <Icon name="escudo" className="w-5 h-5" />,
  3: <Icon name="faiscas" className="w-5 h-5" /> };

export default function ProfileSettingsPage() {
  const { t } = useLanguage();
  usePageTitle(t("Definições - FoodLister"));
  const { user, loading: authLoading } = useAuthUser();
  const router = useRouter();
  const { profile, loading: profileLoading, error, saveProfile, uploadImage, refreshProfile } = useSettings();

  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile && (!localProfile || profile.id !== localProfile.id)) {
      setLocalProfile(profile);
    }
  }, [profile, localProfile]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) refreshProfile();
  }, [user, refreshProfile]);

  const handleInputChange = (field: string, value: string) => {
    if (localProfile) setLocalProfile({ ...localProfile, [field]: value });
  };

  const handlePrivacyToggle = async () => {
    if (!profile) return;
    try {
      const success = await saveProfile({ publicProfile: !localProfile?.publicProfile });
      if (success) {
        toast.success(localProfile?.publicProfile ? t("Perfil agora é privado!") : t("Perfil agora é público!"));
        if (localProfile) setLocalProfile({ ...localProfile, publicProfile: !localProfile.publicProfile });
      }
    } catch { toast.error(t("Erro ao atualizar privacidade")); }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file);
      if (localProfile) setLocalProfile({ ...localProfile, profileImage: imageUrl });
      await saveProfile({ profileImage: imageUrl });
      toast.success(t("Imagem atualizada!"));
    } catch { toast.error(t("Erro ao carregar imagem")); }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!localProfile?.name || localProfile.name.trim() === "") errors.display_name = t("Nome de exibição é obrigatório");
    if (localProfile?.website && localProfile.website.trim() !== "") {
      try { new URL(localProfile.website); } catch { errors.website = t("Formato de URL inválido"); }
    }
    if (localProfile?.bio && localProfile.bio.length > 500) errors.bio = t("A biografia deve ter no máximo 500 caracteres");
    setFormErrors(errors);
    return Object.keys(errors).length === 0
  ;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error(t("Por favor, corrija os erros")); return; }
    setIsSubmitting(true);
    try {
      const p = localProfile;
      const success = await saveProfile({
        name: p?.name || "", bio: p?.bio || "", profileImage: p?.profileImage || "",
        phoneNumber: p?.phoneNumber || "", website: p?.website || "",
        location: p?.location || "", publicProfile: p?.publicProfile ?? true
   });
      if (success) toast.success(t("Perfil atualizado!"));
    } catch { toast.error(t("Erro ao salvar perfil")); }
    finally { setIsSubmitting(false); }
  };

  // Loading
  // Só no carregamento inicial: guardar/carregar imagem não pode desmontar o formulário
  if (authLoading || (profileLoading && !profile)) {
    return (
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <ToviLoader size="md" rotateMessages />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Icon name="alerta-circulo" className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-white/80 mt-4">{t("Erro ao carregar perfil")}</h1>
          <p className="text-white/40 mt-2 text-sm">{error}</p>
          <button onClick={refreshProfile} className="mt-4 px-5 py-2.5 bg-amber-500/15 text-amber-400 rounded-xl hover:bg-amber-500/25 transition-colors text-sm font-medium">
            {t("Tentar Novamente")}
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Icon name="alerta-circulo" className="h-12 w-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-white/80 mt-4">{t("Perfil não encontrado")}</h1>
          <button onClick={refreshProfile} className="mt-4 px-5 py-2.5 bg-amber-500/15 text-amber-400 rounded-xl hover:bg-amber-500/25 transition-colors text-sm font-medium">
            {t("Tentar Novamente")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] pb-24 md:pb-8">
      <Navbar />

      <div className="container mx-auto px-4 py-6 pb-48 md:pb-28 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{t("Definições")}</h1>
          <p className="text-white/35 mt-1 text-sm">{t("Gere as suas informações pessoais e privacidade")}</p>
        </div>

        <div className="md:grid md:grid-cols-[220px_1fr] md:gap-8 md:items-start">
        {/* Separadores: laterais em desktop, horizontais em mobile */}
        <div role="tablist" aria-label={t("Secções das definições")} aria-orientation="vertical" className="-mx-4 px-4 mb-6 flex gap-2 overflow-x-auto md:mx-0 md:px-0 md:mb-0 md:flex-col md:gap-1 md:sticky md:top-20 md:overflow-visible">
          {[1, 2, 3].map(step => (
            <button
              key={step}
              type="button"
              role="tab"
              id={`settings-tab-${step}`}
              aria-selected={currentStep === step}
              aria-controls="settings-panel"
              onClick={() => setCurrentStep(step)}
              className={`flex-none flex items-center gap-2 px-4 min-h-[44px] rounded-xl text-sm font-medium transition-colors duration-150 ${
                currentStep === step
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                  : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] md:bg-transparent"
              }`}
            >
              {SECTION_ICONS[step]}
              <span>{step === 1 ? t("Perfil") : step === 2 ? t("Privacidade") : t("Estatísticas")}</span>
            </button>
          ))}
          <Link
            href="/users/settings/notifications"
            className="flex-none flex items-center gap-2 px-4 min-h-[44px] rounded-xl text-sm font-medium bg-white/[0.03] text-white/50 hover:bg-white/[0.06] transition-colors md:bg-transparent md:mt-2 md:border-t md:border-white/[0.08] md:rounded-none md:pt-2"
          >
            <Icon name="sino" className="w-5 h-5" />
            <span>{t("Notificações")}</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} role="tabpanel" id="settings-panel" aria-labelledby={`settings-tab-${currentStep}`}>
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Avatar Card */}
              <FormSection title={t("Foto de Perfil")} icon={<Icon name="camara" className="w-5 h-5" />}>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-2 ring-white/[0.08] flex items-center justify-center overflow-hidden">
                      {localProfile?.profileImage ? (
                        <img src={localProfile.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="perfil" className="h-8 w-8 text-white/20" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                      <Icon name="camara" className="h-3.5 w-3.5 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">{t("Clique no icone para alterar a foto")}</p>
                    <p className="text-xs text-white/25 mt-0.5">{t("JPG, PNG ou GIF. Max 5MB.")}</p>
                  </div>
                </div>
              </FormSection>

              {/* Personal Info */}
              <FormSection title={t("Informações Pessoais")} icon={<Icon name="perfil" className="w-5 h-5" />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="settings-name" className="block text-sm font-medium text-white/50 mb-1.5">{t("Nome de Exibição *")}</label>
                      <input
                        id="settings-name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={formErrors.display_name ? true : undefined}
                        aria-describedby={formErrors.display_name ? "settings-name-error" : undefined}
                        value={localProfile?.name || ""}
                        onChange={e => handleInputChange("name", e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors disabled:opacity-50 ${
                          formErrors.display_name ? "border-red-500/50" : "border-white/[0.08]"
                        }`}
                        placeholder={t("O seu nome")}
                        required
                      />
                      {formErrors.display_name && <p id="settings-name-error" role="alert" className="text-red-400 text-xs mt-1">{formErrors.display_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/50 mb-1.5">
                        <Icon name="mail" className="h-3.5 w-3.5 inline mr-1.5 text-white/25" />{t("Email")}
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={user.email || ""}
                        readOnly
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/30 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-white/20 mt-1">{t("O email não pode ser alterado")}</p>
                    </div>

                    <div>
                      <label htmlFor="settings-phone" className="block text-sm font-medium text-white/50 mb-1.5">
                        <Icon name="telefone" className="h-3.5 w-3.5 inline mr-1.5 text-white/25" />{t("Telefone")}
                      </label>
                      <input
                        id="settings-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={localProfile?.phoneNumber || ""}
                        onChange={e => handleInputChange("phoneNumber", e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
                        placeholder="+351 912 345 678"
                      />
                    </div>

                    <div>
                      <label htmlFor="settings-location" className="block text-sm font-medium text-white/50 mb-1.5">
                        <Icon name="pin" className="h-3.5 w-3.5 inline mr-1.5 text-white/25" />{t("Localização")}
                      </label>
                      <input
                        id="settings-location"
                        type="text"
                        autoComplete="address-level2"
                        value={localProfile?.location || ""}
                        onChange={e => handleInputChange("location", e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors disabled:opacity-50"
                        placeholder={t("Porto, Portugal")}
                      />
                    </div>

                    <div>
                      <label htmlFor="settings-website" className="block text-sm font-medium text-white/50 mb-1.5">
                        <Icon name="globo" className="h-3.5 w-3.5 inline mr-1.5 text-white/25" />{t("Website")}
                      </label>
                      <input
                        id="settings-website"
                        type="url"
                        inputMode="url"
                        autoComplete="url"
                        aria-invalid={formErrors.website ? true : undefined}
                        aria-describedby={formErrors.website ? "settings-website-error" : undefined}
                        value={localProfile?.website || ""}
                        onChange={e => handleInputChange("website", e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors disabled:opacity-50 ${
                          formErrors.website ? "border-red-500/50" : "border-white/[0.08]"
                        }`}
                        placeholder="https://o-seu-site.com"
                      />
                      {formErrors.website && <p id="settings-website-error" role="alert" className="text-red-400 text-xs mt-1">{formErrors.website}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="settings-bio" className="block text-sm font-medium text-white/50 mb-1.5">
                        <Icon name="documento" className="h-3.5 w-3.5 inline mr-1.5 text-white/25" />{t("Bio")}
                      </label>
                      <textarea
                        id="settings-bio"
                        aria-invalid={formErrors.bio ? true : undefined}
                        aria-describedby={formErrors.bio ? "settings-bio-error" : undefined}
                        value={localProfile?.bio || ""}
                        onChange={e => handleInputChange("bio", e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors resize-none disabled:opacity-50 ${
                          formErrors.bio ? "border-red-500/50" : "border-white/[0.08]"
                        }`}
                        placeholder={t("Conte um pouco sobre si...")}
                        maxLength={500}
                      />
                      <div className="flex justify-between mt-1">
                        <p className="text-[10px] text-white/20">{t("Máximo 500 caracteres")}</p>
                        <span className="text-[10px] text-white/25">{(localProfile?.bio || "").length}/500</span>
                      </div>
                      {formErrors.bio && <p id="settings-bio-error" role="alert" className="text-red-400 text-xs mt-1">{formErrors.bio}</p>}
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {/* Step 2: Privacy */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormSection title={t("Privacidade do Perfil")} icon={<Icon name="escudo" className="w-5 h-5" />} description={t("Escolha quem pode ver o seu perfil.")}>
                <div className="space-y-3">
            
        {/* Public option */}
                  <button
                    type="button"
                    onClick={() => { if (!localProfile?.publicProfile) handlePrivacyToggle(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors duration-150 text-left ${
                      localProfile?.publicProfile
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      localProfile?.publicProfile ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.04] text-white/30"
                    }`}>
                      <Icon name="globo" className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white/80">{t("Perfil Público")}</p>
                      <p className="text-xs text-white/35 mt-0.5">{t("Qualquer pessoa pode encontrar e ver o seu perfil")}</p>
                    </div>
                    {localProfile?.publicProfile && <Icon name="ok-circulo" className="h-5 w-5 text-amber-400" />}
           
         </button>

                  {/* Private option */}
                  <button
                    type="button"
                    onClick={() => { if (localProfile?.publicProfile) handlePrivacyToggle(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors duration-150 text-left ${
                      !localProfile?.publicProfile
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      !localProfile?.publicProfile ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.04] text-white/30"
                    }`}>
                      <Icon name="olho-off" className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white/80">{t("Perfil Privado")}</p>
                      <p className="text-xs text-white/35 mt-0.5">{t("Apenas você pode ver o seu perfil")}</p>
                    </div>
                    {!localProfile?.publicProfile && <Icon name="ok-circulo" className="h-5 w-5 text-amber-400" />}
                  </button>
                </div>
              </FormSection>

              {/* View profile link */}
              {localProfile?.userIdCode && (
                <Link
                  href={`/users/${localProfile.userIdCode}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Icon name="olho" className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/70">{t("Ver Perfil Público")}</p>
                    <p className="text-xs text-white/30">{t("Como outros utilizadores veem o seu perfil")}</p>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Step 3: Stats */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <FormSection title={t("Estatísticas")} icon={<Icon name="faiscas" className="w-5 h-5" />} description={t("O seu impacto na comunidade FoodLister.")}>
                <div className="grid grid-cols-2 gap-3">

                  <div className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Icon name="estrela" className="h-5 w-5 text-amber-400" />
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{localProfile?.stats?.totalReviews || 0}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{t("Reviews")}</p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Icon name="lista" className="h-5 w-5 text-amber-400" />
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{localProfile?.stats?.totalLists || 0}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{t("Listas")}</p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Icon name="perfil" className="h-5 w-5 text-amber-400" />
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{localProfile?.stats?.totalRestaurantsAdded || 0}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{t("Adicionados")}</p>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Ações: pílula flutuante acima da barra inferior em mobile */}
          <div className="pointer-events-none fixed inset-x-0 z-30 px-4 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+12px)] md:bottom-6">
            <div className="max-w-4xl mx-auto flex justify-center md:justify-end">
              <div role="group" aria-label={t("Ações do formulário")} className="pointer-events-auto inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#151515]/90 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/50">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.06] rounded-full transition-colors min-h-[44px]"
                >
                  {t("Cancelar")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  {isSubmitting && <ToviSpinner className="w-4 h-4" />}
                  {isSubmitting ? t("A guardar...") : t("Guardar")}
                </button>
              </div>
            </div>
          </div>
        </form>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}