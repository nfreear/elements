import neostandard from 'neostandard';

export default neostandard({
  globals: ['HTMLElement'],
  ignores: ['_BAK', 'what*', 'out/**'],
  semi: true,  // Enforce semicolons (like semistandard)
});
