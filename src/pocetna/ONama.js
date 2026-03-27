import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Onama.module.css';

gsap.registerPlugin(ScrollTrigger);

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
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        }
      });

      // ---- INICIJALNA STANJA ----
      gsap.set(block1Ref.current, { autoAlpha: 1, y: 0 });
      gsap.set([block2Ref.current, block3Ref.current], { autoAlpha: 0, y: 100 });

      // Progres bara se puni
      tl.to(progressBarRef.current, { height: '100%', ease: 'none' }, 0);

      // UNUTRAŠNJI PARALLAX SLIKE (Sada ide odmah nagore)
      tl.to(imageParallaxRef.current, {
        yPercent: -20,
        ease: 'none',
        duration: 0.3
      }, 0);

      // FAZA 1 -> Sklanjanje slike (odmah ide nagore)
      tl.to(block1Ref.current, {
        autoAlpha: 0,
        y: -150,
        duration: 0.25,
        ease: 'power2.in',
      }, 0);

      // FAZA 2 -> Dolazi tekst sa desne strane (ubrzano/skraćeno)
      tl.to(block2Ref.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out'
      }, 0.2);

      // Sklanja se tekst
      tl.to(block2Ref.current, {
        autoAlpha: 0,
        y: -150,
        duration: 0.2,
        ease: 'power2.in',
      }, 0.45);

      // FAZA 3 -> Dolaze rezultati
      tl.to(block3Ref.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.2,
        ease: 'power2.out'
      }, 0.6);

      // Kineticka animacija za brojeve (uskladjeno sa FAZA 3)
      tl.fromTo(stat500Ref.current, { innerHTML: 0 }, { innerHTML: 500, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
      tl.fromTo(stat50Ref.current, { innerHTML: 0 }, { innerHTML: 50, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
      tl.fromTo(stat10Ref.current, { innerHTML: 0 }, { innerHTML: 10, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);
      tl.fromTo(stat10000Ref.current, { innerHTML: 0 }, { innerHTML: 10000, snap: { innerHTML: 1 }, duration: 0.2, ease: 'none' }, 0.6);

      // FAZA 4 -> Krajnji izlaz rezultata
      tl.to(block3Ref.current, {
        autoAlpha: 0,
        y: -150,
        duration: 0.2,
        ease: 'power2.in'
      }, 0.85);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.scrollContainer} ref={containerRef}>
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
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a"
                  alt="Barber edukacija"
                  className={styles.editorialImage}
                  ref={imageParallaxRef}
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
