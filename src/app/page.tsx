import React from "react";
import HeroSection from "@/components/HeroSection";
import FounderFeature from "@/components/FounderFeature";
import LiveTournamentSection from "@/components/tournament/LiveTournamentSection";
import HomeMottoSection from "@/components/home/HomeMottoSection";
import HomeDivisionsSection from "@/components/home/HomeDivisionsSection";
import HomeActivitiesSection from "@/components/home/HomeActivitiesSection";
import HomeRosterSection from "@/components/home/HomeRosterSection";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import {
  DIVISIONS,
  ACTIVITIES,
  COMMUNITY_INFO,
  HOME_SECTIONS,
  HOME_SECTIONS_CONFIG,
} from "@/data/community";
import { getRuntimeSiteContent, normalizeHomeSections } from "@/lib/homeSections";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const runtimeContent = getRuntimeSiteContent();
  const sectionsConfig = normalizeHomeSections(
    runtimeContent.sectionsConfig || HOME_SECTIONS_CONFIG
  );
  const home = runtimeContent.home || {};

  const sectionRenderers: Record<string, React.ReactNode> = {
    hero: (
      <HeroSection
        key="hero"
        sticker={home.heroSticker}
        titleLine1={home.heroTitleLine1}
        titleLine2={home.heroTitleLine2}
        titleLine3={home.heroTitleLine3}
        description={home.heroDescription}
        primaryBtnText={home.heroPrimaryBtn}
        secondaryBtnText={home.heroSecondaryBtn}
      />
    ),
    tournament: <LiveTournamentSection key="tournament" />,
    motto: (
      <HomeMottoSection
        key="motto"
        filosofiTitle={home.filosofiTitle || HOME_SECTIONS.filosofiTitle}
        filosofiText={home.filosofiText || HOME_SECTIONS.filosofiText}
        regionalTitle={home.regionalTitle || HOME_SECTIONS.regionalTitle}
        regionalText={home.regionalText || HOME_SECTIONS.regionalText}
        solidaritasTitle={home.solidaritasTitle || HOME_SECTIONS.solidaritasTitle}
        solidaritasText={home.solidaritasText || HOME_SECTIONS.solidaritasText}
      />
    ),
    divisions: (
      <HomeDivisionsSection
        key="divisions"
        divisions={DIVISIONS}
        badge={home.divisionsBadge}
        title={home.divisionsTitle}
        subtitle={home.divisionsSubtitle}
        btnText={home.divisionsBtn}
      />
    ),
    founder: (
      <FounderFeature
        key="founder"
        badge={home.founderBadge}
        title={home.founderTitle}
        subtitle={home.founderSubtitle}
      />
    ),
    activities: (
      <HomeActivitiesSection
        key="activities"
        activities={ACTIVITIES}
        badge={home.activitiesBadge}
        title={home.activitiesTitle}
        btnText={home.activitiesBtn}
      />
    ),
    roster: (
      <HomeRosterSection
        key="roster"
        badge={home.rosterBadge}
        title={home.rosterTitle}
        subtitle={home.rosterSubtitle}
      />
    ),
    cta: (
      <HomeCtaSection
        key="cta"
        badge={home.ctaBadge}
        title={home.ctaTitle}
        description={home.ctaDescription}
        primaryBtnText={home.ctaPrimaryBtn}
        secondaryBtnText={home.ctaSecondaryBtn}
        whatsappUrl={COMMUNITY_INFO.socials.whatsapp}
      />
    ),
  };

  return (
    <div className="flex flex-col">
      {sectionsConfig
        .filter((sec) => sec.enabled)
        .map((sec) => sectionRenderers[sec.id] || null)}
    </div>
  );
}
