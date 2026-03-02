/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["pg", "@prisma/adapter-pg", "pdf-parse"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
                // pathname: '/api/portraits/**',
            },
        ],
    },
};

export default nextConfig;
