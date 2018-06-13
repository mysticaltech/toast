import React from 'react';

const colors = [
  'var(--color-negative)',
  'var(--color-positive)',
  'var(--color-brand)',
];

export default ({ show }) => {
  if (!show) {
    return (
      <div
        style={{
          backgroundColor: colors[colorIdx],
          borderRadius: '100%',
          position: 'absolute',
          transition: '0.2s ease-in-out all',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
        }}
      />
    );
  }

  const colorIdx = Math.floor(Math.random() * 3);
  const size = Math.random() * 2 + 4;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  return (
    <div
      style={{
        backgroundColor: colors[colorIdx],
        borderRadius: '100%',
        position: 'absolute',
        transition: '0.2s ease-in-out all',
        top: `${y}%`,
        left: `${x}%`,
        width: `${size}vh`,
        height: `${size}vh`,
      }}
    />
  );
};
