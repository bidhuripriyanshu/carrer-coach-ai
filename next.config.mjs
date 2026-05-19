
/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: [
        "pg",
        "@prisma/adapter-pg",
        "pdf-parse",
        "mammoth",
        "@google/genai",
        "inngest",
        "bcrypt",
        "sharp",
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
    webpack: (config, { isServer, webpack }) => {
        // canvas is a phantom optional dependency of jspdf/html2pdf
        config.resolve.alias.canvas = false;

        // pdf-parse loads test files at module init time — ignore them during bundling
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/test\//,
                contextRegExp: /pdf-parse/,
            })
        );

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
                crypto: false,
                stream: false,
                os: false,
                path: false,
                zlib: false,
            };
        }

        return config;
    },
};

export default nextConfig;

