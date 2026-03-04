import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import harvardImg from '../assets/harvard.jpeg';
import mitImg from '../assets/mit.jpeg';
import stanfordImg from '../assets/stanford.jpeg';
import heroBg from '../assets/uni.jpeg';

const MOCK_RESULTS = [
  {
    uni: 'Stanford University',
    score: 82,
    badge: 'MATCH',
    badgeClass: 'nf-mock-badge--match',
    ringColor: '#c4a44a',
    feedback: "Your academic profile aligns well with Stanford's typical admitted student...",
    steps: [
      { text: 'Strengthen research experience', cls: 'nf-mock-step--high' },
      { text: 'Improve SAT Math score', cls: 'nf-mock-step--med' },
      { text: 'Add leadership roles', cls: 'nf-mock-step--low' },
    ],
  },
  {
    uni: 'Harvard University',
    score: 45,
    badge: 'REACH',
    badgeClass: 'nf-mock-badge--reach',
    ringColor: '#c4795a',
    feedback: 'Harvard is highly competitive. Focus on standing out with unique extracurriculars...',
    steps: [
      { text: 'Raise GPA above 3.9', cls: 'nf-mock-step--high' },
      { text: 'Publish a research paper', cls: 'nf-mock-step--high' },
      { text: 'National-level competition wins', cls: 'nf-mock-step--med' },
    ],
  },
  {
    uni: 'UC Berkeley',
    score: 91,
    badge: 'SAFE',
    badgeClass: 'nf-mock-badge--safe',
    ringColor: '#8a9a6b',
    feedback: 'Your profile exceeds the typical admitted student at Berkeley. Strong candidate...',
    steps: [
      { text: 'Maintain current GPA', cls: 'nf-mock-step--low' },
      { text: 'Write compelling essays', cls: 'nf-mock-step--med' },
      { text: 'Secure strong recommendations', cls: 'nf-mock-step--low' },
    ],
  },
];

const FAQ = [
  {
    q: 'How does the prediction score work?',
    a: 'We analyze your academic profile — GPA, test scores, extracurriculars, and honors — against historical admissions data for your chosen university. The result is a 0–100 match score with a category: Reach, Match, or Safe.',
  },
  {
    q: 'Is my data stored securely?',
    a: 'Yes. All data is encrypted and stored securely. We never share your personal information with universities or third parties.',
  },
  {
    q: 'Can I run predictions for multiple universities?',
    a: 'Absolutely. You can create as many predictions as you want — each one is tailored to a specific university and major combination.',
  },
  {
    q: 'What information do I need to get started?',
    a: 'At minimum, select a university. For the most accurate prediction, add your standardized test scores (SAT, ACT, IELTS, etc.), extracurricular activities, and academic honors.',
  },
  {
    q: 'How accurate are the predictions?',
    a: 'Predictions are based on AI analysis of your profile against known admissions patterns. They provide a strong directional signal, but admissions decisions involve factors beyond what any model can capture.',
  },
  {
    q: 'Is Uni-chance free to use?',
    a: 'Yes. Creating an account and running predictions is completely free.',
  },
];

