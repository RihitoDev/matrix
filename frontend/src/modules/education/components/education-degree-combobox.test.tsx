import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { getEducationDegrees } from '../utils/resolve-education-degree';
import { EducationDegreeCombobox } from './education-degree-combobox';

function Field({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState('');
  return <><label htmlFor="degree">Título o carrera</label><EducationDegreeCombobox id="degree" value={value}
    degrees={getEducationDegrees('Universidad Mayor de San Simón (UMSS)')} disabled={disabled} onChange={setValue} />
    <button type="button">Outside</button></>;
}

describe('EducationDegreeCombobox', () => {
  afterEach(cleanup);

  it('opens the list, filters by an accent-insensitive alias and selects with the mouse', async () => {
    const user = userEvent.setup();
    render(<Field />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getAllByRole('option').length).toBeGreaterThan(1);
    await user.type(input, 'ingenieria de infor');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.click(screen.getByRole('option', { name: 'Ingeniería Informática' }));
    expect(input).toHaveValue('Ingeniería Informática');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports arrow selection, Enter, Escape and closing on blur', async () => {
    const user = userEvent.setup();
    render(<Field />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant');
    await user.keyboard('{Enter}');
    expect(input).not.toHaveValue('');
    await user.click(input);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows no matches for arbitrary text and restores options when cleared', async () => {
    const user = userEvent.setup();
    render(<Field />);
    await user.type(screen.getByRole('combobox'), 'unknown');
    expect(screen.getByRole('status')).toHaveTextContent('No se encontraron carreras');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await user.clear(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').length).toBeGreaterThan(1);
  });

  it('cannot open or edit a disabled field', async () => {
    const user = userEvent.setup();
    render(<Field disabled />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
