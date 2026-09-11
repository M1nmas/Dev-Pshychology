interface HeroProps {
  children: React.ReactNode;
}

function Hero({ children }: HeroProps) {
  return (
    <main className="hero">
      <div className="hero-content">
        <h1>
          YOUR CODE HAS FEELINGS.
          <br />
          <span>THEY&apos;RE NOT GOOD.</span>
        </h1>

        <p className="subtitle">
          Paste your code. We&apos;ll diagnose your personality disorder.
          <br />
          (Lovingly.)
        </p>

        {children}
      </div>
    </main>
  );
}

export default Hero;