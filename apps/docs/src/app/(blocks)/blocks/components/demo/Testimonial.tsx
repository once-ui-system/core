"use client";

import { Column } from "@once-ui-system/core";
import type React from "react";
import { type BlockExampleDef, BlockPage } from "../BlockPage";
import {
  Testimonial1,
  Testimonial2,
  Testimonial3,
  Testimonial4,
  Testimonial5,
  Testimonial6,
  Testimonial7,
  Testimonial8,
  Testimonial9,
  Testimonial10,
} from "@/blocks/modules";

const TESTIMONIALS = [
  {
    name: "Alex",
    avatar: "/images/avatars/01.png",
    role: "Product Designer",
    link: " ",
    content:
      "Creativity thrives when you have the right tools. Finding inspiration in every project keeps me going.",
  },
  {
    name: "Samantha",
    avatar: "/images/avatars/02.png",
    role: "Creative Coder",
    link: "https://once-ui.com",
    content:
      "Bringing ideas to life is what drives me. Every project is a new challenge, and I love the process of problem-solving.",
  },
  {
    name: "Kate",
    avatar: "/images/avatars/03.png",
    role: "Indie Maker",
    link: " ",
    content:
      "Working on something you truly believe in makes all the difference. Passion fuels creativity.",
  },
  {
    name: "Mika",
    avatar: "/images/avatars/04.png",
    role: "Freelance Developer",
    link: " ",
    content:
      "Every project teaches me something new. The journey of learning never really ends, and that’s the best part.",
  },
  {
    name: "Mark",
    avatar: "/images/avatars/05.png",
    role: "Agency Owner",
    link: " ",
    content:
      "Once UI was a game-changer for our agency. The components are so well-designed and easy to use, it saved us so much time.",
  },
  {
    name: "Lily",
    avatar: "/images/avatars/06.png",
    role: "Freelance Designer",
    link: " ",
    content:
      "The system gives me enough structure to move quickly without making every project look the same. Client reviews are faster and handoff is much clearer.",
  },
  {
    name: "John",
    avatar: "/images/avatars/07.png",
    role: "Freelance Designer",
    link: " ",
    content:
      "I have been using Once UI for a while now and I must say, it has been a game-changer for me. The components are so well-designed and easy to use, it saved me so much time.",
  },
  {
    name: "Kathrina",
    avatar: "/images/avatars/08.png",
    role: "Creative Director",
    link: " ",
    content:
      "Our company has been using Once UI for a while now and I must say, it has been a game-changer for us. The components are so well-designed and easy to use, it saved us so much time.",
  },
];

const examples: BlockExampleDef[] = [
  {
    id: "Testimonial1",
    files: ["Testimonial1.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial1
          marginRight="12"
          minWidth={20}
          testimonials={TESTIMONIALS.slice(0, 4).map((testimonial) => ({
            ...testimonial,
            link: " ",
          }))}
        />
      </Column>
    ),
  },
  {
    id: "Testimonial2",
    files: ["Testimonial2.tsx"],
    render: () => (
      <Column fill vertical="center">
        <Testimonial2
          minHeight="l"
          title="Our team loves working with Once UI"
          content="Once UI was a great pick for our product. We loved the simplicity of the UI, and the quality of the components. It made our development process so much easier."
          avatar="/images/avatars/05.png"
          name="Jason W. Smith"
          src="/images/mockups/figma-01.png"
          alt="Product image"
          company="@Future Inc."
          link=" "
          role="Founder"
        />
      </Column>
    ),
  },
  {
    id: "Testimonial3",
    files: ["Testimonial3.tsx"],
    render: () => (
      <Column fill vertical="center">
        <Testimonial3 testimonials={TESTIMONIALS} />
      </Column>
    ),
  },
  {
    id: "Testimonial4",
    files: ["Testimonial4.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial4
          maxWidth="s"
          minHeight="l"
          title="Our team loves working with Once UI"
          content="Once UI was a great pick for our product. We loved the simplicity of the UI, and the quality of the components. It made our development process so much easier."
          name="Lorant One"
          avatar="/images/creators/lorant.jpg"
          company={{
            name: "Dopler",
            url: "https://dopler.app",
          }}
          role="Founder"
        />
      </Column>
    ),
  },
  {
    id: "Testimonial5",
    files: ["Testimonial5.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial5 testimonials={TESTIMONIALS} />
      </Column>
    ),
  },
  {
    id: "Testimonial6",
    files: ["Testimonial6.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial6
          rating={4.8}
          reviewCount={1250}
          testimonials={TESTIMONIALS.slice(0, 6).map(({ link, ...testimonial }) => testimonial)}
        />
      </Column>
    ),
  },
  {
    id: "Testimonial7",
    files: ["Testimonial7.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial7 />
      </Column>
    ),
  },
  {
    id: "Testimonial8",
    files: ["Testimonial8.tsx"],
    render: () => (
      <Column fill center>
        <Testimonial8 />
      </Column>
    ),
  },
  {
    id: "Testimonial9",
    files: ["Testimonial9.tsx"],
    render: () => (
      <Column fill center background="page">
        <Testimonial9 />
      </Column>
    ),
  },
  {
    id: "Testimonial10",
    files: ["Testimonial10.tsx", "Testimonial10.module.scss", "Testimonial2.tsx"],
    render: () => (
      <Column fill center background="page">
        <Testimonial10 />
      </Column>
    ),
  },
];

const Docs: React.FC = () => <BlockPage category="testimonial" examples={examples} />;

export default Docs;
