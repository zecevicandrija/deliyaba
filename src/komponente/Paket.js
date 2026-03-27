import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './Paket.module.css';

const plans = [
  {
    id: 1,
    tier: '[ TIER 01 ]',
    name: 'OSNOVNI',
    format: '4 NEDELJE // GRUPNI RAD',
    features: 'Osnove Fade-a / Rad na modelima / Sertifikat',
    price: 500,
    isRecommended: false
  },
  {
    id: 2,
    tier: '[ EKSKLUZIVNA PREPORUKA ]',
    name: 'NAPREDNI',
    format: '8 NEDELJA // 1 NA 1 MENTORSTVO',
    features: 'Micro-detaljisanje / Skin fade struktura / Biznis osnove',
    price: 850,
    isRecommended: true
  },
  {
    id: 3,
    tier: '[ TIER 02 ]',
    name: 'MASTERCLASS',
    format: '2 DANA // VIP INTENZIV',
    features: 'Brzina u radu / VIP uslovi / Brendiranje profila',
    price: 1200,
    isRecommended: false
  }
];

const Row = ({ plan, setHoveredRow }) => {
  const rowRef = useRef(null);
  const priceRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const obj = { value: 0 };
          gsap.to(obj, {
            value: plan.price,
            duration: 2.5,
            ease: "power3.out",
            onUpdate: () => {
              if (priceRef.current) {
                // Formatting to integers dynamically
                priceRef.current.innerText = Math.round(obj.value);
              }
            }
          });
        }
      });
    }, { threshold: 0.3 });

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, plan.price]);

  return (
    <a
      href="#prijavi-se"
      className={styles.row}
      ref={rowRef}
      onMouseEnter={() => setHoveredRow(true)}
      onMouseLeave={() => setHoveredRow(false)}
    >
      <div className={styles.col1}>
        <span className={`${styles.tier} ${plan.isRecommended ? styles.tierRecommended : ''}`}>
          {plan.tier}
        </span>
        <h3 className={styles.name}>{plan.name}</h3>
      </div>

      <div className={styles.col2}>
        {plan.format}
      </div>

      <div className={styles.col3}>
        {plan.features}
      </div>

      <div className={styles.col4}>
        <div className={styles.priceWrapper}>
          <span className={styles.currency}>€</span>
          <span className={styles.price} ref={priceRef}>000</span>
        </div>
        <div className={styles.action}>
          ODABERI <span className={styles.arrow}>↗</span>
        </div>
      </div>
    </a>
  );
};

const Paket = () => {
  const [isHoveringRow, setIsHoveringRow] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Custom cursor only for non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
      const onMouseMove = (e) => {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out"
        });
      };

      window.addEventListener('mousemove', onMouseMove);
      return () => window.removeEventListener('mousemove', onMouseMove);
    }
  }, []);

  return (
    <section className={styles.section} id="paketi">
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isHoveringRow ? styles.active : ''}`}
      >
        <span className={styles.cursorText}>PRIJAVI SE</span>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.headerTitle}>SPECIFIKACIJA PROGRAMA / 2026</p>
        </div>
        <div className={styles.rows}>
          {plans.map((plan, index) => (
            <Row
              key={plan.id}
              plan={plan}
              setHoveredRow={setIsHoveringRow}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Paket;
