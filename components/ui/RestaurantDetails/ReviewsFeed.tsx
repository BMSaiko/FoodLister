import React, { useState, useEffect, forwardRef, useRef } from "react";
import { Star, Edit, X, MessageSquare } from "lucide-react";
import { Review } from "@/libs/types";
import { formatDate } from "@/utils/formatters";
import { toast } from "react-toastify";
import Link from "next/link";
import ReviewForm from "./ReviewForm";

interface ReviewsFeedProps {
  restaurantId: string;
  reviews: Review[];
  reviewCount: number;
  user?: any;
  loading?: boolean;
  onReviewSubmitted: (r: Review) => void;
  onEditReview: (r: Review) => void;
  onDeleteReview: (id: string) => void;
  restaurantRating?: number;
}

const ReviewsFeed = forwardRef<HTMLDivElement, ReviewsFeedProps>((props, ref) => {
  const { restaurantId, reviews, reviewCount, user, loading, onReviewSubmitted, onEditReview, onDeleteReview, restaurantRating } = props;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing]);

  const handleSubmitted = (r: Review) => { onReviewSubmitted(r); setShowForm(false); setEditing(null); };
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta avaliacao?")) return;
    try { onDeleteReview(id); } catch { toast.error("Erro ao eliminar avaliacao."); }
  };

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviewCount > 0 ? (reviews.filter(rev => rev.rating === r).length / reviewCount) * 100 : 0
  }));

  return (
    <section ref={ref} className="mb-8" id="reviews">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Avaliacoes</h2>
          <p className="text-xs text-white/35 mt-0.5">{reviewCount} avaliacao{reviewCount !== 1 ? "oes" : ""}</p>
        </div>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all duration-200 text-sm font-semibold min-h-[44px] hover:scale-105">
            <Star className="h-4 w-4 fill-current" /><span>Avaliar</span>
          </button>
        )}
      </div>

      {/* Rating Summary Hero */}
      {reviewCount > 0 && (
        <div className="p-5 md:p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] mb-6">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Big rating number */}
            <div className="text-center flex-shrink-0">
              <div className="text-5xl md:text-6xl font-bold text-amber-400 leading-none">{(restaurantRating || 0).toFixed(1)}</div>
              <div className="flex items-center gap-0.5 mt-2 justify-center">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={"h-4 w-4 " + (i < Math.round(restaurantRating || 0) ? "text-amber-400 fill-current" : "text-white/15")} />
                ))}
              </div>
            </div>
            {/* Distribution bars */}
            <div className="flex-1 space-y-2">
              {ratingDist.map(d => (
                <div key={d.rating} className="flex items-center gap-2.5">
                  <span className="text-xs text-white/35 w-3 text-right font-medium">{d.rating}</span>
                  <Star className="h-3 w-3 text-amber-400/40 fill-current flex-shrink-0" />
                  <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400/40 rounded-full transition-all duration-700 ease-out" style={{ width: d.pct + "%" }} />
                  </div>
                  <span className="text-xs text-white/25 w-6 text-right font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {(showForm || editing) && (
        <div ref={formRef} className="mb-6">
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
        <div className="text-center py-14 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
          <MessageSquare className="h-14 w-14 text-white/[0.06] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/45 mb-2">Nenhuma avaliacao ainda</h3>
          <p className="text-sm text-white/25 mb-5">Seja o primeiro a partilhar a sua experiencia!</p>
          {user && !showForm && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center px-5 py-2.5 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all duration-200 text-sm font-semibold hover:scale-105">
              <Star className="h-4 w-4 mr-2 fill-current" />Fazer avaliacao
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <div key={review.id + "-" + i} id={"review-" + review.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200">
              <div className="flex items-start gap-3">
                {review.user.profileImage ? (
                  <img src={review.user.profileImage} alt={review.user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/[0.06] flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center ring-1 ring-amber-500/15 flex-shrink-0">
                    <span className="text-amber-400 font-semibold text-sm">{review.user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <Link href={"/users/" + (review.user.userIdCode || review.user_id)} className="font-semibold text-white/85 text-sm hover:text-amber-400 transition-colors duration-150">{review.user.name}</Link>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array(5).fill(0).map((_, si) => (<Star key={si} className={"h-3 w-3 " + (si < review.rating ? "text-amber-400 fill-current" : "text-white/12")} />))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/20">{formatDate(review.created_at)}</span>
                      {user && review.user_id === user.id && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => { setEditing(review); setShowForm(true); }} className="p-1.5 text-white/25 hover:text-amber-400 hover:bg-white/[0.04] rounded-lg transition-all duration-150"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(review.id)} className="p-1.5 text-white/25 hover:text-red-400 hover:bg-white/[0.04] rounded-lg transition-all duration-150"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>}
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
