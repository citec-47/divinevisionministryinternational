/**
 * Shared shape for the form server actions and the client forms that call them.
 *
 * This lives outside `app/actions.ts` on purpose: a file marked "use server"
 * may only export async functions, so the state type and its initial value
 * cannot live there.
 */
export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  /** Field name -> problem, so inputs can be marked invalid individually. */
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle", message: "" };
