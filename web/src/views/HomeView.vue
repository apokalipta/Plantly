<template>
  <section class="section home-landing bg-stone-50">
    <section class="w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Transition appear name="fade">
          <header class="hero w-full">
            <div class="hero__content w-full">
              <h1 class="hero__title text-stone-800">
                Prenez soin de vos plantes sans effort avec <span class="text-emerald-900">Floraly</span>.
              </h1>
              <p class="hero__subtitle text-stone-500 leading-relaxed">
                Le pot de fleurs intelligent qui analyse l'environnement pour offrir des conditions de croissance idéales.
              </p>
              <router-link to="/boutique" class="hero__cta bg-slate-800 hover-bg-slate-700">Découvrir la boutique</router-link>
            </div>

            <div class="max-w-5xl mx-auto mt-16 w-full">
              <div class="hero__media w-full rounded-3xl overflow-hidden">
                <img
                  :src="floralyHeroImageUrl"
                  alt="Pot connecté Floraly"
                  class="hero__image w-full h-auto max-w-5xl mx-auto mix-blend-multiply"
                />
              </div>
            </div>
          </header>
        </Transition>
      </div>
    </section>

    <section class="section-block w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="section-heading">
          <h2 class="section-title text-stone-800">L'excellence en deux versions</h2>
          <p class="section-lead text-stone-500 leading-relaxed">Une approche minimaliste, une technologie discrète, un résultat évident.</p>
        </div>

        <div class="editorial-block grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div class="w-full">
            <div class="kicker text-stone-500">Floraly Classique</div>
            <h3 class="headline text-stone-800">L'essentiel, tout simplement.</h3>
            <p class="body text-stone-500 leading-relaxed">
              Surveillance intelligente, Wi‑Fi, capteurs d’humidité et design minimaliste pour un usage au quotidien, branché en continu.
            </p>
            <ul class="list">
              <li>Surveillance intelligente</li>
              <li>Connexion Wi‑Fi</li>
              <li>Design minimaliste</li>
            </ul>
          </div>

          <div class="w-full aspect-square md:aspect-[4/3] rounded-3xl bg-slate-200 overflow-hidden shadow-2xl">
            <img :src="floralyClassiqueImageUrl" alt="Floraly Classique" class="w-full h-full object-cover rounded-3xl" />
          </div>
        </div>

        <div class="editorial-block grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div class="w-full aspect-square md:aspect-[4/3] rounded-3xl bg-slate-200 overflow-hidden order-last lg:order-first shadow-2xl">
            <img :src="floralyPremiumImageUrl" alt="Floraly Premium" class="w-full h-full object-cover rounded-3xl" />
          </div>

          <div class="w-full text-lg-right">
            <div class="d-inline-flex align-items-center gap-2">
              <div class="kicker text-stone-500">Floraly Premium</div>
              <span class="glass">Série signature</span>
            </div>
            <h3 class="headline text-stone-800">L'expérience absolue.</h3>
            <p class="body text-stone-500 leading-relaxed">
              Écran intégré, autonomie sur batterie et capteurs haute précision, pour une présence technologique maîtrisée.
            </p>
            <ul class="list list--right">
              <li>Écran intégré</li>
              <li>Sur batterie</li>
              <li>Capteurs haute précision</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits-band py-24 w-full bg-beige">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="section-heading">
          <h2 class="section-title text-stone-800">Pourquoi Floraly ?</h2>
          <p class="section-lead text-stone-500 leading-relaxed">Des bénéfices concrets, au quotidien. Sans complexité.</p>
        </div>

        <div class="benefits">
          <div class="benefit">
            <div class="benefit__icon text-stone-800" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v6l4 2" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <div class="benefit__title text-stone-800">Fini les oublis</div>
              <div class="benefit__text text-stone-500 leading-relaxed">Des alertes au bon moment, sans surveillance constante.</div>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit__icon text-stone-800" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 21h10" />
                <path d="M12 17V3" />
                <path d="M5 12c2-2 5-2 7 0s5 2 7 0" />
              </svg>
            </div>
            <div>
              <div class="benefit__title text-stone-800">Des plantes en pleine santé</div>
              <div class="benefit__text text-stone-500 leading-relaxed">Des conditions idéales recréées, ajustées en continu.</div>
            </div>
          </div>

          <div class="benefit">
            <div class="benefit__icon text-stone-800" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7Z" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </div>
            <div>
              <div class="benefit__title text-stone-800">Un design qui sublime votre intérieur</div>
              <div class="benefit__text text-stone-500 leading-relaxed">Matériaux nobles et lignes épurées, visibles sans imposer.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="section-heading">
          <h2 class="section-title text-stone-800">Comment ça marche ?</h2>
          <p class="section-lead text-stone-500 leading-relaxed">Trois étapes. Une fois. Ensuite, vous profitez.</p>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step__num">01</div>
            <div class="step__title text-stone-800">Plantez</div>
            <div class="step__text text-stone-500 leading-relaxed">Installez votre plante dans le bac amovible.</div>
          </div>
          <div class="step">
            <div class="step__num">02</div>
            <div class="step__title text-stone-800">Connectez</div>
            <div class="step__text text-stone-500 leading-relaxed">Associez le pot à l'application Plantly.</div>
          </div>
          <div class="step">
            <div class="step__num">03</div>
            <div class="step__title text-stone-800">Apprenez et agissez</div>
            <div class="step__text text-stone-500 leading-relaxed">
              Floraly analyse et vous conseille pas à pas. Apportez à votre plante exactement ce dont elle a besoin.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-band w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="cta">
          <div>
            <h2 class="cta__title text-stone-800">Prêt à donner vie à votre intérieur ?</h2>
            <p class="cta__text text-stone-500 leading-relaxed">Découvrez Floraly et choisissez la version qui vous ressemble.</p>
          </div>
          <router-link to="/boutique" class="cta__btn bg-slate-800 hover-bg-slate-700">Visiter la boutique</router-link>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
