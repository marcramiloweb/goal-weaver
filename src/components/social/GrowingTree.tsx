import React from 'react';
import { motion } from 'framer-motion';

interface GrowingTreeProps {
  level: number;
  maxLevel?: number;
  achievementsCount: number;
}

const GrowingTree: React.FC<GrowingTreeProps> = ({ level, maxLevel = 10, achievementsCount }) => {
  const normalizedLevel = Math.min(level, maxLevel);
  const progress = (normalizedLevel / maxLevel) * 100;
  
  // Tree grows based on level
  const treeHeight = 60 + (normalizedLevel * 15);
  const trunkHeight = 20 + (normalizedLevel * 5);
  const crownSize = 40 + (normalizedLevel * 12);
  const leafCount = Math.min(normalizedLevel * 3, 20);
  const fruitCount = Math.floor(achievementsCount / 2);

  const getTreeColor = () => {
    if (normalizedLevel <= 2) return { trunk: '#8B4513', crown: '#90EE90' };
    if (normalizedLevel <= 4) return { trunk: '#654321', crown: '#32CD32' };
    if (normalizedLevel <= 6) return { trunk: '#5D4E37', crown: '#228B22' };
    if (normalizedLevel <= 8) return { trunk: '#4A3728', crown: '#006400' };
    return { trunk: '#3D2914', crown: '#004D00' };
  };

  const colors = getTreeColor();

  const generateLeaves = () => {
    const leaves = [];
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const radius = crownSize * 0.3 + Math.random() * crownSize * 0.3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6 - crownSize * 0.2;
      leaves.push(
        <motion.circle
          key={`leaf-${i}`}
          cx={100 + x}
          cy={60 + y}
          r={4 + Math.random() * 3}
          fill={`hsl(${100 + Math.random() * 40}, 70%, ${35 + Math.random() * 20}%)`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        />
      );
    }
    return leaves;
  };

  const generateFruits = () => {
    const fruits = [];
    const fruitColors = ['#FF6B6B', '#FFD93D', '#FF8C00', '#FF69B4'];
    for (let i = 0; i < Math.min(fruitCount, 8); i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 4;
      const radius = crownSize * 0.25;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.5;
      fruits.push(
        <motion.circle
          key={`fruit-${i}`}
          cx={100 + x}
          cy={55 + y}
          r={5}
          fill={fruitColors[i % fruitColors.length]}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
        />
      );
    }
    return fruits;
  };

  return (
    <div className="flex flex-col items-center p-4">
      <svg width="200" height="180" viewBox="0 0 200 180">
        {/* Ground */}
        <ellipse cx="100" cy="170" rx="60" ry="10" fill="#8B7355" opacity="0.5" />
        
        {/* Trunk */}
        <motion.rect
          x={95}
          y={170 - trunkHeight}
          width={10}
          height={trunkHeight}
          fill={colors.trunk}
          rx={2}
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'bottom' }}
        />
        
        {/* Branches for higher levels */}
        {normalizedLevel >= 3 && (
          <>
            <motion.line
              x1={100}
              y1={170 - trunkHeight * 0.7}
              x2={80}
              y2={170 - trunkHeight * 0.9}
              stroke={colors.trunk}
              strokeWidth={3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            />
            <motion.line
              x1={100}
              y1={170 - trunkHeight * 0.7}
              x2={120}
              y2={170 - trunkHeight * 0.9}
              stroke={colors.trunk}
              strokeWidth={3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            />
          </>
        )}
        
        {/* Crown */}
        <motion.ellipse
          cx={100}
          cy={170 - trunkHeight - crownSize * 0.4}
          rx={crownSize * 0.6}
          ry={crownSize * 0.5}
          fill={colors.crown}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        
        {/* Additional crown layers for bigger trees */}
        {normalizedLevel >= 4 && (
          <motion.ellipse
            cx={100}
            cy={170 - trunkHeight - crownSize * 0.6}
            rx={crownSize * 0.5}
            ry={crownSize * 0.4}
            fill={`hsl(120, 60%, ${30 + normalizedLevel}%)`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />
        )}
        
        {/* Decorative leaves */}
        {generateLeaves()}
        
        {/* Fruits (achievements) */}
        {generateFruits()}
        
        {/* Sparkles for max level */}
        {normalizedLevel === maxLevel && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.text
                key={`sparkle-${i}`}
                x={70 + i * 15}
                y={30 + (i % 2) * 20}
                fontSize="12"
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                ✨
              </motion.text>
            ))}
          </>
        )}
      </svg>
      
      {/* Level indicator */}
      <div className="mt-2 text-center">
        <div className="text-lg font-bold text-foreground">Nivel {normalizedLevel}</div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {achievementsCount} logros conseguidos
        </div>
      </div>
    </div>
  );
};

export default GrowingTree;
