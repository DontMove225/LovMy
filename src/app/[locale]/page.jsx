import AuthRedirect from './components/landing/AuthRedirect';
import Hero from './components/landing/Hero';
import Concept from './components/landing/Concept';
import Features from './components/landing/Features';
import Testimonials from './components/landing/Testimonials';
import DownloadCta from './components/landing/DownloadCta';
import LandingFooter from './components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian">
      <AuthRedirect />
      <Hero />
      <Concept />
      <Features />
      <Testimonials />
      <DownloadCta />
      <LandingFooter />
    </main>
  );
}
