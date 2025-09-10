module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: '6.0.4', // Sử dụng phiên bản MongoDB cụ thể
            skipMD5: true,
        },
        autoStart: false,
        instance: {},
    },
};