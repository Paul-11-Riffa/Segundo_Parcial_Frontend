import { describe, it, expect } from 'vitest';
import parseApiError from '../errorParser';

describe('parseApiError', () => {
  it('returns string message when passed a string', () => {
    const out = parseApiError('algo falló');
    expect(out).toEqual({ message: 'algo falló' });
  });

  it('parses axios-style detail field', () => {
    const err = { response: { data: { detail: 'No autorizado' } } };
    const out = parseApiError(err);
    expect(out).toEqual({ message: 'No autorizado' });
  });

  it('parses validation object into details and message', () => {
    const err = { response: { data: { name: ['Este campo es obligatorio'], email: ['Formato inválido'] } } };
    const out = parseApiError(err);
    expect(out.message).toContain('name: Este campo es obligatorio');
    expect(out.message).toContain('email: Formato inválido');
    expect(out.details).toBeTruthy();
    expect(out.details.name).toEqual(['Este campo es obligatorio']);
  });

  it('handles array of errors', () => {
    const err = { response: { data: ['error1', 'error2'] } };
    const out = parseApiError(err);
    expect(out.message).toBe(String('error1'));
  });

  it('falls back to err.message when no data', () => {
    const err = { message: 'Network error' };
    const out = parseApiError(err);
    expect(out.message).toBe('Network error');
  });
});
