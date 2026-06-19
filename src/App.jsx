import { lazy, Suspense } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";

const About = lazy(() => import("./sections/About"));
const Projects = lazy(() => import("./sections/Projects"));
const Experiences = lazy(() => import("./sections/Experiences"));
const Testimonial = lazy(() => import("./sections/Testimonial"));
const Contact = lazy(() => import("./sections/Contact"));
const Footer = lazy(() => import("./sections/Footer"));

const App = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <Navbar />
      <Hero />
      <Suspense fallback={null}>
        <About />
        <Projects />
        <Experiences />
        <Testimonial />
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
};

export default App;
