import { defineConfig } from 'vite';

export default defineConfig({
	assetsInclude: ['**/*.gltf', '**/*.bin'],
	root: './src',
	publicDir: '../public',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
	server: {
		open: true,
		port: 3000,
	}
});
