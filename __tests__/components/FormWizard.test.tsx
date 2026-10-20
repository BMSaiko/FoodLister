import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormStepper, WizardNav } from '@/components/ui/FormWizard';

const STEPS = [
  { id: 1, label: 'Básico' },
  { id: 2, label: 'Etiquetas' },
  { id: 3, label: 'Imagens' },
];

describe('FormStepper', () => {
  it('mostra «Passo 2 de 3 · Etiquetas» como texto visível', () => {
    render(<FormStepper steps={STEPS} currentStep={2} onStepClick={() => {}} />);
    expect(screen.getByText('Passo 2 de 3 · Etiquetas')).toBeInTheDocument();
  });

  it('marca o passo atual com aria-current e dá nome acessível a cada passo', () => {
    render(<FormStepper steps={STEPS} currentStep={2} onStepClick={() => {}} />);
    expect(screen.getByRole('button', { name: /Passo 2: Etiquetas/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /Passo 1: Básico/ })).not.toHaveAttribute('aria-current');
  });

  it('alvos com pelo menos 44 px', () => {
    render(<FormStepper steps={STEPS} currentStep={1} onStepClick={() => {}} />);
    for (const btn of screen.getAllByRole('button')) {
      expect(btn.className).toMatch(/min-h-\[44px\]/);
      expect(btn.className).toMatch(/min-w-\[44px\]/);
    }
  });

  it('passo anterior é clicável', () => {
    const onStepClick = jest.fn();
    render(<FormStepper steps={STEPS} currentStep={3} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Passo 1: Básico/ }));
    expect(onStepClick).toHaveBeenCalledWith(1);
  });
});

describe('WizardNav', () => {
  const base = { currentStep: 2, totalSteps: 3, onPrevious: () => {}, onNext: () => {}, submitLabel: 'Criar' };

  it('fica fixa acima da barra inferior em mobile', () => {
    const { container } = render(<WizardNav {...base} />);
    expect((container.firstChild as HTMLElement).className).toContain('bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))]');
  });

  it('passos intermédios mostram Anterior e Seguinte', () => {
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    render(<WizardNav {...base} onPrevious={onPrevious} onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    fireEvent.click(screen.getByRole('button', { name: /Seguinte/ }));
    expect(onPrevious).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Criar' })).not.toBeInTheDocument();
  });

  it('último passo mostra o botão de submissão em vez de Seguinte', () => {
    render(<WizardNav {...base} currentStep={3} />);
    const submit = screen.getByRole('button', { name: /Criar/ });
    expect(submit).toHaveAttribute('type', 'submit');
    expect(screen.queryByRole('button', { name: /Seguinte/ })).not.toBeInTheDocument();
  });

  it('mostra Cancelar quando há onCancel', () => {
    const onCancel = jest.fn();
    render(<WizardNav {...base} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

import FormField from '@/components/ui/common/FormField';

describe('FormField acessível', () => {
  it('liga o erro ao campo com aria-describedby e aria-invalid', () => {
    render(<FormField label="Website" name="source_url" type="url" value="" onChange={() => {}} error="URL inválido" />);
    const input = screen.getByLabelText('Website');
    expect(input).toHaveAttribute('aria-describedby', 'source_url-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('URL inválido')).toHaveAttribute('id', 'source_url-error');
  });

  it('usa inputMode por tipo e permite autoComplete', () => {
    render(<FormField label="Email" name="email" type="email" value="" onChange={() => {}} autoComplete="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('inputmode', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });
});

describe('WizardNav no penúltimo passo', () => {
  it('clicar em Seguinte para o último passo não submete o formulário', () => {
    const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
    function Wrapper() {
      const [step, setStep] = React.useState(2);
      return (
        <form onSubmit={onSubmit}>
          <WizardNav currentStep={step} totalSteps={3} onPrevious={() => setStep(step - 1)} onNext={() => setStep(step + 1)} submitLabel="Criar" />
        </form>
      );
    }
    render(<Wrapper />);
    fireEvent.click(screen.getByRole('button', { name: /Seguinte/ }));
    expect(screen.getByRole('button', { name: /Criar/ })).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
