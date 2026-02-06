import React, { useState, useEffect } from 'react';
import { Star, Euro, X } from 'lucide-react';
import { Review, ReviewFormData } from '@/libs/types';
import FormField from '@/components/ui/common/FormField';
import FormActions from '@/components/ui/common/FormActions';
import { toast } from 'react-toastify';

interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmitted: (review: Review) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialReview?: Review;
}

export default function ReviewForm({
  restaurantId,
  onReviewSubmitted,
  onCancel,
  isEditing = false,
  initialReview
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: initialReview?.rating || 0,
    comment: initialReview?.comment || '',
    amount_spent: initialReview?.amount_spent || undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialReview changes (for editing)
  useEffect(() => {
    if (initialReview) {
      setFormData({
        rating: initialReview.rating,
        comment: initialReview.comment || '',
        amount_spent: initialReview.amount_spent || undefined
      });
    }
  }, [initialReview]);

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount_spent') {
      // Only allow numeric values for amount spent
      const numericValue = value === '' ? undefined : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Por favor, selecione uma classificação de 1 a 5 estrelas';
    }

    if (formData.amount_spent !== undefined && (formData.amount_spent <= 0 || isNaN(formData.amount_spent))) {
      newErrors.amount_spent = 'O valor gasto deve ser maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditing && initialReview 
        ? `/api/reviews/${initialReview.id}`
        : `/api/reviews`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          rating: formData.rating,
          comment: formData.comment || null,
          amount_spent: formData.amount_spent || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const result = await response.json();
      
      if (result.review) {
        onReviewSubmitted(result.review);
        
        // Show success message
        toast.success(
          isEditing 
            ? 'Avaliação atualizada com sucesso!' 
            : 'Avaliação enviada com sucesso!',
          {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            className: "text-sm sm:text-base"
          }
        );
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      toast.error(
        isEditing 
          ? 'Erro ao atualizar avaliação. Tente novamente.' 
          : 'Erro ao enviar avaliação. Tente novamente.',
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          className: "text-sm sm:text-base"
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to initial state
    if (initialReview) {
      setFormData({
        rating: initialReview.rating,
        comment: initialReview.comment || '',
        amount_spent: initialReview.amount_spent || undefined
      });
    } else {
      setFormData({
        rating: 0,
        comment: '',
        amount_spent: undefined
      });
    }
    setErrors({});
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditing ? 'Editar Avaliação' : 'Avaliar Restaurante'}
        </h3>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Cancelar"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Classificação <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1;
              const isActive = formData.rating >= starValue;
              
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => handleRatingClick(starValue)}
                  className={`transition-all duration-200 ${
                    isActive 
                      ? 'text-amber-400 hover:text-amber-500' 
                      : 'text-gray-300 hover:text-amber-300'
                  }`}
                  title={`Classificar ${starValue} estrela${starValue > 1 ? 's' : ''}`}
                >
                  <Star 
                    className={`h-8 w-8 sm:h-10 w-10 ${
                      isActive ? 'fill-current' : 'stroke-current'
                    }`} 
                  />
                </button>
              );
            })}
            <span className="ml-4 text-sm text-gray-600 font-medium">
              {formData.rating > 0 ? `${formData.rating}/5` : 'Selecione uma classificação'}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Comment Field */}
        <FormField
          label="Comentário"
          name="comment"
          type="textarea"
          value={formData.comment || ''}
          onChange={handleInputChange}
          placeholder="Compartilhe sua experiência neste restaurante..."
          rows={4}
          helperText="Descreva sua visita, o que gostou ou não gostou, recomendações, etc."
        />

        {/* Amount Spent Field */}
        <FormField
          label="Valor Gasto"
          name="amount_spent"
          type="number"
          value={formData.amount_spent !== undefined ? formData.amount_spent.toString() : ''}
          onChange={handleInputChange}
          placeholder="0.00"
          icon={Euro}
          helperText="Valor total gasto na visita (opcional)"
        />
        {errors.amount_spent && (
          <p className="mt-2 text-sm text-red-600">{errors.amount_spent}</p>
        )}

        {/* Form Actions */}
        <FormActions
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          submitText={isEditing ? "Atualizar Avaliação" : "Enviar Avaliação"}
          cancelText="Cancelar"
        />
      </form>
    </div>
  );
}