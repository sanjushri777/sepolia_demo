/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /HeartbeatWorker.*\.js$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

export default nextConfig;