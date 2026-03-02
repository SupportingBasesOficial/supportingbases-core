import { run } from 'vitest';
import { writeFileSync } from 'fs';

(async () => {
  const result = await run({
    run: true,
    include: ['tests/**/*.test.ts'],
    silent: true, // suppress console
    reporters: 'json',
  });
  // result is boolean; detailed results are written via reporter
  // vitest writes to process.stdout; we capture by listener
  process.on('exit', () => {
    // nothing
  });
})();

