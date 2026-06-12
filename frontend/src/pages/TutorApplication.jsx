import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { tutorService } from '../features/tutors/tutorService';
import { LEVEL_CODES } from '../utils/constants';

const STEPS = ['Personal Info', 'Credentials', 'Teaching Setup', 'Payment', 'Review'];

export default function TutorApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [d, setD] = useState({
    full_name: '', location: '', profile_image_url: '', bio: '', teaching_languages: 'Kiswahili, English',
    education: '', years_experience: '', certifications: '', demo_video_url: '',
    hourly_rate: '', session_lengths: '30, 60, 90', availability: '', specialties: [],
    payout_method: 'stellar', stripe_account: '', stellar_wallet: '',
  });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const toggleSpecialty = (l) => setD((p) => ({ ...p, specialties: p.specialties.includes(l) ? p.specialties.filter((x) => x !== l) : [...p.specialties, l] }));

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      await tutorService.createProfile({
        bio: d.bio,
        hourly_rate: Number(d.hourly_rate) || 0,
        availability_summary: d.availability || `Sessions: ${d.session_lengths} min`,
        expertise: d.specialties.join(', ') || 'A1, A2',
        profile_image_url: d.profile_image_url || null,
        location: d.location || null,
        teaching_focus: `Education: ${d.education}; Experience: ${d.years_experience} yrs; Languages: ${d.teaching_languages}; Demo: ${d.demo_video_url}; Payout: ${d.payout_method}`,
      });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed. You may already have a profile.');
    } finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center' }} className="card">
        <div style={{ padding: '3rem' }}>
          <CheckCircle size={48} className="text-jade" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ color: 'var(--forest)', fontSize: '1.5rem' }}>Application Submitted!</h1>
          <p style={{ color: 'var(--slate)', marginTop: 10 }}>Your tutor profile is now <strong>pending review</strong>. We'll email you once it's approved.</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/tutor/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--forest)' }}>Become a Tutor</h1>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 6, margin: '1.25rem 0 1.5rem' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div className="progress-wrap"><div className="progress-fill" style={{ width: i <= step ? '100%' : '0%' }} /></div>
            <p style={{ fontSize: '0.68rem', color: i === step ? 'var(--forest)' : 'var(--mist)', marginTop: 4, fontWeight: i === step ? 700 : 500 }}>{s}</p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: 'var(--rust)', marginBottom: 12 }}>{error}</p>}

      <div className="card" style={{ padding: '1.75rem' }}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ color: 'var(--forest)' }}>Personal Info</h3>
            <input className="input-field" placeholder="Full name" value={d.full_name} onChange={(e) => set('full_name', e.target.value)} />
            <input className="input-field" placeholder="Location" value={d.location} onChange={(e) => set('location', e.target.value)} />
            <input className="input-field" placeholder="Profile photo URL" value={d.profile_image_url} onChange={(e) => set('profile_image_url', e.target.value)} />
            <textarea className="input-field" rows={3} placeholder="Short bio" value={d.bio} onChange={(e) => set('bio', e.target.value)} />
            <input className="input-field" placeholder="Teaching languages" value={d.teaching_languages} onChange={(e) => set('teaching_languages', e.target.value)} />
          </div>
        )}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ color: 'var(--forest)' }}>Credentials</h3>
            <input className="input-field" placeholder="Highest education level" value={d.education} onChange={(e) => set('education', e.target.value)} />
            <input className="input-field" type="number" placeholder="Years of experience" value={d.years_experience} onChange={(e) => set('years_experience', e.target.value)} />
            <input className="input-field" placeholder="Certifications (optional)" value={d.certifications} onChange={(e) => set('certifications', e.target.value)} />
            <input className="input-field" placeholder="Demo video URL" value={d.demo_video_url} onChange={(e) => set('demo_video_url', e.target.value)} />
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ color: 'var(--forest)' }}>Teaching Setup</h3>
            <input className="input-field" type="number" placeholder="Hourly rate (USD)" value={d.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)} />
            <input className="input-field" placeholder="Session lengths offered (min)" value={d.session_lengths} onChange={(e) => set('session_lengths', e.target.value)} />
            <textarea className="input-field" rows={2} placeholder="Weekly availability summary" value={d.availability} onChange={(e) => set('availability', e.target.value)} />
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate)', marginBottom: 6 }}>Level specialties</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LEVEL_CODES.map((l) => (
                  <button key={l} onClick={() => toggleSpecialty(l)} type="button"
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      border: '1.5px solid', borderColor: d.specialties.includes(l) ? 'var(--jade)' : 'var(--fog)',
                      background: d.specialties.includes(l) ? 'var(--pale)' : 'white',
                      color: d.specialties.includes(l) ? 'var(--forest)' : 'var(--slate)',
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ color: 'var(--forest)' }}>Payment Setup</h3>
            <select className="input-field" value={d.payout_method} onChange={(e) => set('payout_method', e.target.value)}>
              <option value="stellar">Stellar wallet (XLM/USDC)</option>
              <option value="stripe">Stripe Connect</option>
            </select>
            {d.payout_method === 'stellar'
              ? <input className="input-field" placeholder="Stellar wallet address (G...)" value={d.stellar_wallet} onChange={(e) => set('stellar_wallet', e.target.value)} />
              : <input className="input-field" placeholder="Stripe account email" value={d.stripe_account} onChange={(e) => set('stripe_account', e.target.value)} />}
          </div>
        )}
        {step === 4 && (
          <div>
            <h3 style={{ color: 'var(--forest)', marginBottom: 12 }}>Review & Submit</h3>
            <ReviewRow label="Name" value={d.full_name} />
            <ReviewRow label="Location" value={d.location} />
            <ReviewRow label="Hourly rate" value={d.hourly_rate ? `$${d.hourly_rate}` : '-'} />
            <ReviewRow label="Specialties" value={d.specialties.join(', ') || '-'} />
            <ReviewRow label="Experience" value={`${d.years_experience || 0} yrs`} />
            <ReviewRow label="Payout" value={d.payout_method} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft size={15} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>Next <ChevronRight size={15} /></button>
          ) : (
            <button className="btn-amber" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--sand)', fontSize: '0.88rem' }}>
      <span style={{ color: 'var(--mist)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{value || '-'}</span>
    </div>
  );
}
