"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  submitContactMessage,
  submitEventRegistration,
  submitPrayerRequest,
} from "@/app/actions";
import { useClientLoadedAt } from "@/lib/client-hooks";
import type { Dictionary } from "@/lib/dictionaries";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Card } from "./ui";

const FIELD_CLASS =
  "mt-1.5 w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.95rem] placeholder:text-ink-faint";

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  hint,
  placeholder,
  rows,
  optionalLabel,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
  optionalLabel: string;
  [key: string]: unknown;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const shared = {
    id,
    name,
    required,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    className: cn(FIELD_CLASS, error && "border-live"),
    ...rest,
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <span className="text-live" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="ml-1 text-xs font-normal text-ink-faint">({optionalLabel})</span>
        )}
      </label>

      {rows ? (
        <textarea rows={rows} {...(shared as React.ComponentProps<"textarea">)} />
      ) : (
        <input type={type} {...(shared as React.ComponentProps<"input">)} />
      )}

      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-live">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Checkbox({
  label,
  name,
  hint,
  defaultChecked,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultChecked?: boolean;
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

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 font-medium text-brand-contrast transition-colors hover:bg-brand-soft disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Hidden anti-spam pair: a field no human sees, and the moment the form was
 * rendered. Both are checked on the server.
 */
function Honeypot({ locale, leaveEmpty }: { locale: Locale; leaveEmpty: string }) {
  // Zero on the server, so the timing value is never baked into the cached
  // static HTML; filled in on hydration.
  const startedAt = useClientLoadedAt();

  return (
    <>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website-field">{leaveEmpty}</label>
        <input id="website-field" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}

function StatusMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        state.status === "success"
          ? "border-accent/40 bg-accent/10 text-ink"
          : "border-live/40 bg-live/10 text-ink",
      )}
    >
      {state.message}
    </p>
  );
}

/** Shared shell: hides the fields once a submission succeeds. */
function FormShell({
  state,
  locale,
  dict,
  submitLabel,
  children,
}: {
  state: FormState;
  locale: Locale;
  dict: Dictionary;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Honeypot locale={locale} leaveEmpty={dict.forms.leaveEmpty} />
      <StatusMessage state={state} />
      {state.status !== "success" ? (
        <>
          {children}
          <SubmitButton label={submitLabel} pendingLabel={dict.forms.sending} />
        </>
      ) : null}
    </>
  );
}

export function PrayerRequestForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [state, action] = useActionState(submitPrayerRequest, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const t = dict.forms;

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <Card className="p-6 sm:p-8">
      <form ref={formRef} action={action} className="relative flex flex-col gap-5">
        <FormShell state={state} locale={locale} dict={dict} submitLabel={t.sendRequest}>
          <Field
            label={t.yourName}
            name="name"
            autoComplete="name"
            hint={t.anonymousHint}
            optionalLabel={dict.common.optional}
            error={state.fieldErrors?.name}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.email}
              name="email"
              type="email"
              autoComplete="email"
              optionalLabel={dict.common.optional}
              error={state.fieldErrors?.email}
            />
            <Field
              label={t.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              optionalLabel={dict.common.optional}
            />
          </div>
          <Field
            label={t.howCanWePray}
            name="request"
            rows={6}
            required
            placeholder={t.prayerPlaceholder}
            optionalLabel={dict.common.optional}
            error={state.fieldErrors?.request}
          />
          <div className="flex flex-col gap-3">
            <Checkbox name="private" label={t.keepPrivate} hint={t.keepPrivateHint} defaultChecked />
            <Checkbox name="contactMe" label={t.contactMe} />
          </div>
        </FormShell>
      </form>
    </Card>
  );
}

export function ContactForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [state, action] = useActionState(submitContactMessage, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const t = dict.forms;

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <Card className="p-6 sm:p-8">
      <form ref={formRef} action={action} className="relative flex flex-col gap-5">
        <FormShell state={state} locale={locale} dict={dict} submitLabel={t.send}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.yourName}
              name="name"
              required
              autoComplete="name"
              optionalLabel={dict.common.optional}
              error={state.fieldErrors?.name}
            />
            <Field
              label={t.email}
              name="email"
              type="email"
              required
              autoComplete="email"
              optionalLabel={dict.common.optional}
              error={state.fieldErrors?.email}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              optionalLabel={dict.common.optional}
            />
            <Field
              label={t.subject}
              name="subject"
              placeholder={t.subjectPlaceholder}
              optionalLabel={dict.common.optional}
            />
          </div>
          <Field
            label={t.message}
            name="message"
            rows={6}
            required
            optionalLabel={dict.common.optional}
            error={state.fieldErrors?.message}
          />
        </FormShell>
      </form>
    </Card>
  );
}

export function EventRegistrationForm({
  eventTitle,
  eventId,
  locale,
  dict,
}: {
  eventTitle: string;
  eventId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const [state, action] = useActionState(submitEventRegistration, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const t = dict.forms;

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <Card className="p-6">
      <h2 className="font-display text-xl tracking-tight">{dict.events.savePlace}</h2>
      <p className="mt-1 text-sm text-ink-muted">{dict.events.saveePlaceBody}</p>

      <form ref={formRef} action={action} className="relative mt-5 flex flex-col gap-5">
        <input type="hidden" name="eventTitle" value={eventTitle} />
        <input type="hidden" name="eventId" value={eventId} />

        <FormShell state={state} locale={locale} dict={dict} submitLabel={t.register}>
          <Field
            label={t.yourName}
            name="name"
            required
            autoComplete="name"
            optionalLabel={dict.common.optional}
            error={state.fieldErrors?.name}
          />
          <Field
            label={t.email}
            name="email"
            type="email"
            required
            autoComplete="email"
            optionalLabel={dict.common.optional}
            error={state.fieldErrors?.email}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              optionalLabel={dict.common.optional}
            />
            <Field
              label={t.howMany}
              name="guests"
              type="number"
              defaultValue={1}
              min={1}
              max={20}
              optionalLabel={dict.common.optional}
              error={state.fieldErrors?.guests}
            />
          </div>
          <Field
            label={t.anythingToKnow}
            name="notes"
            rows={3}
            hint={t.anythingHint}
            optionalLabel={dict.common.optional}
          />
        </FormShell>
      </form>
    </Card>
  );
}
