module.exports = (query) => {
    const filterType = [
        {
            name: "Tất cả",
            type: "",
            class: "",
        },
        {
            name: "Bắt buộc",
            type: "Bắt buộc",
            class: "",
        },
        {
            name: "Tự nguyện",
            type: "Tự nguyện",
            class: "",
        },
        {
            name: "Đang thu",
            type: "Đang thu",
            class: "",
        },
        {
            name: "Hoàn thành",
            type: "Hoàn thành",
            class: "",
        },
        {
            name: "Đã hủy",
            type: "Đã hủy",
            class: "",
        },
    ];

    if (query.type) {
        const index = filterType.findIndex((item) => item.type == query.type);
        filterType[index].class = "active";
    } else {
        filterType[0].class = "active";
    }
    return filterType;
};
