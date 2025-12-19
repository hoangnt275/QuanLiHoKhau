module.exports = (query) => {
    const filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: "",
        },
        {
            name: "Đã đóng",
            status: "Đã đóng",
            class: "",
        },
        {
            name: "Đóng một phần",
            status: "Đóng một phần",
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
