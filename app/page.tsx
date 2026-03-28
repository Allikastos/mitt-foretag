export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold leading-tight">
            Redovisning och ekonomisk rådgivning för småföretag
          </h1>

          <p className="mt-6 text-lg text-neutral-600">
            Jag hjälper företag få kontroll på sin bokföring, förstå sina siffror
            och fatta bättre beslut.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="#kontakt"
              className="rounded-xl bg-black px-6 py-3 text-white"
            >
              Boka gratis rådgivning
            </a>

            <a
              href="#tjanster"
              className="rounded-xl border px-6 py-3"
            >
              Se tjänster
            </a>
          </div>
        </div>
      </section>

      <section id="tjanster" className="border-t px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold">Tjänster</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="border p-6 rounded-2xl">
              <h3 className="font-semibold text-xl">Bokföring</h3>
              <p className="mt-3 text-neutral-600">
                Löpande redovisning, moms och rapporter.
              </p>
            </div>

            <div className="border p-6 rounded-2xl">
              <h3 className="font-semibold text-xl">Rapportering</h3>
              <p className="mt-3 text-neutral-600">
                Tydliga månadsrapporter och nyckeltal.
              </p>
            </div>

            <div className="border p-6 rounded-2xl">
              <h3 className="font-semibold text-xl">Analys</h3>
              <p className="mt-3 text-neutral-600">
                Hjälp att förstå och förbättra lönsamheten.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="border-t px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold">Kontakt</h2>

          <p className="mt-4 text-neutral-600">
            Vill du få bättre koll på ditt företag? Hör av dig så bokar vi ett möte.
          </p>

          <div className="mt-6">
            <p className="font-medium">Email:</p>
            <p className="text-neutral-600">dinmail@exempel.se</p>
          </div>
        </div>
      </section>
    </main>
  );
}