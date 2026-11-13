import { features } from "@/lib/data";
import { FeatureSection } from "./FeatureSection";

export function Features() {
  return (
    <div id="features" style={{ scrollMarginTop: "4rem" }}>
      {features.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} reversed={index % 2 === 1} />
      ))}
    </div>
  );
}
