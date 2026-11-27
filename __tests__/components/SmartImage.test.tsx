import { render } from '@testing-library/react';
import SmartImage from '@/components/ui/common/SmartImage';

describe('SmartImage', () => {
  it('usa next/image para domínio permitido', () => {
    const { container } = render(<SmartImage src="https://images.unsplash.com/a.jpg" alt="a" sizes="100px" />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain('/_next/image');
  });
  it('cai para <img> com domínio desconhecido', () => {
    const { container } = render(<SmartImage src="https://outro.example.com/a.jpg" alt="a" sizes="100px" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://outro.example.com/a.jpg');
  });
});
