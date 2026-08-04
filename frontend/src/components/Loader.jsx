import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-surface-color/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px]";

  return (
    <div className={containerClasses}>
      <div>
        <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm font-medium text-text-muted animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
