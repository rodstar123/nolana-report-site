import Hero from "@/components/Hero";
import DataBar from "@/components/DataBar";
import WhatYouGet from "@/components/WhatYouGet";
import SampleBriefing from "@/components/SampleBriefing";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <DataBar />
      <WhatYouGet />
      <SampleBriefing />
      <Pricing />
      <About />
      <Footer />
    </>
  );
}
