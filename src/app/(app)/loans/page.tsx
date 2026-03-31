export default function LoansPage() {
  return (
    <div className="px-4 pb-24 pt-4 md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="glass-panel rounded-[36px] p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/64">
            Loans
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-heading-lg text-text-primary">
            Loan tracking
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
            This route is now live for the loans experience. We can build the
            full loan dashboard and flows on top of it next without leaving dead
            navigation links behind.
          </p>
        </section>
      </div>
    </div>
  );
}
