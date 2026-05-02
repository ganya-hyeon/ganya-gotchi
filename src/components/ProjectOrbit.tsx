'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Box, Sparkles, Cpu } from 'lucide-react';

const icons = [Box, Cpu, Sparkles];

export default function ProjectOrbit() {
  const { projects, setActiveQuest } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {projects.map((project, index) => {
        const angle = (index / projects.length) * Math.PI * 2;
        const radius = 180;
        const Icon = icons[index % icons.length];

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute left-1/2 top-1/2 -ml-6 -mt-6 pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.2, filter: 'brightness(1.5)' }}
              onClick={() => setActiveQuest(project)}
              className={`w-12 h-12 rounded-lg hud-glass flex items-center justify-center group relative ${
                project.status === 'done' ? 'border-primary shadow-[0_0_10px_var(--primary)]' : 'border-primary/20'
              }`}
            >
              <Icon className={`w-5 h-5 ${project.status === 'done' ? 'text-primary' : 'text-primary/40'}`} />
              
              {/* Tooltip */}
              <div className="absolute top-14 hidden group-hover:block whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-primary/20 text-[10px] text-primary font-mono uppercase tracking-widest">
                {project.name}
              </div>
            </motion.button>
          </motion.div>
        );
      })}

      {/* Orbit Rings */}
      <div className="absolute left-1/2 top-1/2 -ml-[180px] -mt-[180px] w-[360px] h-[360px] border border-primary/5 rounded-full pointer-events-none" />
    </div>
  );
}
