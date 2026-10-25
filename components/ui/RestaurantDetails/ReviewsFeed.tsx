import EmptyState from "@/components/ui/EmptyState";
import React, { useState, useEffect, forwardRef, useRef } from "react";
import { Star, Edit, Trash2 } from "lucide-react";
import { Review } from "@/libs/types";
import { formatDate, formatPrice } from "@/utils/formatters";
import { toast } from "react-toastify";
import Link from "next/link";
import ReviewForm from "./ReviewForm";
import TruncateText from "@/components/ui/common/TruncateText";
import ReportButton from "@/components/ui/common/ReportButton";

interface ReviewsFeedProps {
  restaurantId: string;
  reviews: Review[];
  reviewCount: number;
  user?: any;
  userProfile?: { display_name?: string; avatar_url?: string; isAdmin?: boolean } | null;
  loading?: boolean;
  onReviewSubmitted: (r: Review) => void;
  onEditReview: (r: Review) => void;
  onDeleteReview: (id: string) => void;
  restaurantRating?: number;
  highlightReviewId?: string;
  /** Incrementar para abrir o formulário de avaliação (botão «Avaliar» do topo). */
  openFormSignal?: number;
}

const ReviewsFeed = forwardRef<HTMLDivElement, ReviewsFeedProps>((props, ref) => {
  const { restaurantId, reviews, reviewCount, user, userProfile, loading, onReviewSubmitted, onEditReview, onDeleteReview, restaurantRating, highlightReviewId, openFormSignal = 0 } = props;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openFormSignal > 0 && user) setShowForm(true);
  }, [openFormSignal, user]);

  useEffect(() => {
    if ((editing || showForm) && formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing, showForm]);

  // Scroll to highlighted review (from ?review=XXX param) + visual highlight
  useEffect(() => {
    if (!highlightReviewId || reviews.length === 0) return;
    const el = document.getElementById(`review-${highlightReviewId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-500', 'rounded-2xl');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500', 'rounded-2xl'), 3000);
    }
  }, [highlightReviewId, reviews]);

  const handleSubmitted = (r: Review) => { onReviewSubmitted(r); setShowForm(false); setEditing(null); };
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta avaliação?")) return;
    try { onDeleteReview(id); } catch { toast.error("Erro ao eliminar avaliação."); }
  };

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviewCount > 0 ? (reviews.filter(rev => rev.rating === r).length / reviewCount) * 100 : 0
  }));

  return (
    <section ref={ref} className="mt-11 mb-8 scroll-mt-20" id="reviews">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
          Avaliações
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] tracking-normal text-white/50">{reviewCount}</span>
        </h2>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all duration-200 text-sm font-semibold min-h-[44px] hover:scale-105">
            <Star className="h-4 w-4 fill-current" /><span>Avaliar</span>
          </button>
        )}
      </div>

      {/* Rating Summary Hero */}
      {reviewCount > 0 && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-center gap-5">
            {/* Big rating number */}
            <div className="flex-shrink-0">
              <div className="leading-none"><span className="text-5xl font-light tracking-[-0.04em] text-white">{(restaurantRating || 0).toFixed(1)}</span><span className="ml-1.5 text-sm text-white/35">/ 5</span></div>
              <div className="flex items-center gap-0.5 mt-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={"h-4 w-4 " + (i < Math.round(restaurantRating || 0) ? "text-amber-400 fill-current" : "text-white/15")} />
                ))}
              </div>
            </div>
            {/* Distribution bars */}
            <div className="space-y-1.5">
              {ratingDist.map(d => (
                <div key={d.rating} className="flex items-center gap-2.5">
                  <span className="text-xs text-white/35 w-3 text-right">{d.rating}</span>
                  <div className="flex-1 h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out" style={{ width: d.pct + "%" }} />
                  </div>
                  <span className="text-xs text-white/40 w-4 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {(showForm || editing) && (
        <div ref={formRef} className="mb-4">
          <ReviewForm restaurantId={restaurantId} onReviewSubmitted={handleSubmitted} onCancel={() => { setShowForm(false); setEditing(null); }} isEditing={!!editing} initialReview={editing || undefined} />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-2xl bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 bg-white/[0.06] rounded-full" /><div className="h-4 bg-white/[0.06] rounded w-24" /></div>
              <div className="h-4 bg-white/[0.06] rounded w-full mb-2" /><div className="h-4 bg-white/[0.06] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          mascot="a-dormir"
          title="Ainda sem avaliações"
          description="Seja o primeiro a partilhar a sua experiência."
          className="rounded-3xl bg-white/[0.02] border border-white/[0.04]"
          action={user && !showForm ? (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center px-5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-colors text-sm font-semibold">
              <Star className="h-4 w-4 mr-2 fill-current" />Fazer avaliação
            </button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <div key={review.id + "-" + i} id={"review-" + review.id} className="group p-[18px] rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors duration-300">
              <div className="flex items-start gap-3">
                {review.user.profileImage ? (
                  <img src={review.user.profileImage} alt={review.user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/[0.06] flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center ring-1 ring-amber-500/15 flex-shrink-0">
                    <span className="text-amber-400 font-semibold text-sm">{review.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <Link href={"/users/" + (review.user.userIdCode || review.user_id)} className="font-semibold text-white/90 text-sm hover:text-amber-400 transition-colors duration-150">{review.user.name}</Link>
                      <div className="text-xs text-white/35 mt-0.5">{formatDate(review.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {Array(5).fill(0).map((_, si) => (<Star key={si} className={"h-3.5 w-3.5 " + (si < review.rating ? "text-amber-400 fill-current" : "text-white/15")} />))}
                    </div>
                  </div>
                  {review.comment && <TruncateText text={review.comment} maxLength={150} highlightMentions className="text-sm text-white/50 leading-relaxed" />}
                  {review.amount_spent != null && <p className="mt-2.5 text-[13px] text-white/35">Gastou {formatPrice(review.amount_spent)}</p>}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((img, ii) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={img + ii} src={img} alt="" className="h-[84px] w-[84px] rounded-[10px] object-cover" />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-[13px]">
                    {user && <ReportButton targetType="review" targetId={review.id} label="Denunciar" />}
                    {user && (review.user_id === user.id || userProfile?.isAdmin) && (
                      <>
                        <button onClick={() => { setEditing(review); setShowForm(true); }} className="flex items-center gap-1.5 min-h-[32px] text-white/55 hover:text-amber-400 transition-colors"><Edit className="h-3.5 w-3.5" />Editar</button>
                        <button onClick={() => handleDelete(review.id)} className="flex items-center gap-1.5 min-h-[32px] text-red-400 hover:text-red-300 transition-colors"><Trash2 className="h-3.5 w-3.5" />Eliminar</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

ReviewsFeed.displayName = "ReviewsFeed";
export default ReviewsFeed;
