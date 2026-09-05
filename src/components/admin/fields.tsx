"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * The admin form kit.
 *
 * Written for the person who will actually use it — a church administrator on a
 * laptop, once a week — so labels are plain words, every French field is
 * explicitly optional, and nothing requires knowing what a slug is.
 */

const INPUT =
  "mt-1.5 w-full rounded-lg border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] placeholder:text-ink-faint";

export function AdminField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  hint,
  placeholder,
  rows,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  [key: string]: unknown;
}) {
  const id = useId();

  const shared = {
    id,
    name,
    required,
    placeholder,
    defaultValue: defaultValue ?? undefined,
    className: INPUT,
    ...rest,
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="text-live"> *</span> : null}
      </label>
      {rows ? (
        <textarea rows={rows} {...(shared as React.ComponentProps<"textarea">)} />
      ) : (
        <input type={type} {...(shared as React.ComponentProps<"input">)} />
      )}
      {hint ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

/**
 * An English field with its French counterpart beside it.
 *
 * French is always optional and says so: an empty French box falls back to the
 * English text on the live site, so a half-translated archive still reads
 * correctly rather than showing blanks.
 */
export function BilingualField({
  label,
  name,
  defaultEn,
  defaultFr,
  required,
  rows,
  hint,
}: {
  label: string;
  /** Base name; renders `${name}En` and `${name}Fr`. */
  name: string;
  defaultEn?: string | null;
  defaultFr?: string | null;
  required?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <fieldset className="rounded-lg border border-line p-4">
      <legend className="px-1.5 text-sm font-medium">{label}</legend>
      {hint ? <p className="mb-3 text-xs text-ink-faint">{hint}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="English"
          name={`${name}En`}
          defaultValue={defaultEn}
          required={required}
          rows={rows}
        />
        <AdminField
          label="Français"
          name={`${name}Fr`}
          defaultValue={defaultFr}
          rows={rows}
          hint="Optional — falls back to English."
        />
      </div>
    </fieldset>
  );
}

export function AdminSelect({
  label,
  name,
  defaultValue,
  options,
  hint,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  options: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="text-live"> *</span> : null}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={INPUT}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function AdminCheckbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
      />
      <label htmlFor={id} className="text-sm">
        {label}
        {hint ? <span className="mt-0.5 block text-xs text-ink-faint">{hint}</span> : null}
      </label>
    </div>
  );
}

/**
 * Uploads straight from the browser to Cloudinary, then stores the resulting
 * URL in a hidden input so it saves with the rest of the form.
 */
export function ImageField({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function upload(file: File) {
    setBusy(true);
    setError(null);

    try {
      const ticketResponse = await fetch("/api/admin/upload-signature", { method: "POST" });
      if (!ticketResponse.ok) {
        setError("Could not start the upload. Are you still signed in?");
        return;
      }

      const ticket = (await ticketResponse.json()) as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        folder: string;
        signature: string;
      };

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", ticket.apiKey);
      form.append("timestamp", String(ticket.timestamp));
      form.append("folder", ticket.folder);
      form.append("signature", ticket.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${ticket.cloudName}/image/upload`,
        { method: "POST", body: form },
      );

      const data = (await uploadResponse.json()) as { secure_url?: string; error?: { message?: string } };

      if (!uploadResponse.ok || !data.secure_url) {
        setError(data.error?.message ?? "The upload failed. Please try again.");
        return;
      }

      setUrl(data.secure_url);
    } catch {
      setError("Could not reach Cloudinary. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <input type="hidden" name={name} value={url} />

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
          {url ? (
            <Image src={url} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-xs text-ink-faint">
              No image
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            id={id}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-contrast"
          />
          {busy ? <p className="mt-2 text-xs text-ink-faint">Uploading…</p> : null}
          {error ? <p className="mt-2 text-xs text-live">{error}</p> : null}
          {url ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="mt-2 text-xs text-ink-muted underline underline-offset-4"
            >
              Remove image
            </button>
          ) : null}
          {hint ? <p className="mt-2 text-xs text-ink-faint">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function SaveButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full bg-brand px-6",
        "font-medium text-brand-contrast transition-colors hover:bg-brand-soft disabled:opacity-60",
      )}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function DeleteButton({ label = "Delete" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      // Confirm before an irreversible action, since this is one click away
      // from a list of things the church spent months producing.
      onClick={(event) => {
        if (!confirm("Delete this permanently? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
      className="inline-flex h-11 items-center justify-center rounded-full border border-live px-6 font-medium text-live transition-colors hover:bg-live/10 disabled:opacity-60"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
