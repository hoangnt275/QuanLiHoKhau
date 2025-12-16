module.exports = (query) => {
    const filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: "",
        },
        {
            name: "Thường trú",
            status: "Thường trú",
            class: "",
        },
        {
            name: "Tạm trú",
            status: "Tạm trú",
            class: "",
        },
        {
            name: "Tạm vắng",
            status: "Tạm vắng",
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
