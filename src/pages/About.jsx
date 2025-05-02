// src/pages/About.jsx
import React from 'react';
import { 
  BookOpen, 
  Zap, 
  Sparkles, 
  Globe, 
  Users, 
  Brain, 
  Wind, 
  Target 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-4">
      <Icon className="h-6 w-6 text-primary mr-3" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const About = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Creativity",
      description: "Leveraging advanced AI to transform abstract ideas into vivid narratives and imagery."
    },
    {
      icon: Wind,
      title: "Infinite Imagination",
      description: "Breaking free from conventional storytelling, exploring boundless creative landscapes."
    },
    {
      icon: Target,
      title: "Precision Customization",
      description: "Detailed parameter controls to fine-tune your creative vision with unprecedented accuracy."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3 mb-4">
          <Zap className="h-10 w-10 text-primary" />
          Anantabhavi
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Infinite Imagination, Boundless Creativity
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            What is Anantabhavi?
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Anantabhavi is a revolutionary AI-powered creative platform that generates 
            speculative fiction and imagery. The name 'Anantabhavi' is derived from 
            Sanskrit: 'Ananta' meaning infinite, and 'Bhavi' meaning becoming or 
            emerging – symbolizing the infinite potential of imagination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" />
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            We aim to democratize creative storytelling by providing an intuitive 
            platform that transforms abstract ideas into vivid, compelling narratives 
            and visual representations, pushing the boundaries of human creativity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Collaborative Effort
          </h2>
          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground leading-relaxed">
              Anantabhavi is a collaborative project between 13°77° and Mathscapes, 
              bringing together innovative technology and creative vision to 
              redefine storytelling in the digital age. Our team combines expertise 
              in artificial intelligence, creative writing, and user experience design 
              to create a truly unique platform.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center">
        <blockquote className="text-xl italic text-muted-foreground">
          "Where imagination knows no bounds"
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          Anantabhavi - Unleashing Creativity Through AI
        </p>
      </div>
    </div>
  );
};

export default About;