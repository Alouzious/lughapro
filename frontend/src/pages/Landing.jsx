import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Award, Globe, MessageSquare,
  Calendar, Users, ChevronLeft, ChevronRight, Check,
  GraduationCap, BrainCircuit,
} from 'lucide-react';

/* ── Hero slides ── */
const SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=85',
    studentImg: 'https://media.istockphoto.com/id/2209014041/photo/portrait-outdoor-and-woman-with-graduation-diploma-and-smile-with-urban-town-university-or.webp?a=1&b=1&s=612x612&w=0&k=20&c=v03AtSaWmaOoqnLuzlN4n78iTfAmv0wuZM2lRVS3JSA=',
    overlay: 'rgba(5,20,12,0.62)',
    accentColor: '#3DBFA0',
    icon: Users,
    tag: 'Native Tutors',
    headline: 'Learn Kiswahili from verified native tutors',
    italic: 'Kiswahili',
    sub: 'Connect with 100+ expert tutors from East Africa. Personalised one-on-one sessions tailored to your level and goals.',
    cta1: { label: 'Find a tutor', href: '/register' },
    cta2: { label: 'Browse tutors', href: '/tutors' },
  },
  {
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=85',
    studentImg: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=85',
    overlay: 'rgba(8,18,40,0.65)',
    accentColor: '#F4A830',
    icon: GraduationCap,
    tag: 'CEFR Certified',
    headline: 'Earn a verified CEFR certificate',
    italic: 'verified',
    sub: 'Progress through A1 to C2 at your own pace. Every certificate is blockchain-verified and shareable on LinkedIn in one click.',
    cta1: { label: 'Start learning', href: '/register' },
    cta2: { label: 'See certificates', href: '/tutors' },
  },
  {
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85',
    studentImg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=85',
    overlay: 'rgba(5,25,20,0.60)',
    accentColor: '#3DBFA0',
    icon: BrainCircuit,
    tag: 'AI Practice',
    headline: 'Practice anytime with your AI tutor',
    italic: 'anytime',
    sub: 'Between sessions, practise with our AI tutor. Instant grammar corrections, vocabulary drills, and real conversation scenarios.',
    cta1: { label: 'Try AI practice', href: '/register' },
    cta2: { label: 'Learn more', href: '/tutors' },
  },
];

const STATS = [
  { num: '134+', lbl: 'Verified tutors' },
  { num: '2,840', lbl: 'Sessions completed' },
  { num: '4.9', lbl: 'Average rating' },
  { num: '15+', lbl: 'Countries served' },
];

const FEATURES = [
  { icon: Users,         title: 'Vetted Native Tutors',   desc: 'Every tutor is verified by our team. Background checked, credentials confirmed, trial session required before listing.' },
  { icon: Calendar,      title: 'Flexible Scheduling',    desc: 'Book sessions that fit your life. View real-time availability, reschedule up to 24 hrs before with no penalty.' },
  { icon: Shield,        title: 'Secure Escrow Payments', desc: 'Your money is held in escrow until session completion. Full refund guaranteed for no-shows or cancellations.' },
  { icon: Award,         title: 'CEFR Certificates',      desc: 'Earn A1–C2 certificates as you progress. Blockchain-verified and shareable directly to your LinkedIn profile.' },
  { icon: MessageSquare, title: 'AI Practice Partner',    desc: 'Practise 24/7 with our AI tutor. Grammar corrections, vocabulary drills, and real conversation scenarios.' },
  { icon: Globe,         title: 'Learn Anywhere',         desc: 'Fully mobile-optimised. Switch between desktop and phone seamlessly without losing your place.' },
];

