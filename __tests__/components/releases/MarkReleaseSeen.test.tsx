import React from 'react';
import { render } from '@testing-library/react';
import MarkReleaseSeen from '@/components/releases/MarkReleaseSeen';
import { SEEN_KEY } from '@/hooks/releases/useUnseenRelease';

jest.mock('@/libs/supabase/client', () => ({
  getClient: () => ({
    from: () => ({ select: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }),
  }),
}));

it('abrir a página da release grava a versão como vista', () => {
  localStorage.clear();
  render(<MarkReleaseSeen version="1.4.0" />);
  expect(localStorage.getItem(SEEN_KEY)).toBe('1.4.0');
});
