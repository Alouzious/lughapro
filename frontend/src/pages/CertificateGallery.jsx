import { useEffect, useState } from 'react';
import { Loader2, Award, ExternalLink, Share2 } from 'lucide-react';
import { certificateService } from '../features/certificates/certificateService';
import LevelBadge from '../components/LevelBadge';

export default function CertificateGallery() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.me()
      .then((d) => setCerts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shareUrl = (cert) => `${window.location.origin}/certificates/verify/${cert.stellar_tx_hash}`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <h1 className="font-display" style={{ fontSize: '2rem', color: 'var(--forest)' }}>My Certificates</h1>
      <p style={{ color: 'var(--slate)', marginTop: 6, marginBottom: 24 }}>
        Blockchain-verified CEFR certificates, minted on Stellar as you complete each level.
      </p>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin text-jade" size={26} /></div>}
      {!loading && certs.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--mist)' }}>
          <Award size={36} style={{ margin: '0 auto 12px', color: 'var(--fog)' }} />
          <p>No certificates yet. Complete a level to earn your first one.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {certs.map((cert) => (
          <div key={cert.id} className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--forest), var(--jade))', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Award size={32} color="var(--amber)" />
              <LevelBadge level={cert.level} size="lg" />
            </div>
            <h3 style={{ marginTop: 16, fontSize: '1.2rem' }}>Kiswahili {cert.level}</h3>
            <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 4 }}>
              Issued {new Date(cert.issued_at).toLocaleDateString()}
            </p>
            <p className="font-mono" style={{ fontSize: '0.66rem', opacity: 0.7, marginTop: 10, wordBreak: 'break-all' }}>
              tx: {cert.stellar_tx_hash}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <a href={shareUrl(cert)} target="_blank" rel="noreferrer" style={linkBtn}>
                <ExternalLink size={13} /> Verify
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl(cert))}`}
                target="_blank" rel="noreferrer" style={linkBtn}
              >
                <Share2 size={13} /> Share
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const linkBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '0.4rem 0.8rem', borderRadius: 40, fontSize: '0.76rem', fontWeight: 600,
  background: 'rgba(255,255,255,0.18)', color: 'white', textDecoration: 'none',
};
