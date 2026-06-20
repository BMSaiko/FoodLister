import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListExportButtons from '@/components/ui/lists/ListExportButtons';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  FileJson: () => <span data-testid="file-json-icon" />,
  FileSpreadsheet: () => <span data-testid="file-spreadsheet-icon" />,
  FileText: () => <span data-testid="file-text-icon" />,
  Download: () => <span data-testid="download-icon" />,
}));

// Mock listExport utils
jest.mock('@/utils/listExport', () => ({
  exportListAsJSON: jest.fn(),
  exportListAsCSV: jest.fn(),
  exportListAsPDF: jest.fn(),
}));

const mockList = { id: 'list-1', name: 'My Test List', description: 'A test list' };
const mockRestaurants = [
  { id: 'r1', name: 'Restaurant A', location: 'Lisboa', rating: 4.5 },
  { id: 'r2', name: 'Restaurant B', location: 'Porto', rating: 3.8 },
];

// Mock window.open
const windowOpenMock = jest.fn();
beforeAll(() => {
  Object.defineProperty(window, 'open', { value: windowOpenMock, writable: true });
});

afterEach(() => {
  windowOpenMock.mockClear();
});

describe('ListExportButtons', () => {
  it('renders all export buttons', () => {
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    expect(screen.getByLabelText(/exportar lista como json/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exportar lista como csv/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exportar lista como pdf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/download json via api/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/download csv via api/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/download html via api/i)).toBeInTheDocument();
  });

  it('calls exportListAsJSON when JSON button is clicked', () => {
    const { exportListAsJSON } = require('@/utils/listExport');
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/exportar lista como json/i));
    expect(exportListAsJSON).toHaveBeenCalledWith(mockList, mockRestaurants);
  });

  it('calls exportListAsCSV when CSV button is clicked', () => {
    const { exportListAsCSV } = require('@/utils/listExport');
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/exportar lista como csv/i));
    expect(exportListAsCSV).toHaveBeenCalledWith(mockList, mockRestaurants);
  });

  it('calls exportListAsPDF when PDF button is clicked', () => {
    const { exportListAsPDF } = require('@/utils/listExport');
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/exportar lista como pdf/i));
    expect(exportListAsPDF).toHaveBeenCalledWith(mockList, mockRestaurants);
  });

  it('opens API download URL when API JSON button is clicked', () => {
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/download json via api/i));
    expect(windowOpenMock).toHaveBeenCalledWith(
      '/api/lists/list-1/export?format=json',
      '_blank'
    );
  });

  it('opens API download URL when API CSV button is clicked', () => {
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/download csv via api/i));
    expect(windowOpenMock).toHaveBeenCalledWith(
      '/api/lists/list-1/export?format=csv',
      '_blank'
    );
  });

  it('opens API download URL when API HTML button is clicked', () => {
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    fireEvent.click(screen.getByLabelText(/download html via api/i));
    expect(windowOpenMock).toHaveBeenCalledWith(
      '/api/lists/list-1/export?format=html',
      '_blank'
    );
  });

  it('has correct aria-label on the group container', () => {
    render(<ListExportButtons list={mockList} restaurants={mockRestaurants} />);

    const group = screen.getByRole('group', { name: /opções de exportação/i });
    expect(group).toBeInTheDocument();
  });
});
