import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to mock the shared api module that voiceCommandService imports.
// From this test file (src/services/admin/__tests__), the api module is at '../../api'
vi.mock('../../api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn()
    }
  };
});

import api from '../../api';
import { downloadReport, getCommandDetails } from '../../admin/voiceCommandService';

describe('voiceCommandService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Provide minimal DOM globals for tests (jsdom may not be enabled)
    // Ensure `window` exists and points to the global object so service code that references
    // `window.open` or `window.URL` works in this environment.
    if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
    if (typeof globalThis.document === 'undefined') {
      globalThis.document = {
        createElement: () => ({
          href: '',
          setAttribute: () => {},
          click: () => {},
          remove: () => {}
        }),
        body: { appendChild: () => {} }
      };
    }
  });

  it('opens absolute URLs in a new tab when passed a URL string', async () => {
    const url = 'https://example.com/fake.pdf';
  // Provide a spy for global open
  globalThis.open = vi.fn();

  const res = await downloadReport(url, 'pdf');

  expect(globalThis.open).toHaveBeenCalledWith(url, '_blank');
  expect(res).toEqual({ success: true, filename: null, openedUrl: url });

  delete globalThis.open;
  });

  it('downloads blob responses and returns a filename on success', async () => {
    const fakeBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    const fakeResponse = {
      headers: { 'content-type': 'application/pdf' },
      data: fakeBlob
    };

    // Mock api.get used by downloadReport
    api.get.mockResolvedValueOnce(fakeResponse);

    // Spy on URL.createObjectURL and anchor click
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Ensure document.createElement returns an anchor with a click spy
    const clickMock = vi.fn();
    globalThis.document = {
      createElement: () => ({
        href: '',
        setAttribute: () => {},
        click: clickMock,
        remove: () => {}
      }),
      body: { appendChild: () => {} }
    };

    const res = await downloadReport(12345, 'pdf');

    expect(api.get).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(typeof res.filename).toBe('string');

    // Restore spies
    createObjectURLSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('getCommandDetails returns data from API (successful path)', async () => {
    const fakeData = { id: 999, status: 'EXECUTED', file_url: 'https://example.com/a.pdf' };
    api.get.mockResolvedValueOnce({ data: fakeData });

    const res = await getCommandDetails(999);

    expect(api.get).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.data).toEqual(fakeData);
  });
});