const SAMPLE_TUTORS = [
  {
    initials: 'AK', bg: '#E8F5F0', fg: '#0B5E47',
    name: 'Amina Kariuki', location: 'Nairobi, Kenya',
    rating: 4.98, reviews: 214,
    tags: ['B2 · C1 · C2', 'Elite tutor', 'Business Swahili'],
    bio: '10+ years teaching Kiswahili. Former lecturer at University of Nairobi. Specialises in business and diplomatic Kiswahili.',
    price: 28, online: true,
  },
  {
    initials: 'JM', bg: '#E6F1FB', fg: '#185FA5',
    name: 'Juma Mwanga', location: 'Dar es Salaam, Tanzania',
    rating: 4.95, reviews: 187,
    tags: ['A1 · A2 · B1', 'Beginners welcome'],
    bio: 'Patient and encouraging. Perfect for complete beginners. Conversational approach — you will be speaking from lesson one.',
    price: 18, online: true,
  },
  {
    initials: 'FA', bg: '#FAEEDA', fg: '#C9921A',
    name: 'Fatuma Abdi', location: 'Mombasa, Kenya',
    rating: 4.92, reviews: 156,
    tags: ['B1 · B2', 'Exam prep', 'CEFR Certified'],
    bio: 'Specialist in exam preparation. 95% pass rate for CEFR B2. Structured lessons with clear weekly goals.',
    price: 22, online: false,
  },
];

