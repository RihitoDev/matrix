import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EducationInstitutionCombobox } from './education-institution-combobox';

const INSTITUTIONS = [
  { name: 'Universidad Mayor de San Simón (UMSS)', aliases: ['UMSS'] },
  { name: 'Universidad Privada Boliviana (UPB)', aliases: ['UPB'] },
];

function Field({ disabled = false, onSubmit = vi.fn() }) {
  const [value, setValue] = useState('');
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <Label htmlFor="institution">Institución</Label>
      <EducationInstitutionCombobox id="institution" value={value} institutions={INSTITUTIONS} disabled={disabled} onChange={setValue} />
      <Button type="button">Fuera del selector</Button>
    </form>
  );
}

function setup(disabled = false) {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<Field disabled={disabled} onSubmit={onSubmit} />);
  return { user, onSubmit, input: screen.getByRole('combobox', { name: 'Institución' }) };
}

describe('EducationInstitutionCombobox', () => {
  afterEach(cleanup);

  it.each(['umss', 'san simon'])('filters by alias or accent-insensitive name: %s', async (query) => {
    const { user, input } = setup();
    await user.click(input);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.type(input, query);
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.click(screen.getByRole('option', { name: INSTITUTIONS[0].name }));
    expect(input).toHaveValue(INSTITUTIONS[0].name);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['{ArrowDown}', INSTITUTIONS[0].name],
    ['{ArrowUp}', INSTITUTIONS[1].name],
  ])('selects with %s and Enter without submitting the form', async (key, name) => {
    const { user, input, onSubmit } = setup();
    await user.click(input);
    await user.keyboard(key);
    expect(input).toHaveAttribute('aria-activedescendant');
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(name);
    await user.keyboard('{Enter}');
    expect(input).toHaveValue(name);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('closes on Escape and when focus leaves the selector', async () => {
    const { user, input } = setup();
    await user.click(input);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Fuera del selector' }));
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows no matches for arbitrary text and restores the list when cleared', async () => {
    const { user, input } = setup();
    await user.type(input, 'gggggg');
    expect(screen.getByRole('status')).toHaveTextContent('No se encontraron universidades.');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await user.clear(input);
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('does not allow interaction while disabled', async () => {
    const { user, input } = setup(true);
    await user.click(input);
    expect(input).toBeDisabled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
