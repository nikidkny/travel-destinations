export default {
  '**/*': 'prettier --write --ignore-unknown',
  'client/*.ts?(x)': () => 'npm run types -w client',
  'server/*.ts?(x)': () => 'npm run types -w server',
  'packages/types/*.ts?(x)': () => 'npm run types -w packages/types',
};
