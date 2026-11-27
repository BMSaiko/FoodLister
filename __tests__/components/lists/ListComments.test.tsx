import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ListComments from '@/components/ui/lists/ListComments';

jest.mock('@/hooks/auth/useAuthUser', () => ({ useAuthUser: () => ({ user: null }) }));
jest.mock('@/components/ui/Tooltip', () => ({ TooltipFast: ({ children }: any) => <>{children}</> }));
jest.mock('@/components/ui/common/MentionText', () => ({ __esModule: true, default: ({ text }: any) => <span>{text}</span> }));
jest.mock('@/components/ui/common/MentionInput', () => ({ __esModule: true, default: () => <input /> }));
jest.mock('@/components/loading/ToviSpinner', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('@/components/ui/icons/Icon', () => ({ __esModule: true, default: () => <i /> }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

describe('ListComments fetch', () => {
  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) }));
    (global as any).fetch = fetchMock;
  });

  it('faz um só fetch por listId e outro quando muda', async () => {
    const { rerender } = render(<ListComments listId="a" isOwner={false} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    rerender(<ListComments listId="a" isOwner={false} highlightCommentId="x" />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    rerender(<ListComments listId="b" isOwner={false} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith('/api/lists/b/comments');
  });
});
