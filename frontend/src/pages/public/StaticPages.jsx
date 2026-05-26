export const About = () => (
  <main className="shell py-12">
    <div className="max-w-3xl">
      <p className="badge">About</p>
      <h1 className="mt-3 text-3xl font-black text-navy">A practical operating system for real estate teams.</h1>
      <p className="mt-4 text-slate-600">LuxeEstate REMS connects customers, agents, and administrators with verified listings, bookings, payments, reports, analytics, notifications, and chat.</p>
    </div>
  </main>
);

export const Contact = () => (
  <main className="shell py-12">
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="badge">Contact</p>
        <h1 className="mt-3 text-3xl font-black text-navy">Talk to the platform team.</h1>
        <p className="mt-4 text-slate-600">Send a message and the operations team will follow up.</p>
      </div>
      <form className="panel space-y-3 p-5" onSubmit={(e) => e.preventDefault()}>
        <input className="input" placeholder="Name" />
        <input className="input" placeholder="Email" />
        <textarea className="textarea" placeholder="Message" />
        <button className="btn-primary">Send message</button>
      </form>
    </div>
  </main>
);
