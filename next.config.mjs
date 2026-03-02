/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: [
        "pg",
        "@prisma/adapter-pg",
        "pdf-parse",
        "mammoth",
    ],
    transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // canvas is a phantom optional dependency of jspdf/html2pdf
        config.resolve.alias.canvas = false;

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
                child_process: false,
                pg: false,
                "pg-native": false,
            };
        }

        return config;
    },
};

export default nextConfig;

