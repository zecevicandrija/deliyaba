import React, { useEffect, useRef } from 'react';
import styles from './Onama.module.css';
import slika from '../images/deliyaslike/deliya23.webp'

const ONama = () => {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  const block1Ref = useRef(null);
  const block2Ref = useRef(null);
  const block3Ref = useRef(null);

  const stat500Ref = useRef(null);
  const stat50Ref = useRef(null);
  const stat10Ref = useRef(null);
  const stat10000Ref = useRef(null);

  const imageParallaxRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let ctx;
    let observer;

    const loadGSAP = async () => {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (!isMounted) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          }
        });

        gsap.set(block1Ref.current, { autoAlpha: 1, y: 0 });
        gsap.set([block2Ref.current, block3Ref.current], { autoAlpha: 0, y: 100 });

        tl.to(progressBarRef.current, { height: '100%', ease: 'none' }, 0);
        tl.to(imageParallaxRef.current, { yPercent: -20, ease: 'none', duration: 0.3 }, 0);
        tl.to(block1Ref.current, { autoAlpha: 0, y: -150, duration: 0.25, ease: 'power2.in' }, 0);
        tl.to(block2Ref.current, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.2);
        tl.to(block2Ref.current, { autoAlpha: 0, y: -150, duration: 0.2, ease: 'power2.in' }, 0.45);
        tl.to(block3Ref.current, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.6);
        tl.fromTo(stat500Ref.current, { innerHTML: 0 }, { innerHTML: 500, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
        tl.fromTo(stat50Ref.current, { innerHTML: 0 }, { innerHTML: 50, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
        tl.fromTo(stat10Ref.current, { innerHTML: 0 }, { innerHTML: 10, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
        tl.fromTo(stat10000Ref.current, { innerHTML: 0 }, { innerHTML: 10000, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
        tl.to(block3Ref.current, { autoAlpha: 0, y: -150, duration: 0.2, ease: 'power2.in' }, 0.85);
      }, containerRef);
    };

    // GSAP se inicijalizuje tek kada se sekcija priblizi viewportu (400px ranije)
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          loadGSAP();
        }
      },
      { rootMargin: '400px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      isMounted = false;
      observer?.disconnect();
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section id="onama" className={styles.scrollContainer} ref={containerRef}>
      <div className={styles.stickyWrapper}>

        {/* Vodeni Zig */}
        <div className={styles.watermark}>DELIYA</div>

        {/* Leva Strana */}
        <div className={styles.leftColumn}>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} ref={progressBarRef} />
          </div>

          <div className={styles.stickyHeader}>
            <div className={styles.heroBadge}>
              <span className={styles.editorialLine}></span>
              <span>Barber Masterclass</span>
            </div>

            <h2 className={styles.stickyTitle}>
              VIZIJA
            </h2>

            <button className={styles.ctaButton} onClick={() => window.location.href = "/paket"}>
              POČNI DANAS
            </button>
          </div>
        </div>

        {/* Desna Strana */}
        <div className={styles.rightColumn}>
          <div className={styles.overlayBlocksContainer}>

            {/* Blok 1: Dominantna slika oštrih ivica, GSAP scroll prva faza */}
            <div className={`${styles.overlayBlock} ${styles.blockImage}`} ref={block1Ref}>
              <div className={styles.cleanImageWrapper}>
                <img
                  src={slika}
                  alt="Barber edukacija"
                  className={styles.editorialImage}
                  ref={imageParallaxRef}
                  loading="lazy"
                  width="1294"
                  height="864"
                />
              </div>
            </div>

            {/* Blok 2: O Nama Tekst, druga faza skrolanja */}
            <div className={`${styles.overlayBlock} ${styles.blockText}`} ref={block2Ref}>
              <h3 className={styles.sectionTitle}>
                NEMA TAJNI ZANATA.
              </h3>

              <div className={styles.textStack}>
                <p className={styles.bodyTextPremium}>
                  <strong>Naš fokus nije samo na šišanju.</strong> Fokusiramo se na poslovanje, branding
                  i psihologiju klijenta - elemente koji odvajaju dobre od najelitnijih berbera.
                </p>
                <p className={styles.bodyTextPremium}>
                  Mi stvaramo lidere u svetu barberinga. Zaboravi na nesigurnost sa makazama
                  i mašinicom. Vreme je da naučiš preciznost, vrhunske fade tehnike i kako da pravo
                  naplatiš svoj umetnički kvalitet.
                </p>
              </div>
            </div>

            {/* Blok 3: Kineticki Stats */}
            <div className={`${styles.overlayBlock} ${styles.blockStats}`} ref={block3Ref}>
              <h3 className={styles.sectionTitle}>
                REZULTATI.
              </h3>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statNumberWrapper}>
                    <span className={styles.statNumber} ref={stat500Ref}>0</span>
                    <span className={styles.statPlus}>+</span>
                  </div>
                  <span className={styles.statLabel}>Zadovoljnih Polaznika</span>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statNumberWrapper}>
                    <span className={styles.statNumber} ref={stat50Ref}>0</span>
                    <span className={styles.statPlus}>+</span>
                  </div>
                  <span className={styles.statLabel}>Master Edukacija</span>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statNumberWrapper}>
                    <span className={styles.statNumber} ref={stat10Ref}>0</span>
                    <span className={styles.statPlus}>+</span>
                  </div>
                  <span className={styles.statLabel}>Godina Iskustva</span>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statNumberWrapper}>
                    <span className={styles.statNumber} ref={stat10000Ref}>0</span>
                    <span className={styles.statPlus}>+</span>
                  </div>
                  <span className={styles.statLabel}>Savršenih Šišanja</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ONama;