const PLANS = [
  {
    name: 'Starter', price: 0, period: 'Free forever',
    desc: "Try LughaPro and see if it's right for you.",
    features: ['3 free AI tutor sessions/month', 'Browse all tutor profiles', 'Community forum access', 'Basic progress tracking'],
    cta: 'Get started free', href: '/register', highlight: false,
  },
  {
    name: 'Learner', price: 29, period: 'per month',
    desc: 'For consistent learners who want real progress.',
    features: ['Unlimited AI tutor sessions', 'Book up to 4 sessions/month', 'CEFR progress tracker', 'Session recordings', 'Priority support'],
    cta: 'Start learning', href: '/register', highlight: true, badge: 'Most popular',
  },
  {
    name: 'Fluent', price: 79, period: 'per month',
    desc: 'For serious learners targeting fluency fast.',
    features: ['Everything in Learner', 'Unlimited sessions', 'NFT certificate on completion', 'Dedicated tutor matching', 'Group classes access', 'WhatsApp tutor hotline'],
    cta: 'Go fluent', href: '/register', highlight: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah Mitchell',  role: 'NGO Worker, Uganda',        stars: 5, text: "After 3 months with Amina, I'm holding full conversations in Kiswahili. The structured CEFR approach made the difference. I can actually see my progress." },
  { name: 'David Ochieng',   role: 'Business Analyst, Nairobi', stars: 5, text: "I needed business Kiswahili fast for a new role. LughaPro matched me with the perfect tutor in minutes. Six weeks later I'm presenting in Kiswahili." },
  { name: 'Aisha Nkemdirim', role: 'PhD Student, London',       stars: 5, text: "The AI practice partner between sessions is brilliant. I practise every day now. My tutor says my vocabulary has doubled in a month." },
];

/* ═══════════════════════════════════════════════════════════ */

export default function Landing() {
  const [slide, setSlide] = useState(0);
  const [levelFilter, setLevelFilter] = useState('All');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide(s => (s + 1) % SLIDES.length);
  const cur = SLIDES[slide];
  const SlideIcon = cur.icon;

  /* Split headline around the italic word */
  const parts = cur.headline.split(cur.italic);

  return (
    <div style={{ background: 'var(--cream)' }}>

      {/* ─────────── HERO ─────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Full-bleed background image */}
        <img
          key={cur.bg}
          src={cur.bg}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            zIndex: 0,
            animation: 'bgFade 0.9s ease both',
          }}
        />

        {/* Colour overlay */}
        <div style={{ position: 'absolute', inset: 0, background: cur.overlay, zIndex: 1, transition: 'background 0.9s ease' }} />

        {/* Left vignette so text is always readable */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(100deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 55%, transparent 75%)',
          pointerEvents: 'none',
        }} />

        {/* Content row */}
        <div style={{
          position: 'relative', zIndex: 3,
          width: '100%', maxWidth: '1200px',
          margin: '0 auto', padding: '5rem 5% 5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}>

          {/* ── LEFT: text ── */}
          <div style={{ flex: '0 1 580px' }}>

            {/* Icon pill */}
            <div key={slide + 'pill'} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1.1rem 0.4rem 0.55rem',
              borderRadius: '40px',
              background: 'rgba(255,255,255,0.1)',
              border: `1px solid ${cur.accentColor}60`,
              marginBottom: '1.5rem',
              animation: 'slideUp 0.5s ease both',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: cur.accentColor + '28',
              }}>
                <SlideIcon size={15} color={cur.accentColor} />
              </span>
              <span style={{ fontSize: '0.77rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {cur.tag}
              </span>
            </div>

            {/* Headline */}
            <h1 key={slide + 'h1'} style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 800, color: 'white',
              lineHeight: 1.12, marginBottom: '1.25rem',
              animation: 'slideUp 0.5s 0.07s ease both',
            }}>
              {parts[0]}
              <em style={{ fontStyle: 'italic', color: cur.accentColor }}>{cur.italic}</em>
              {parts[1]}
            </h1>

            {/* Sub */}
            <p key={slide + 'sub'} style={{
              fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.75, marginBottom: '2.25rem',
              animation: 'slideUp 0.5s 0.14s ease both',
            }}>
              {cur.sub}
            </p>

            {/* CTAs */}
            <div key={slide + 'cta'} style={{
              display: 'flex', gap: '1rem', flexWrap: 'wrap',
              marginBottom: '3rem',
              animation: 'slideUp 0.5s 0.2s ease both',
            }}>
              <Link to={cur.cta1.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2.25rem', borderRadius: '40px',
                fontSize: '1rem', fontWeight: 700, color: 'var(--night)',
                background: 'var(--amber)', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(244,168,48,0.45)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(244,168,48,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(244,168,48,0.45)'; }}
              >
                {cur.cta1.label} <ArrowRight size={18} />
              </Link>
              <Link to={cur.cta2.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem 2rem', borderRadius: '40px',
                fontSize: '1rem', fontWeight: 500, color: 'white',
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
              >
                {cur.cta2.label}
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: '2.5rem', flexWrap: 'wrap',
              animation: 'slideUp 0.5s 0.27s ease both',
            }}>
              {STATS.map(s => (
                <div key={s.lbl}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{s.num}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: student photo ── */}
          <div key={slide + 'img'} style={{
            flexShrink: 0,
            position: 'relative',
            width: 'clamp(200px, 26vw, 360px)',
            animation: 'slideUp 0.65s 0.1s ease both',
          }}>
            {/* Outer decorative ring */}
            <div style={{
              position: 'absolute',
              top: '-16px', right: '-16px',
              width: '100%', height: '100%',
              borderRadius: '50% 50% 48% 48% / 55% 55% 45% 45%',
              border: `2.5px solid ${cur.accentColor}50`,
              zIndex: 0,
            }} />
            {/* Inner ring */}
            <div style={{
              position: 'absolute',
              top: '-6px', right: '-6px',
              width: '100%', height: '100%',
              borderRadius: '50% 50% 48% 48% / 55% 55% 45% 45%',
              border: `1px solid ${cur.accentColor}28`,
              zIndex: 0,
            }} />

            {/* Photo */}
            <img
              src={cur.studentImg}
              alt="Student"
              style={{
                position: 'relative', zIndex: 1,
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                objectPosition: 'top center',
                borderRadius: '50% 50% 48% 48% / 55% 55% 45% 45%',
                border: `3px solid ${cur.accentColor}`,
                display: 'block',
                boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 7px rgba(255,255,255,0.06)`,
              }}
            />

            {/* Floating badge: rating */}
            <div style={{
              position: 'absolute', bottom: '12%', left: '-28px', zIndex: 2,
              background: 'white', borderRadius: '14px',
              padding: '0.55rem 0.9rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Star size={14} fill="#F4A830" color="#F4A830" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0D1F1A' }}>4.9</span>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>avg rating</span>
            </div>

            {/* Floating badge: tutors */}
            <div style={{
              position: 'absolute', top: '14%', left: '-28px', zIndex: 2,
              background: cur.accentColor,
              borderRadius: '14px',
              padding: '0.5rem 0.85rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Users size={13} color="#0D1F1A" />
              <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0D1F1A' }}>134+ tutors</span>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '5%',
          display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 4,
        }}>
          <button onClick={prev} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ChevronLeft size={17} />
          </button>
          <div style={{ display: 'flex', gap: '7px' }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} style={{
                width: i === slide ? 26 : 8, height: 8, borderRadius: '4px',
                background: i === slide ? 'var(--amber)' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <button onClick={next} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ChevronRight size={17} />
          </button>
        </div>

        <style>{`
          @keyframes bgFade  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 768px) {
            .hero-student { display: none !important; }
          }
        `}</style>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '40px', background: 'var(--pale)', color: 'var(--jade)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>How it works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>Three steps to fluency</h2>
          <p style={{ fontSize: '1rem', color: 'var(--mist)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>Designed for busy people who want real results, not just exposure.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { step: '01', icon: Users,        title: 'Choose your tutor',   desc: 'Browse verified profiles filtered by your level (A1–C2), speciality, budget, and availability. Every tutor has a video intro and real reviews.' },
            { step: '02', icon: Calendar,      title: 'Book a session',      desc: 'Pick a time that works for you from live availability. Pay securely — funds held in escrow until session is complete.' },
            { step: '03', icon: GraduationCap, title: 'Track your progress', desc: 'After each session, your CEFR level tracker updates. Earn your certificate when you hit the target — blockchain-verified instantly.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--sand)', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 700, color: 'var(--sand)', lineHeight: 1, marginBottom: '1rem' }}>{step}</div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={22} color="white" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '0.6rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--mist)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED TUTORS ── */}
      <section style={{ padding: '3rem 2rem 5rem', background: 'var(--sand)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--ink)' }}>Top-rated tutors</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--mist)', marginTop: '0.25rem' }}>Hand-picked for quality, reliability, and results</p>
            </div>
            <Link to="/tutors" style={{ fontSize: '0.875rem', color: 'var(--jade)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all tutors <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['All', 'A1–A2', 'B1–B2', 'C1–C2'].map(lvl => (
              <button key={lvl} onClick={() => setLevelFilter(lvl)} style={{
                padding: '0.4rem 1rem', borderRadius: '40px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid transparent',
                background: levelFilter === lvl ? 'var(--forest)' : 'white',
                color: levelFilter === lvl ? 'white' : 'var(--slate)',
                borderColor: levelFilter === lvl ? 'var(--forest)' : 'var(--fog)',
                transition: 'all 0.2s',
              }}>{lvl}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {SAMPLE_TUTORS.map(t => <TutorCard key={t.name} tutor={t} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>Everything you need to succeed</h2>
          <p style={{ fontSize: '1rem', color: 'var(--mist)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>LughaPro combines expert tutoring, intelligent tools, and secure infrastructure.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: '1.75rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--sand)', boxShadow: 'var(--shadow)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--mint)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--sand)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={22} color="var(--jade)" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--mist)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '4rem 2rem', background: 'var(--night)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'white', marginBottom: '0.5rem' }}>Real learners, real results</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>Join thousands who have transformed their Kiswahili with LughaPro</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: '1.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} fill="#F4A830" color="#F4A830" />)}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '1.25rem' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '40px', background: 'var(--pale)', color: 'var(--jade)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Transparent pricing</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--ink)', marginBottom: '0.75rem' }}>Simple plans, serious results</h2>
          <p style={{ fontSize: '1rem', color: 'var(--mist)', maxWidth: '400px', margin: '0 auto' }}>No hidden fees. Session prices set by tutors and shown upfront.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              padding: '2rem', borderRadius: 'var(--radius-lg)',
              border: plan.highlight ? '2px solid var(--forest)' : '1.5px solid var(--sand)',
              background: plan.highlight ? 'var(--night)' : 'white',
              boxShadow: plan.highlight ? 'var(--shadow-xl)' : 'var(--shadow)',
              position: 'relative', display: 'flex', flexDirection: 'column',
              transform: plan.highlight ? 'scale(1.03)' : 'none',
            }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '0.25rem 1rem', borderRadius: '20px', background: 'var(--amber)', color: 'var(--night)', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.badge}</div>
              )}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: plan.highlight ? 'var(--mint)' : 'var(--jade)', marginBottom: '0.5rem' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: plan.highlight ? 'white' : 'var(--ink)' }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span style={{ fontSize: '0.82rem', color: plan.highlight ? 'rgba(255,255,255,0.45)' : 'var(--mist)' }}>/{plan.period.split(' ')[1]}</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: plan.highlight ? 'rgba(255,255,255,0.55)' : 'var(--mist)' }}>{plan.desc}</p>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.6rem', fontSize: '0.875rem', color: plan.highlight ? 'rgba(255,255,255,0.75)' : 'var(--slate)' }}>
                    <Check size={16} color={plan.highlight ? 'var(--mint)' : 'var(--jade)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={plan.href} style={{
                display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                background: plan.highlight ? 'var(--amber)' : 'var(--forest)',
                color: plan.highlight ? 'var(--night)' : 'white',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.82rem', color: 'var(--mist)' }}>Tutor session rates are set independently. Most tutors charge $15–$35/hr.</p>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '0 2rem 5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--night) 0%, #0B3D2E 100%)',
          borderRadius: 'var(--radius-xl)', padding: '3.5rem 3rem',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,191,160,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: '-60px', bottom: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,168,48,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: 'white', marginBottom: '0.75rem' }}>Ready to speak Kiswahili?</h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '420px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
            Join 10,000+ learners who have built real fluency with LughaPro's expert-guided approach.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.9rem 2.5rem', borderRadius: '40px',
            fontSize: '1rem', fontWeight: 700,
            background: 'var(--amber)', color: 'var(--night)',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(244,168,48,0.4)',
          }}>
            Create free account <ArrowRight size={18} />
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>No credit card required. First 3 AI sessions free.</p>
        </div>
      </section>
    </div>
  );
}

/* ── Tutor Card ── */
function TutorCard({ tutor }) {
  return (
    <Link to="/tutors" style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-lg)',
        border: '1.5px solid transparent', boxShadow: 'var(--shadow)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        cursor: 'pointer', transition: 'all 0.25s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--mint)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'transparent'; }}>
        <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: tutor.bg, color: tutor.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700 }}>
              {tutor.initials}
            </div>
            {tutor.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink)' }}>{tutor.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--mist)', marginBottom: '2px' }}>{tutor.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)' }}>
              <Star size={12} fill="var(--gold)" color="var(--gold)" />
              {tutor.rating} <span style={{ color: 'var(--mist)', fontWeight: 400 }}>({tutor.reviews})</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 1.25rem 0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            {tutor.tags.map(tag => (
              <span key={tag} className="tag" style={tag.includes('Elite') || tag.includes('CEFR') ? { background: 'rgba(201,146,26,0.12)', color: 'var(--gold)' } : {}}>{tag}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--mist)', lineHeight: 1.55 }}>{tutor.bio}</p>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-mono)', background: '#EEF2FF', color: '#4F46E5' }}>Stripe</span>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-mono)', background: 'var(--pale)', color: 'var(--jade)' }}>cUSD</span>
          </div>
        </div>
        <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--forest)' }}>
            ${tutor.price} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--mist)', fontFamily: 'var(--font-body)' }}>/ hr</span>
          </div>
          <div style={{ padding: '0.45rem 1.1rem', borderRadius: '40px', fontSize: '0.83rem', fontWeight: 600, color: 'white', background: 'var(--forest)' }}>
            Book session
          </div>
        </div>
      </div>
    </Link>
  );
}