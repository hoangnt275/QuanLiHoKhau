module.exports = (query) => {
    const filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: "",
        },
        {
            name: "Đang quản lý",
            status: "Đang quản lý",
            class: "",
        },
        {
            name: "Tạm khóa",
            status: "Tạm khóa",
            class: "",
        },
        {
            name: "Đã hủy",
            status: "Đã hủy",
            class: "",
        },
    ];

    if (query.status) {
        const index = filterStatus.findIndex(
            (item) => item.status == query.status
        );
        filterStatus[index].class = "active";
    } else {
        filterStatus[0].class = "active";
    }
    return filterStatus;
};
