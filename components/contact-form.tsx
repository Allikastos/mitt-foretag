export function ContactForm() {
  return (
    <form className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Namn
          </span>
          <input
            type="text"
            name="name"
            placeholder="Ditt namn"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Företag
          </span>
          <input
            type="text"
            name="company"
            placeholder="Företagsnamn"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            E-post
          </span>
          <input
            type="email"
            name="email"
            placeholder="namn@foretag.se"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
        <label className="block">
          <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
            Telefonnummer
          </span>
          <input
            type="tel"
            name="phone"
            placeholder="070-1234567"
            className="min-h-12 w-full rounded-2xl border border-black/10 bg-[#F7F7F5] px-4 py-3 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
          Meddelande
        </span>
        <textarea
          name="message"
          rows={6}
          placeholder="Berätta kort om er verksamhet och vad ni vill ha hjälp med."
          className="w-full rounded-[1.5rem] border border-black/10 bg-[#F7F7F5] px-4 py-3.5 text-sm text-[#0B0B0C] outline-none transition duration-200 placeholder:text-[#8A8A8A] focus:border-[#C6A15B]"
        />
      </label>

      <button
        type="submit"
        className="rounded-2xl bg-[#0B0B0C] px-6 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
      >
        Skicka förfrågan
      </button>
    </form>
  );
}
