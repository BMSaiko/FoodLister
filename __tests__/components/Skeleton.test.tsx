import React from 'react';
import { render, screen } from '@testing-library/react';
import Skeleton from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders default restaurant-card variant with count=6', () => {
    const { container } = render(<Skeleton />);
    // Default variant is restaurant-card, default count is 6
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    // 6 skeleton cards should be rendered
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(6);
  });

  it('renders list-card variant', () => {
    const { container } = render(<Skeleton variant="list-card" count={3} />);
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(3);
  });

  it('renders review variant', () => {
    const { container } = render(<Skeleton variant="review" count={2} />);
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(2);
  });

  it('respects custom count', () => {
    const { container } = render(<Skeleton variant="restaurant-card" count={4} />);
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(4);
  });

  it('applies custom className to grid', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const grid = container.querySelector('.custom-class');
    expect(grid).toBeInTheDocument();
  });

  it('has grid layout classes', () => {
    const { container } = render(<Skeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('renders restaurant-card skeleton with image placeholder', () => {
    const { container } = render(<Skeleton variant="restaurant-card" count={1} />);
    // Restaurant card has an image placeholder div
    const imagePlaceholder = container.querySelector('.h-40');
    expect(imagePlaceholder).toBeInTheDocument();
  });

  it('renders list-card skeleton with icon placeholder', () => {
    const { container } = render(<Skeleton variant="list-card" count={1} />);
    // List card has a 12x12 icon placeholder
    const iconPlaceholder = container.querySelector('.h-12.w-12');
    expect(iconPlaceholder).toBeInTheDocument();
  });

  it('renders review skeleton with avatar placeholder', () => {
    const { container } = render(<Skeleton variant="review" count={1} />);
    // Review has a 10x10 avatar placeholder
    const avatarPlaceholder = container.querySelector('.h-10.w-10');
    expect(avatarPlaceholder).toBeInTheDocument();
  });
});
