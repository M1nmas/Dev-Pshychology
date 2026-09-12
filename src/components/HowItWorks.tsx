function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "PASTE",
      description: "Drop your questionable code into the therapist's chair.",
    },
    {
      number: "02",
      title: "ANALYZE",
      description: "We look for patterns that should probably concern you.",
    },
    {
      number: "03",
      title: "ROAST",
      description: "Receive a completely unqualified psychological diagnosis.",
    },
  ];

  return (
    <section className="how-it-works" aria-label="How it works">
      {steps.map((step) => (
        <article className="how-item" key={step.number}>
          <span className="how-number">{step.number}</span>

          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default HowItWorks;