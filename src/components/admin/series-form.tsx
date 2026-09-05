"use client";

import { useActionState } from "react";

import { deleteSeries, saveSeries } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import {
  AdminField,
  BilingualField,
  DeleteButton,
  ImageField,
  SaveButton,
} from "./fields";
import { AdminCard } from "./ui";

export type SeriesFormValues = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleFr?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  imageUrl?: string | null;
  imageAltEn?: string | null;
  imageAltFr?: string | null;
  startDate?: string;
  endDate?: string;
};

export function SeriesForm({ values }: { values: SeriesFormValues }) {
  const [state, action] = useActionState(saveSeries, initialFormState);

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

        <BilingualField
          label="Description"
          name="description"
          defaultEn={values.descriptionEn}
          defaultFr={values.descriptionFr}
          rows={3}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminField
            label="Started"
            name="startDate"
            type="date"
            defaultValue={values.startDate}
          />
          <AdminField label="Finished" name="endDate" type="date" defaultValue={values.endDate} />
          <AdminField
            label="Web address"
            name="slug"
            defaultValue={values.slug}
            hint="Leave blank to generate."
          />
        </div>

        <ImageField
          label="Series artwork"
          name="imageUrl"
          defaultValue={values.imageUrl}
          hint="Also used as the fallback artwork for every sermon in the series."
        />

        <BilingualField
          label="Describe the image"
          name="imageAlt"
          defaultEn={values.imageAltEn}
          defaultFr={values.imageAltFr}
        />
      </AdminCard>

      <SaveButton label={values.id ? "Save changes" : "Add series"} />
    </form>
  );
}

export function DeleteSeriesForm({ id }: { id: string }) {
  return (
    <form action={deleteSeries}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="Delete series" />
    </form>
  );
}
