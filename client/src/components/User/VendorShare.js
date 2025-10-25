import React, { useContext, useMemo } from 'react';
import styles from './VendorShare.module.css';
import { PartnerContext } from '../../contexts/PartnerContext';

function qrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`;
}

export default function VendorShare(){
  const { partner } = useContext(PartnerContext);
  const shareLink = useMemo(() => partner?.slug ? `${window.location.origin}/store/${partner.slug}` : '', [partner]);

  if (!shareLink) return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      <h3 style={{ margin: 0 }}>Share your store</h3>
      <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>Your store link will appear here once your profile has a shop name.</p>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3>Share your store</h3>
          <p className={styles.subtitle}>Your unique link and QR are auto-generated from your shop name.</p>
        </div>
        <div className={styles.body}>
          <div className={styles.qrPanel}>
            <img src={qrUrl(shareLink)} alt="Store QR" className={styles.qrImage} />
          </div>
          <div className={styles.infoPanel}>
            <label className={styles.label}>Store link</label>
            <div className={styles.linkRow}>
              <input className={styles.linkInput} value={shareLink} readOnly />
              <button className={styles.copyBtn} onClick={()=>navigator.clipboard.writeText(shareLink)}>Copy</button>
            </div>
            <div className={styles.actions}>
              <a className={styles.actionBtn} href={qrUrl(shareLink)} download={`store-${partner.slug}-qr.png`}>Download QR</a>
              <a className={styles.actionBtn} href={shareLink} target="_blank" rel="noreferrer">Preview link</a>
            </div>
            <small className={styles.note}>This link cannot be edited. Contact support for changes.</small>

            <button
              className={styles.shareBtn}
              onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Check out my store!',
                  text: 'Here’s my store link:',
                  url: shareLink,
                })
                .catch(err => console.log('Share failed:', err));
              } else {
                alert('Sharing not supported on this browser. Copy the link manually.');
              }
              }}
              >
                Share store
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}


