const categories = [
  { id: "flight-tools", label: "BY AIR", title: "Flight tools", icon: "↗", description: "A smoother journey starts before takeoff.", tools: ["Baggage allowance guide", "Airport code finder", "Flight duration calculator"] },
  { id: "train-tools", label: "BY RAIL", title: "Train tools", icon: "↔", description: "A little clarity for every stop along the way.", tools: ["Train journey planner", "Station code finder", "Rail travel checklist"] },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-emerald-800 text-white" aria-hidden="true">↗</span>Travel<span className="-ml-2 text-emerald-800">Adda</span></a>
          <div className="flex gap-6 text-sm font-medium text-slate-600"><a className="hover:text-emerald-800" href="#flight-tools">Flight tools</a><a className="hover:text-emerald-800" href="#train-tools">Train tools</a><a className="hover:text-emerald-800" href="#about">About</a></div>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.3fr_1fr] md:py-28">
          <div>
            <p className="mb-6 text-xs font-bold tracking-[0.2em] text-emerald-800">LESS GUESSWORK. MORE GOING.</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Little tools.<br />Better <span className="text-emerald-800">journeys.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Your home for simple flight and train travel tools. We’re building useful ways to make planning your next journey easier.</p>
            <a href="#tools" className="mt-8 inline-flex items-center gap-8 rounded-full bg-emerald-800 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900">Explore what’s coming <span aria-hidden="true">↓</span></a>
          </div>
          <div className="relative rounded-3xl border border-emerald-900/10 bg-[#eaf1e9] p-8 sm:p-10">
            <div className="mb-12 flex justify-between text-xs font-semibold tracking-widest text-emerald-900"><span>THE JOURNEY AHEAD</span><span aria-hidden="true">✳</span></div>
            <div className="flex items-center gap-4" aria-hidden="true"><span className="grid size-16 place-items-center rounded-2xl bg-white text-3xl text-emerald-800">↗</span><span className="flex-1 border-t-2 border-dashed border-emerald-800/25" /><span className="grid size-16 place-items-center rounded-2xl bg-emerald-800 text-3xl text-white">↔</span></div>
            <h2 className="mt-10 text-2xl font-semibold tracking-tight">From takeoff to the last stop.</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-950/65">One place for the everyday travel questions that come before every great trip.</p>
            <div className="mt-8 border-t border-emerald-800/15 pt-5 text-xs font-medium text-emerald-900">FLIGHTS & TRAINS <span className="float-right">MADE SIMPLER</span></div>
          </div>
        </section>
        <section id="tools" className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-800">YOUR TRAVEL TOOLKIT</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><h2 className="text-3xl font-semibold tracking-tight">A useful start to every trip.</h2><p className="text-sm text-slate-500">Our first tools are on the way.</p></div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {categories.map((category) => <article key={category.id} id={category.id} className="scroll-mt-8 rounded-2xl border border-slate-200 p-6 sm:p-8"><div className="flex items-center justify-between"><p className="text-xs font-bold tracking-widest text-slate-500">{category.label}</p><span aria-hidden="true" className="text-2xl text-emerald-800">{category.icon}</span></div><h3 className="mt-5 text-2xl font-semibold">{category.title}</h3><p className="mt-2 text-sm text-slate-600">{category.description}</p><ul className="mt-7 divide-y divide-slate-100">{category.tools.map((tool) => <li key={tool} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"><span>{tool}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">Coming soon</span></li>)}</ul></article>)}
            </div>
          </div>
        </section>
        <section id="about" className="mx-auto max-w-6xl px-6 py-16"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.2em] text-emerald-800">MADE FOR THE WAY YOU TRAVEL</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Travel planning, a little lighter.</h2><p className="mt-4 leading-7 text-slate-600">TravelAdda is a growing collection of flight and train resources. We’re starting with the essentials and building one useful tool at a time.</p></div></section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-slate-200 px-6 py-7 text-xs text-slate-500"><p>© {new Date().getFullYear()} TravelAdda</p><p>A little help. A better journey.</p></footer>
    </div>
  );
}
