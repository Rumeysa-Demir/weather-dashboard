import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
            // Visual Studio'nun kilitlediði gizli .vs klasörünü izlemeyi býrakýyoruz
            ignored: ['**/.vs/**']
        }
    }
})