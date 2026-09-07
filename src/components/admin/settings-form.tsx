"use client";

import { useActionState } from "react";

import { saveSettings } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import {
  AdminCheckbox,
  AdminField,
  BilingualField,
  ImageField,
  SaveButton,
} from "./fields";
import { AdminCard } from "./ui";

export type SettingsValues = {
  name?: string;
  shortName?: string;
  taglineEn?: string;
  taglineFr?: string | null;
  descriptionEn?: string;
  descriptionFr?: string | null;
  logoUrl?: string | null;
  addressLine?: string;
  city?: string;
  region?: string | null;
  country?: string;
  addressNoteEn?: string | null;
  addressNoteFr?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  timezone?: string;
  currency?: string;
  livestreamEmbedUrl?: string | null;
  livestreamChannelUrl?: string | null;
  forceLive?: boolean;
  givingBlurbEn?: string | null;
  givingBlurbFr?: string | null;
  momoMtn?: string | null;
  momoOrange?: string | null;
  momoAccountName?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
};

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, action] = useActionState(saveSettings, initialFormState);

  return (
    <form action={action} className="space-y-6">
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

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Identity</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Full name" name="name" defaultValue={values.name} required />
          <AdminField
            label="Short name"
            name="shortName"
            defaultValue={values.shortName}
            required
            hint="Used in the header and page titles."
          />
        </div>

        <BilingualField
          label="Tagline"
          name="tagline"
          defaultEn={values.taglineEn}
          defaultFr={values.taglineFr}
          required
          hint="The big line on the homepage. One sentence."
        />

        <BilingualField
          label="Description"
          name="description"
          defaultEn={values.descriptionEn}
          defaultFr={values.descriptionFr}
          rows={3}
          hint="Used for search results and WhatsApp previews. Say who you are and where you meet."
        />

        <ImageField label="Logo" name="logoUrl" defaultValue={values.logoUrl} />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Where you meet</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Street or area"
            name="addressLine"
            defaultValue={values.addressLine}
            required
            hint="Be specific enough for a first-time visitor to find you."
          />
          <AdminField label="City" name="city" defaultValue={values.city} required />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminField label="Region" name="region" defaultValue={values.region} />
          <AdminField label="Country" name="country" defaultValue={values.country} required />
          <AdminField
            label="Timezone"
            name="timezone"
            defaultValue={values.timezone}
            hint="Africa/Douala for Cameroon."
          />
        </div>

        <BilingualField
          label="Directions note"
          name="addressNote"
          defaultEn={values.addressNoteEn}
          defaultFr={values.addressNoteFr}
          hint="Parking, landmarks, which gate to use."
        />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">How people reach you</h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminField
            label="WhatsApp number"
            name="whatsapp"
            defaultValue={values.whatsapp}
            placeholder="237672916120"
            hint="Digits only, with the country code and no +."
          />
          <AdminField label="Phone" name="phone" defaultValue={values.phone} />
          <AdminField label="Email" name="email" type="email" defaultValue={values.email} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Facebook"
            name="facebookUrl"
            type="url"
            defaultValue={values.facebookUrl}
          />
          <AdminField
            label="YouTube"
            name="youtubeUrl"
            type="url"
            defaultValue={values.youtubeUrl}
          />
          <AdminField
            label="Instagram"
            name="instagramUrl"
            type="url"
            defaultValue={values.instagramUrl}
          />
          <AdminField
            label="TikTok"
            name="tiktokUrl"
            type="url"
            defaultValue={values.tiktokUrl}
          />
        </div>
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Livestream</h2>

        <AdminField
          label="Stream link"
          name="livestreamEmbedUrl"
          type="url"
          defaultValue={values.livestreamEmbedUrl}
          hint="A normal YouTube or Facebook live link. It becomes a player automatically."
        />
        <AdminField
          label="Channel link"
          name="livestreamChannelUrl"
          type="url"
          defaultValue={values.livestreamChannelUrl}
        />

        <AdminCheckbox
          name="forceLive"
          label="Force the live banner on"
          defaultChecked={values.forceLive}
          hint="For a special service outside the normal times. Remember to turn it off afterwards."
        />
      </AdminCard>

      <AdminCard className="space-y-5">
        <h2 className="font-display text-xl tracking-tight">Giving</h2>

        <BilingualField
          label="Why we give"
          name="givingBlurb"
          defaultEn={values.givingBlurbEn}
          defaultFr={values.givingBlurbFr}
          rows={3}
        />

        <AdminField
          label="Currency code"
          name="currency"
          defaultValue={values.currency}
          hint="XAF for Central African CFA francs."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminField label="MTN Mobile Money" name="momoMtn" defaultValue={values.momoMtn} />
          <AdminField label="Orange Money" name="momoOrange" defaultValue={values.momoOrange} />
          <AdminField
            label="Account name"
            name="momoAccountName"
            defaultValue={values.momoAccountName}
            hint="The name that shows when someone sends money."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <AdminField label="Bank" name="bankName" defaultValue={values.bankName} />
          <AdminField
            label="Account name"
            name="bankAccountName"
            defaultValue={values.bankAccountName}
          />
          <AdminField
            label="Account number"
            name="bankAccountNumber"
            defaultValue={values.bankAccountNumber}
          />
        </div>

        <p className="text-xs text-ink-faint">
          Anything you leave blank is simply hidden on the giving page, and nothing empty is
          ever shown to a visitor.
        </p>
      </AdminCard>

      <SaveButton label="Save church details" />
    </form>
  );
}
