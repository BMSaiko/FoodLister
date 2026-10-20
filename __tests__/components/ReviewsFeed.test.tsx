import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewsFeed from '@/components/ui/RestaurantDetails/ReviewsFeed';

jest.mock('@/components/ui/RestaurantDetails/ReviewForm', () => ({ __esModule: true, default: () => <div data-testid="review-form" /> }));

const base = {
  restaurantId: 'r1', reviews: [], reviewCount: 0, user: { id: 'u1' },
  onReviewSubmitted: jest.fn(), onEditReview: jest.fn(), onDeleteReview: jest.fn(),
};

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

describe('ReviewsFeed openFormSignal', () => {
  it('abre o formulário quando o sinal incrementa', () => {
    const { rerender } = render(<ReviewsFeed {...base} openFormSignal={0} />);
    expect(screen.queryByTestId('review-form')).toBeNull();
    rerender(<ReviewsFeed {...base} openFormSignal={1} />);
    expect(screen.getByTestId('review-form')).toBeTruthy();
  });
});
