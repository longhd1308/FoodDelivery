const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Thêm hỗ trợ .cjs nếu cần
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Tắt tính năng thử nghiệm gây lỗi (đặc biệt trên Windows + Node.js >=18)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;