function MockCarousel() {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(null);
  const didDrag = useRef(false);
  const autoRef = useRef(null);
  const total = MOCK_RESULTS.length;

  function resetAuto() {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % total);
    }, 5000);
  }

  useEffect(() => {
    resetAuto();
    return () => clearInterval(autoRef.current);
  }, []);

  function onPointerDown(e) {
    e.preventDefault();
    didDrag.current = false;
    setDrag({ startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 });
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    setDrag(d => ({ ...d, dx, dy }));
  }

  function onPointerUp() {
    if (!drag) return;
    const dist = Math.sqrt(drag.dx * drag.dx + drag.dy * drag.dy);
    if (dist > 30) {
      setActive(prev => (prev + 1) % total);
      resetAuto();
      didDrag.current = true;
    }
    setDrag(null);
  }

  function onClickCard(cardIndex) {
    if (didDrag.current) return;
    if (cardIndex === active) {
      setActive(prev => (prev + 1) % total);
    } else {
      setActive(cardIndex);
    }
    resetAuto();
  }

  const isDragging = drag && didDrag.current;

  return (
    <div
      className="nf-hand"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {MOCK_RESULTS.map((r, i) => {
        const off = i - active;
        const pos = ((off % total) + total) % total;
        const isFront = pos === 0;

        // dragging only affects front card
        let extraStyle = {};
        if (isFront && isDragging) {
          extraStyle = {
            transform: `translateX(${drag.dx}px) translateY(${drag.dy * 0.4}px) rotate(${drag.dx * 0.08}deg)`,
            opacity: Math.max(0.2, 1 - Math.abs(drag.dx) / 400),
            transition: 'none',
          };
        }

        return (
          <div
            key={i}
            className={`nf-hand-card nf-mock-card${isFront ? ' nf-hand-active' : ''}${isFront && isDragging ? ' nf-hand-dragging' : ''}`}
            style={{
              '--pos': pos,
              zIndex: isFront ? 10 : total - pos,
              ...extraStyle,
            }}
            onPointerDown={isFront ? onPointerDown : undefined}
            onClick={!isDragging ? () => onClickCard(i) : undefined}
          >
            <div className="nf-mock-header">{r.uni}</div>
            <div className="nf-mock-score-row">
              <div className="nf-mock-ring" style={{ borderColor: r.ringColor }}>
                <span className="nf-mock-ring-num">{r.score}</span>
                <span className="nf-mock-ring-label">/ 100</span>
              </div>
              <span className={`nf-mock-badge ${r.badgeClass}`}>{r.badge}</span>
            </div>
            <div className="nf-mock-feedback">{r.feedback}</div>
            <div className="nf-mock-steps">
              {r.steps.map((s, j) => (
                <div key={j} className={`nf-mock-step ${s.cls}`}>
                  <span className="nf-mock-step-dot" />{s.text}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  return (
    <div className={`nf-faq-item${open ? ' open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="nf-faq-q">
        <span>{item.q}</span>
        <span className="nf-faq-icon">{open ? '\u2212' : '+'}</span>
      </div>
      <div
        className="nf-faq-a-wrap"
        style={{ maxHeight: open ? (bodyRef.current?.scrollHeight || 200) + 'px' : '0px' }}
      >
        <div className="nf-faq-a" ref={bodyRef}>{item.a}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="nf-hero">
        <div className="nf-hero-bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="nf-hero-content">
          <h1 className="nf-hero-title">Find Your Perfect University</h1>
          <p className="nf-hero-sub">
            AI-powered admissions predictions. Know where you stand before you apply.
          </p>
          <Link to="/universities">
            <button className="nf-hero-btn">Get Started</button>
          </Link>
        </div>
      </section>

      {/* Info rows with visuals */}
      <section className="nf-info">
        <div className="nf-info-item">
          <div className="nf-info-text">
            <h2>Your score. Your roadmap.</h2>
            <p>Get a 0–100 match score, personalized feedback, and a step-by-step improvement plan for every university you target.</p>
          </div>
          <div className="nf-info-visual">
            <MockCarousel />
          </div>
        </div>

        <div className="nf-info-item nf-info-item--reverse">
          <div className="nf-info-visual">
            <div className="nf-mock-card">
              <div className="nf-mock-search">Search university...</div>
              <div className="nf-mock-uni-row">
                <img src={harvardImg} alt="" className="nf-mock-uni-thumb" />
                <div>
                  <div className="nf-mock-uni-name">Harvard University</div>
                  <div className="nf-mock-uni-meta">Cambridge, MA &middot; #2 Ranking</div>
                </div>
              </div>
              <div className="nf-mock-uni-row">
                <img src={mitImg} alt="" className="nf-mock-uni-thumb" />
                <div>
                  <div className="nf-mock-uni-name">MIT</div>
                  <div className="nf-mock-uni-meta">Cambridge, MA &middot; #1 Ranking</div>
                </div>
              </div>
              <div className="nf-mock-uni-row">
                <img src={stanfordImg} alt="" className="nf-mock-uni-thumb" />
                <div>
                  <div className="nf-mock-uni-name">Stanford University</div>
                  <div className="nf-mock-uni-meta">Stanford, CA &middot; #3 Ranking</div>
                </div>
              </div>
            </div>
          </div>
          <div className="nf-info-text">
            <h2>Built for ambitious students.</h2>
            <p>Whether you're aiming for the Ivy League or exploring options — we help you understand exactly where you stand and what to do next.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="nf-faq">
        <h2 className="nf-faq-title">Frequently Asked Questions</h2>
        <div className="nf-faq-list">
          {FAQ.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="nf-cta">
        <h2>Ready to start?</h2>
        <Link to="/universities">
          <button className="nf-hero-btn">Explore Universities</button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="nf-footer">
        <nav className="nf-footer-links">
          <Link to="/">Home</Link>
          <Link to="/universities">Universities</Link>
          <Link to="/predictions">Predictions</Link>
        </nav>
        <p className="nf-footer-copy">&copy; 2026 Uni-chance</p>
      </footer>
    </>
  );
}
