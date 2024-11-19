import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
const glsl = (await import('vite-plugin-glsl')).default;

export default defineConfig({
	plugins: [glsl(), viteSingleFile()]
});
