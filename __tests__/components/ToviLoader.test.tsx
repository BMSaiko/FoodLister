import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ToviLoader, { TOVI_MESSAGES } from '@/components/loading/ToviLoader';

describe('ToviLoader', () => {
  it('md: snapshot e estado acessível por defeito', () => {
    const { container } = render(<ToviLoader />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'A carregar');
    expect(container.firstChild).toMatchSnapshot();
  });

  it('sm: versão compacta 40 px sem vapor nem estrela visíveis', () => {
    const { container } = render(<ToviLoader size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveClass('tovi-compact');
    expect(container.firstChild).toMatchSnapshot();
  });

  it('lg com texto: mostra o texto e usa-o como etiqueta', () => {
    const { container } = render(<ToviLoader size="lg" text="A guardar" />);
    expect(screen.getByText('A guardar')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'A guardar');
    expect(container.querySelector('svg')).toHaveAttribute('width', '160');
    expect(container.firstChild).toMatchSnapshot();
  });

  it('rotateMessages: passa à mensagem seguinte a cada 2,6 s', () => {
    jest.useFakeTimers();
    render(<ToviLoader rotateMessages />);
    expect(screen.getByText(TOVI_MESSAGES[0])).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2600);
    });
    expect(screen.getByText(TOVI_MESSAGES[1])).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('text fixo tem prioridade sobre as mensagens rotativas', () => {
    jest.useFakeTimers();
    render(<ToviLoader rotateMessages text="Fixo" />);
    act(() => {
      jest.advanceTimersByTime(5200);
    });
    expect(screen.getByText('Fixo')).toBeInTheDocument();
    jest.useRealTimers();
  });
});
