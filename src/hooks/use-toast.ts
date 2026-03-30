"use client";

// TODO (Step 6): Implement with a toast queue and portal.
// Will expose: toast.success(), toast.error(), toast.info().
export function useToast() {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    success: (_message: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: (_message: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info: (_message: string) => {},
  };
}
