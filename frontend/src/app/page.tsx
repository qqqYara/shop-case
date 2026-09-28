import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import "./page.scss";

export default function Home() {
  return (
    <main className="home">
      <Hero />
      <HowItWorks />
    </main>
  );
}
