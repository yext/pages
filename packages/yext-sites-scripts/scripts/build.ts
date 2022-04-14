import { build } from 'vite'
import react from '@vitejs/plugin-react';
import yextSSG from '@yext/vite-plugin-yext-sites-ssg';

export default async () => {
  await build({
    // root: path.resolve(__dirname, './project'),
    // base: '/foo/',
    plugins: [react(), yextSSG()],
  });
};