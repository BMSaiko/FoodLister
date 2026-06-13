import type { Meta, StoryObj } from '@storybook/react';
import PricingCard from '../PricingCard';

const meta: Meta<typeof PricingCard> = {
  title: 'Subscription/PricingCard',
  component: PricingCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlan = {
  id: 'plan-1',
  name: 'Premium',
  description: 'Para utilizadores que querem mais',
  priceMonthly: 4.99,
  priceYearly: 49.99,
  currency: 'EUR',
  features: ['Unlimited lists', 'Unlimited restaurants', 'Advanced filters', 'Priority support', 'No ads'],
  isActive: true,
  sortOrder: 1,
};

export const Default: Story = {
  args: {
    plan: mockPlan,
    isCurrentPlan: false,
    isPopular: false,
    onSubscribe: () => {},
  },
};

export const Popular: Story = {
  args: {
    plan: mockPlan,
    isCurrentPlan: false,
    isPopular: true,
    onSubscribe: () => {},
  },
};

export const CurrentPlan: Story = {
  args: {
    plan: mockPlan,
    isCurrentPlan: true,
    isPopular: false,
    onSubscribe: () => {},
  },
};

const freePlan = {
  id: 'plan-free',
  name: 'Free',
  description: 'Plano gratuito para começar',
  priceMonthly: 0,
  priceYearly: 0,
  currency: 'EUR',
  features: ['5 lists', '20 restaurants', 'Basic filters'],
  isActive: true,
  sortOrder: 0,
};

export const FreePlan: Story = {
  args: {
    plan: freePlan,
    isCurrentPlan: false,
    isPopular: false,
    onSubscribe: () => {},
  },
};

const proPlan = {
  ...mockPlan,
  id: 'plan-pro',
  name: 'Pro',
  description: 'Para power users',
  priceMonthly: 9.99,
  priceYearly: 99.99,
  features: ['Everything in Premium', 'AI recommendations', 'Collaborative lists (10 members)', 'Advanced analytics'],
};

export const ProPlan: Story = {
  args: {
    plan: proPlan,
    isCurrentPlan: false,
    isPopular: false,
    onSubscribe: () => {},
  },
};
