// src/pages/About.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        About Anantabhavi
      </h1>
      
      <div className="prose prose-sm prose-zinc dark:prose-invert">
        <p className="text-muted-foreground leading-relaxed mb-4">
          Anantabhavi—derived from Sanskrit words for "infinite" and "future"—is a speculative fiction generator 
          that helps you explore possible futures through AI-generated stories.
        </p>
        
        <p className="text-muted-foreground leading-relaxed mb-4">
          Speculative fiction allows us to examine our present by imagining alternatives. Through this tool, 
          you can explore fundamental questions: Who gets to define progress? How might we create more just and 
          inclusive societies? What consequences could our technological and social choices have?
        </p>
        
        <p className="text-muted-foreground leading-relaxed">
          By selecting different parameters, you can generate stories that challenge assumptions about society, 
          technology, and human potential—helping to envision the futures we might create together.
        </p>
      </div>
    </div>
  );
};

export default About;