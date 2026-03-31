import type { FormEvent } from "react";

const INPUT_CLASS =
  "w-full rounded-[22px] border border-white/10 bg-background-secondary/80 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/42 transition-colors focus:border-primary/50 focus:outline-none";

interface ProfileDetailsFormProps {
  email: string;
  firstName: string;
  lastName: string;
  saving: boolean;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProfileDetailsForm({
  email,
  firstName,
  lastName,
  saving,
  onChangeFirstName,
  onChangeLastName,
  onReset,
  onSubmit,
}: ProfileDetailsFormProps) {
  return (
    <div className="mt-6 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
        Details
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-heading-md text-text-primary">
        Keep your account identity current
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        Name updates and portrait uploads save from the same action so the
        session stays aligned immediately.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name">
            <input
              type="text"
              value={firstName}
              onChange={(event) => onChangeFirstName(event.target.value)}
              className={INPUT_CLASS}
              placeholder="Alice"
              maxLength={60}
            />
          </Field>

          <Field label="Last name">
            <input
              type="text"
              value={lastName}
              onChange={(event) => onChangeLastName(event.target.value)}
              className={INPUT_CLASS}
              placeholder="Mukamana"
              maxLength={60}
            />
          </Field>
        </div>

        <Field label="Email address">
          <input
            type="email"
            value={email}
            className={`${INPUT_CLASS} cursor-not-allowed opacity-70`}
            disabled
          />
        </Field>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