function resolveStaticUrl(u) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const root = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return `${root}${u}`;
  return u;
}

const floralyHeroImageUrl = resolveStaticUrl('/static/HomePage/floraly-hero.png');
const floralyClassiqueImageUrl = resolveStaticUrl('/static/HomePage/floraly-classique.png');
const floralyPremiumImageUrl = resolveStaticUrl('/static/HomePage/floraly-premium.png');
</script>

<style scoped>
.home-landing {
  padding-top: 2.25rem;
}

.w-full { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }
.max-w-7xl { max-width: 80rem; }
.max-w-5xl { max-width: 64rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.mt-16 { margin-top: 4rem; }
.py-24 { padding-top: 6rem; padding-bottom: 6rem; }
.rounded-3xl { border-radius: 1.5rem; }
.bg-slate-200 { background: #e2e8f0; }
.overflow-hidden { overflow: hidden; }
.h-full { height: 100%; }
.object-cover { object-fit: cover; }
.h-auto { height: auto; }
.mix-blend-multiply { mix-blend-mode: multiply; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: 1fr; }
.gap-16 { gap: 4rem; }
.items-center { align-items: center; }
.order-last { order: 9999; }
.aspect-square { aspect-ratio: 1 / 1; }

@media (min-width: 640px) {
  .sm\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
}

@media (min-width: 768px) {
  .md\:aspect-\[4\/3\] { aspect-ratio: 4 / 3; }
}

@media (min-width: 1024px) {
  .lg\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\:grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .lg\:order-first { order: -9999; }
}

.bg-stone-50 { background: #fafaf9; }
.text-stone-800 { color: #292524; }
.text-stone-500 { color: #78716c; }
.text-stone-300 { color: #d6d3d1; }
.text-emerald-900 { color: #064e3b; }
.bg-slate-800 { background: #1f2937; }
.hover-bg-slate-700:hover { background: #334155; }
.leading-relaxed { line-height: 1.75; }
.shadow-2xl { box-shadow: 0 30px 90px rgba(41, 37, 36, 0.14); }
.bg-beige { background: #f9f7f2; }

.fade-enter-active {
  transition: opacity 650ms ease, transform 650ms cubic-bezier(.2, .8, .2, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.hero {
  text-align: center;
  padding: 6.5rem 0 4.5rem;
}

.hero__content {
  margin: 0 auto 3rem;
}

.hero__title {
  font-size: clamp(3rem, 5.2vw + 1rem, 6rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.hero__subtitle {
  margin: 0 auto 2.25rem;
  max-width: 720px;
  font-size: clamp(1.1rem, 1.2vw + 0.9rem, 1.6rem);
  font-weight: 300;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  padding: 1.05rem 2.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.hero__cta:hover {
  transform: scale(1.05);
  color: #fff;
}

.hero__media {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.hero__image {
  width: 100%;
  height: auto;
  max-height: clamp(280px, 42vw, 520px);
  display: block;
  animation: floaty 7.5s ease-in-out infinite;
  will-change: transform;
}

@keyframes floaty {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.section-block {
  padding: 7.5rem 0;
}

.section-heading {
  max-width: 860px;
  margin: 0 auto 4rem;
  text-align: center;
}

.section-title {
  font-size: clamp(1.9rem, 2.4vw + 1rem, 2.7rem);
  letter-spacing: -0.04em;
  margin: 0 0 1rem;
  font-weight: 700;
}

.section-lead {
  margin: 0 auto;
  font-weight: 300;
  font-size: 1.15rem;
  max-width: 44rem;
}

.editorial-block {
  margin-top: 7rem;
}

.kicker {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.glass {
  font-size: 0.85rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: rgba(250, 250, 249, 0.70);
  border: 1px solid rgba(120, 113, 108, 0.22);
  backdrop-filter: blur(10px);
  font-weight: 700;
}

.headline {
  font-size: clamp(1.8rem, 1.5vw + 1.4rem, 2.3rem);
  letter-spacing: -0.04em;
  margin: 0 0 1rem;
  font-weight: 700;
}

.body {
  font-weight: 300;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.65rem;
  color: #292524;
  font-weight: 500;
}

.list li {
  padding-left: 1.25rem;
  position: relative;
}

.list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(6, 95, 70, 0.35);
}

.list--right {
  margin-left: auto;
  max-width: 440px;
}

.benefits {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .benefits { grid-template-columns: repeat(3, 1fr); gap: 2rem; }
}

.benefit {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.benefit__icon {
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  opacity: 0.85;
}

.benefit__icon svg {
  width: 100%;
  height: 100%;
}

.benefit__title {
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.benefit__text {
  font-weight: 300;
}

.steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .steps { grid-template-columns: repeat(3, 1fr); gap: 2.5rem; }
}

.step__num {
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #d6d3d1;
  font-size: 2.6rem;
  margin-bottom: 0.75rem;
}

.step__title {
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.35rem;
}

.step__text {
  font-weight: 300;
}

.benefits-band {
  background: rgba(16, 185, 129, 0.06);
  border-top: 1px solid rgba(120, 113, 108, 0.18);
  border-bottom: 1px solid rgba(120, 113, 108, 0.18);
}

.cta-band {
  background: rgba(120, 113, 108, 0.08);
  padding: 6rem 0;
  border-top: 1px solid rgba(120, 113, 108, 0.18);
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cta__title {
  margin: 0 0 0.4rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  font-size: clamp(1.7rem, 1.4vw + 1.3rem, 2.3rem);
}

.cta__text {
  margin: 0;
  font-weight: 300;
}

.cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  padding: 0.95rem 1.75rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.cta__btn:hover {
  transform: scale(1.05);
  color: #fff;
}
</style>
