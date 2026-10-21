const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**', '.repair-baseline/**', 'android/**', 'ios/**'] },
  {
    files: ['src/components/NativeSwipeDeck.tsx'],
    // Reanimated SharedValue.value is intentionally mutable. React Compiler is not
    // enabled here; retain the existing documented worklets and animation timings.
    rules: { 'react-hooks/immutability': 'off' },
  },
]);
