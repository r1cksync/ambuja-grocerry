/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'ambuja-neotia-grocery.s3.ap-south-1.amazonaws.com',
      'images.unsplash.com',
      'via.placeholder.com',
    ],
  },
};

module.exports = nextConfig;
