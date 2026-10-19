import React from "react";
import LiveMemberRoster from "@/components/LiveMemberRoster";

interface HomeRosterSectionProps {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export default function HomeRosterSection({
  badge,
  title,
  subtitle,
}: HomeRosterSectionProps) {
  return (
    <section id="roster" className="border-b-2 border-slate-900 bg-slate-50/50 py-16 dark:border-dark-border dark:bg-dark-base lg:py-24 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LiveMemberRoster badge={badge} title={title} subtitle={subtitle} />
      </div>
    </section>
  );
}
