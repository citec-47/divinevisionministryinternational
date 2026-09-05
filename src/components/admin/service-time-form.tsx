"use client";

import { useActionState } from "react";

import { deleteServiceTime, saveServiceTime } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { AdminField, AdminSelect, BilingualField, DeleteButton, SaveButton } from "./fields";
import { AdminCard } from "./ui";

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export type ServiceTimeValues = {
  id?: string;
  labelEn?: string;
  labelFr?: string | null;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string | null;
  noteEn?: string | null;
  noteFr?: string | null;
  location?: string | null;
  sortOrder?: number;
};

/**
 * One service time. Rendered once per existing row plus once empty for adding,
 * because the list is short and editing in place beats a separate page.
 */
export function ServiceTimeForm({ values }: { values: ServiceTimeValues }) {
  const [state, action] = useActionState(saveServiceTime, initialFormState);

  return (
    <AdminCard className="space-y-5">
      <form action={action} className="space-y-5">
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

        {state.status !== "idle" ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={
              state.status === "error"
                ? "rounded-xl border border-live/40 bg-live/10 px-4 py-3 text-sm"
                : "rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
            }
          >
            {state.message}
          </p>
        ) : null}

        <BilingualField
          label="What it is called"
          name="label"
          defaultEn={values.labelEn}
          defaultFr={values.labelFr}
          required
        />

        <div className="grid gap-5 sm:grid-cols-4">
          <AdminSelect
            label="Day"
            name="dayOfWeek"
            defaultValue={String(values.dayOfWeek ?? 0)}
            options={DAYS}
            required
          />
          <AdminField
            label="Starts"
            name="startTime"
            defaultValue={values.startTime}
            placeholder="09:00"
            required
            hint="24-hour, like 09:00."
          />
          <AdminField
            label="Ends"
            name="endTime"
            defaultValue={values.endTime}
            placeholder="12:00"
            hint="Used to switch the live banner off."
          />
          <AdminField
            label="Order"
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder ?? 0}
          />
        </div>

        <AdminField label="Location" name="location" defaultValue={values.location} />

        <BilingualField
          label="Note"
          name="note"
          defaultEn={values.noteEn}
          defaultFr={values.noteFr}
          hint="Shown under the time, e.g. “Children are welcome in the service.”"
        />

        <SaveButton label={values.id ? "Save" : "Add service time"} />
      </form>

      {values.id ? (
        <form action={deleteServiceTime} className="border-t border-line pt-5">
          <input type="hidden" name="id" value={values.id} />
          <DeleteButton label="Remove this service time" />
        </form>
      ) : null}
    </AdminCard>
  );
}
