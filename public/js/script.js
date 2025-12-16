const deleteButton = document.querySelectorAll(".delete-button");
deleteButton.forEach((button) => {
    button.addEventListener("click", function (event) {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân khẩu này không?")) {
            event.preventDefault();
        }
    });
});
// form search

const formSearch = document.querySelector("#form-search");
if (formSearch) {
    formSearch.addEventListener("submit", (e) => {
        const url = new URL(window.location);
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;
        if (keyword) {
            url.searchParams.set("keyword", keyword);
        } else url.searchParams.delete("keyword");
        window.location = url;
    });
}
// end form search
// button status
const buttonStatus = document.querySelectorAll("[btn-status]");
const url = new URL(window.location);
if (buttonStatus.length > 0) {
    buttonStatus.forEach((button) => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("btn-status");
            if (status) {
                url.searchParams.set("status", status);
            } else url.searchParams.delete("status");
            // console.log(url.href);
            window.location = url;
        });
    });
}
// end button status
