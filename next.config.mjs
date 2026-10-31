/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Foto de perfil enviada pelo usuário (specs/08-design-system.md, "Avatar")
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
