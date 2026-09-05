"use client";

import { useActionState } from "react";

import { deleteEvent, saveEvent } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import {
  AdminCheckbox,
  AdminField,
  AdminSelect,
  BilingualField,
  DeleteButton,
  ImageField,
  SaveButton,
} from "./fields";
import { AdminCard } from "./ui";

const CATEGORIES = [
  "",
  "Prayer",
  "Connect",
  "Youth",
  "Kids",
  "Outreach",
  "Worship",
  "Training",
];

export type EventFormValues = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleFr?: string | null;
  summaryEn?: string | null;
  summaryFr?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  start?: string;
  end?: string;
  recurrenceEn?: string | null;
  recurrenceFr?: string | null;
  category?: string | null;
  location?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  imageAltEn?: string | null;
  imageAltFr?: string | null;
  registrationEnabled?: boolean;
  capacity?: number | null;
  registrationClosesAt?: string;
  externalUrl?: string | null;
  published?: boolean;
};

export function EventForm({ values }: { values: EventFormValues }) {
  const [state, action] = useActionState(saveEvent, initialFormState);
  const isEdit = Boolean(values.id);

  return (
    <form action={action} className="space-y-6">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      {state.status === "error" ? (
        <p role="alert" className="rounded-xl border border-live/40 bg-live/10 px-4 py-3 text-sm">
          {state.message}
        </p>
      ) : null}

      <AdminCard className="space-y-5">
        <BilingualField
          label="Title"
          name="title"
          defaultEn={values.titleEn}
          defaultFr={values.titleFr}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Starts"
            name="start"
            type="datetime-local"
            defaultValue={values.start}
            required
          />
          <AdminField
            label="Ends"
            name="end"
            type="datetime-local"
            defaultValue={values.end}
          />
        </div>

        <BilingualField
          label="How often it repeats"
          name="recurrence"
          defaultEn={values.recurrenceEn}
          defaultFr={values.recurrenceFr}
          hint='Plain words, like "Every Wednesday". Leave blank for a one-off. Repeating events stay on the site permanently.'
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminSelect
            label="Category"
            name="category"
            defaultValue={values.category}
            options={CATEGORIES.map((category) => ({
              value: category,
              label: category || "— None —",
            }))}
            hint="Groups events into filters on the events page."
          />
          <AdminField
            label="Web address"
            name="slug"
            defaultValue={values.slug}
            hint="The part after /events/. Leave blank and we will make one."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Location name"
            name="location"
            defaultValue={values.location}
            placeholder="Main auditorium"
          />
          <AdminField
            label="Address"
            name="address"
            defaultValue={values.address}
            hint="Only if it is somewhere other than the church."
          />
        </div>

        <BilingualField
          label="Summary"
          name="summary"
          defaultEn={values.summaryEn}
          defaultFr={values.summaryFr}
          rows={3}
          hint="One or two sentences, shown on the events list."
        />

        <BilingualField
          label="Full description"
          name="description"
          defaultEn={values.descriptionEn}
          defaultFr={values.descriptionFr}
          rows={7}
          hint="Blank lines separate paragraphs."
        />

        <ImageField label="Image" name="imageUrl" defaultValue={values.imageUrl} />

        <BilingualField
          label="Describe the image"
          name="imageAlt"
          defaultEn={values.imageAltEn}
          defaultFr={values.imageAltFr}
          hint="For people using a screen reader."
        />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Registration</h2>

        <AdminCheckbox
          name="registrationEnabled"
          label="Ask people to register"
          defaultChecked={values.registrationEnabled}
          hint="Shows a sign-up form on the event page. Leave off for come-as-you-are events."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Capacity"
            name="capacity"
            type="number"
            min={0}
            defaultValue={values.capacity}
            hint="For your own planning. Not enforced automatically."
          />
          <AdminField
            label="Registration closes"
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={values.registrationClosesAt}
          />
        </div>

        <AdminField
          label="External registration link"
          name="externalUrl"
          type="url"
          defaultValue={values.externalUrl}
          hint="If set, this replaces the on-site form."
        />
      </AdminCard>

      <AdminCard>
        <AdminCheckbox
          name="published"
          label="Published"
          defaultChecked={values.published ?? true}
          hint="Untick to keep it off the site while you finish it."
        />
      </AdminCard>

      <SaveButton label={isEdit ? "Save changes" : "Add event"} />
    </form>
  );
}

export function DeleteEventForm({ id }: { id: string }) {
  return (
    <form action={deleteEvent}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="Delete event" />
    </form>
  );
}
