"use client";

import { useActionState } from "react";

import { deleteMinistry, saveMinistry } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import {
  AdminField,
  AdminSelect,
  BilingualField,
  DeleteButton,
  ImageField,
  SaveButton,
} from "./fields";
import { AdminCard } from "./ui";

export type MinistryFormValues = {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleFr?: string | null;
  summaryEn?: string;
  summaryFr?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  audienceEn?: string | null;
  audienceFr?: string | null;
  meetingTimeEn?: string | null;
  meetingTimeFr?: string | null;
  imageUrl?: string | null;
  imageAltEn?: string | null;
  imageAltFr?: string | null;
  leaderId?: string | null;
  sortOrder?: number;
};

export function MinistryForm({
  values,
  leaders,
}: {
  values: MinistryFormValues;
  leaders: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(saveMinistry, initialFormState);

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
          label="Name"
          name="title"
          defaultEn={values.titleEn}
          defaultFr={values.titleFr}
          required
        />

        <BilingualField
          label="Summary"
          name="summary"
          defaultEn={values.summaryEn}
          defaultFr={values.summaryFr}
          rows={2}
          required
          hint="One sentence, shown on the ministries grid."
        />

        <BilingualField
          label="Full description"
          name="description"
          defaultEn={values.descriptionEn}
          defaultFr={values.descriptionFr}
          rows={7}
          hint="Blank lines separate paragraphs."
        />

        <BilingualField
          label="Who it is for"
          name="audience"
          defaultEn={values.audienceEn}
          defaultFr={values.audienceFr}
          hint='For example "13 – 25 years".'
        />

        <BilingualField
          label="When it meets"
          name="meetingTime"
          defaultEn={values.meetingTimeEn}
          defaultFr={values.meetingTimeFr}
          hint='For example "Fridays, 5:30pm".'
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminSelect
            label="Leader"
            name="leaderId"
            defaultValue={values.leaderId}
            options={[
              { value: "", label: "— Not set —" },
              ...leaders.map((leader) => ({ value: leader.id, label: leader.name })),
            ]}
          />
          <AdminField
            label="Order on the page"
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder ?? 0}
            hint="Lower numbers come first."
          />
          <AdminField
            label="Web address"
            name="slug"
            defaultValue={values.slug}
            hint="Leave blank to generate."
          />
        </div>

        <ImageField label="Image" name="imageUrl" defaultValue={values.imageUrl} />

        <BilingualField
          label="Describe the image"
          name="imageAlt"
          defaultEn={values.imageAltEn}
          defaultFr={values.imageAltFr}
        />
      </AdminCard>

      <SaveButton label={values.id ? "Save changes" : "Add ministry"} />
    </form>
  );
}

export function DeleteMinistryForm({ id }: { id: string }) {
  return (
    <form action={deleteMinistry}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="Delete ministry" />
    </form>
  );
}
