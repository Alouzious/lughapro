import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, ShieldX, BookOpen } from 'lucide-react';
import { certificateService } from '../features/certificates/certificateService';
import LevelBadge from '../components/LevelBadge';

export default function CertificateVerify() {
  const { hash } = useParams();
  const [state, setState] = useState({ loading: true, cert: null, valid: false });

  useEffect(() => {
    certificateService.verify(hash)
      .then((d) => setState({ loading: false, cert: d.certificate, valid: d.valid }))
      .catch(() => setState({ loading: false, cert: null, valid: false }));
  }, [hash]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--forest)', fontWeight: 700, fontSize: '1.3rem', textDecoration: 'none', marginBottom: 24 }}>
        <BookOpen size={22} /> LughaPro
      </Link>

      <div className="card" style={{ padding: '2.5rem', maxWidth: 460, width: '100%', textAlign: 'center' }}>
        {state.loading ? (
          <Loader2 className="animate-spin text-jade" size={28} style={{ margin: '0 auto' }} />
        ) : state.valid && state.cert ? (
          <>
            <ShieldCheck size={48} className="text-jade" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ color: 'var(--forest)', fontSize: '1.4rem' }}>Verified Certificate</h1>
            <div style={{ margin: '16px 0' }}><LevelBadge level={state.cert.level} size="lg" /></div>
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{state.cert.student_name}</p>
            <p style={{ color: 'var(--slate)', marginTop: 4 }}>completed Kiswahili level {state.cert.level}</p>
            <p style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: 8 }}>
              Issued {new Date(state.cert.issued_at).toLocaleDateString()}
            </p>
            <p className="font-mono" style={{ fontSize: '0.66rem', color: 'var(--mist)', marginTop: 16, wordBreak: 'break-all' }}>
              Stellar tx: {state.cert.stellar_tx_hash}
            </p>
          </>
        ) : (
          <>
            <ShieldX size={48} className="text-rust" style={{ margin: '0 auto 12px' }} />
            <h1 style={{ color: 'var(--rust)', fontSize: '1.3rem' }}>Certificate Not Found</h1>
            <p style={{ color: 'var(--slate)', marginTop: 8 }}>This transaction hash does not match any issued certificate.</p>
          </>
        )}
      </div>
    </div>
  );
}
