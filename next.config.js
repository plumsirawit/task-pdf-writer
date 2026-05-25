export default {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: "picsum.photos" },
      { hostname: "firebasestorage.googleapis.com" },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};
