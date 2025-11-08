// Small helper to centralize development-only logging
export const devLog = (...args) => {
  try {
    if (import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  } catch (e) {
    // Fallback: in environments without import.meta, no-op
  }
};

export default devLog;
