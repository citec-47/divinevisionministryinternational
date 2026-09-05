"use client";

import { useActionState } from "react";

import { deleteSermon, saveSermon } from "@/app/admin/actions";
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

export type SermonFormValues = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleFr?: string | null;
  summaryEn?: string | null;
  summaryFr?: string | null;
  date?: string;
  speakerId?: string | null;
  seriesId?: string | null;
  scriptures?: string[];
  imageUrl?: string | null;
  imageAltEn?: string | null;
  imageAltFr?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  audioByteLength?: number | null;
  transcriptEn?: string | null;
  transcriptFr?: string | null;
  published?: boolean;
};

export function SermonForm({
  values,
  speakers,
  series,
}: {
  values: SermonFormValues;
  speakers: { id: string; name: string }[];
  series: { id: string; title: string }[];
}) {
  const [state, action] = useActionState(saveSermon, initialFormState);
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
            label="Date preached"
            name="date"
            type="date"
            defaultValue={values.date}
            required
          />
          <AdminField
            label="Web address"
            name="slug"
            defaultValue={values.slug}
            placeholder="left blank, made from the title"
            hint="The part after /sermons/. Leave blank and we will make one."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminSelect
            label="Who preached it"
            name="speakerId"
            defaultValue={values.speakerId}
            options={[
              { value: "", label: "— Not set —" },
              ...speakers.map((speaker) => ({ value: speaker.id, label: speaker.name })),
            ]}
          />
          <AdminSelect
            label="Part of a series"
            name="seriesId"
            defaultValue={values.seriesId}
            options={[
              { value: "", label: "— Not in a series —" },
              ...series.map((item) => ({ value: item.id, label: item.title })),
            ]}
          />
        </div>

        <AdminField
          label="Bible passages"
          name="scriptures"
          defaultValue={values.scriptures?.join(", ")}
          placeholder="Colossians 1:15-20, Psalm 121"
          hint="Separate several with commas."
        />

        <BilingualField
          label="Summary"
          name="summary"
          defaultEn={values.summaryEn}
          defaultFr={values.summaryFr}
          rows={3}
          hint="One or two sentences. Shown on cards and in search results."
        />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Media</h2>

        <AdminField
          label="Video link"
          name="videoUrl"
          type="url"
          defaultValue={values.videoUrl}
          placeholder="https://youtube.com/watch?v=..."
          hint="A normal YouTube or Vimeo link. It becomes a player automatically."
        />

        <AdminField
          label="Audio file link"
          name="audioUrl"
          type="url"
          defaultValue={values.audioUrl}
          placeholder="https://.../sermon.mp3"
          hint="A direct link to an MP3. Required for the sermon to reach the podcast feed."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Length in minutes"
            name="durationMinutes"
            type="number"
            min={0}
            defaultValue={
              values.durationSeconds ? Math.round(values.durationSeconds / 60) : undefined
            }
          />
          <AdminField
            label="Audio file size in bytes"
            name="audioByteLength"
            type="number"
            min={0}
            defaultValue={values.audioByteLength}
            hint="Podcast apps want this. Check the file's properties."
          />
        </div>

        <ImageField
          label="Artwork"
          name="imageUrl"
          defaultValue={values.imageUrl}
          hint="Optional. Falls back to the series artwork."
        />

        <BilingualField
          label="Describe the image"
          name="imageAlt"
          defaultEn={values.imageAltEn}
          defaultFr={values.imageAltFr}
          hint="For people using a screen reader. Say what is in the picture."
        />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Transcript</h2>
        <p className="text-sm text-ink-muted">
          Makes the message searchable, readable on a slow connection, and accessible to
          deaf and hard-of-hearing members. Blank lines separate paragraphs.
        </p>
        <BilingualField
          label="Transcript"
          name="transcript"
          defaultEn={values.transcriptEn}
          defaultFr={values.transcriptFr}
          rows={10}
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

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton label={isEdit ? "Save changes" : "Add sermon"} />
      </div>

      {isEdit ? (
        <div className="border-t border-line pt-6">
          <p className="mb-3 text-sm text-ink-muted">
            Deleting removes this sermon from the site and the podcast feed.
          </p>
        </div>
      ) : null}
    </form>
  );
}

/** Separate form so deleting is never one mis-click away from saving. */
export function DeleteSermonForm({ id }: { id: string }) {
  return (
    <form action={deleteSermon}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="Delete sermon" />
    </form>
  );
}
