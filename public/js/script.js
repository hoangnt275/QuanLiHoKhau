const deleteButton = document.querySelectorAll(".delete-button");
deleteButton.forEach((button) => {
    button.addEventListener("click", function (event) {
        if (!confirm("Bạn có chắc chắn muốn xóa không?")) {
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
const urlStatus = new URL(window.location);
if (buttonStatus.length > 0) {
    buttonStatus.forEach((button) => {
        button.addEventListener("click", (e) => {
            const status = button.getAttribute("btn-status");
            if (status) {
                urlStatus.searchParams.set("status", status);
            } else urlStatus.searchParams.delete("status");
            // immediate UI feedback
            buttonStatus.forEach((b) => b.classList.remove("selected"));
            if (status) button.classList.add("selected");
            // navigate
            window.location = urlStatus;
        });
    });
}
// end button status
// button Type
const buttonType = document.querySelectorAll("[btn-type]");
const urlType = new URL(window.location);
if (buttonType.length > 0) {
    buttonType.forEach((button) => {
        button.addEventListener("click", () => {
            const type = button.getAttribute("btn-type");
            if (type) {
                urlType.searchParams.set("type", type);
            } else urlType.searchParams.delete("type");
            // immediate UI feedback
            buttonType.forEach((b) => b.classList.remove("selected"));
            if (type) button.classList.add("selected");
            // navigate
            window.location = urlType;
        });
    });
}
// end button status
// get fee info by codeFee
const codeFee = document.getElementById("codeFee");
codeFee.addEventListener("blur", () => {
    console.log(codeFee.value);
    const fee = axios
        .get(`/fee/api/fee/by-code/${codeFee.value}`)
        .then((res) => {
            document.getElementById("nameFee").value = res.data.name;
            document.getElementById("valueFee").value = res.data.value;
            document.getElementById("typeFee").value = res.data.type;
        })
        .catch((err) => {
            console.error(err);
        });
});
// end get fee info by codeFee
// get payer info by cccd
const cccd = document.getElementById("cccdPayer");
cccd.addEventListener("blur", () => {
    console.log(cccd.value);
    const payer = axios
        .get(`/person/api/payer/by-cccd/${cccd.value}`)
        .then((res) => {
            const { payer, family } = res.data;
            console.log(res.data);
            document.getElementById("namePayer").value = payer.fullName;
            document.getElementById("familyPayer").value = family;
        })
        .catch((err) => {
            console.error(err);
        });
});
// end get fee info by codeFee

// Mark sidebar item active based on current path
(function markActiveSider() {
    try {
        const path = window.location.pathname.replace(/\/+$/, "") || "/";
        const links = document.querySelectorAll(".sidenav a");
        links.forEach((a) => {
            const href =
                (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
            const section = a.getAttribute("data-section");
            // Mark active when exact or prefix matches, or when data-section is found in path
            if (
                href === path ||
                (href !== "/" && path.startsWith(href)) ||
                (section && path.indexOf("/" + section) === 0)
            ) {
                a.classList.add("active");
                a.setAttribute("aria-current", "page");
            }
            // add click feedback
            a.addEventListener("click", () => {
                links.forEach((l) => l.classList.remove("active"));
                a.classList.add("active");
            });
        });
    } catch (err) {
        console.error("Error marking sidebar active:", err);
    }
})();

// Mark filter buttons as selected based on URL parameters (status / type)
(function markSelectedFilterButtons() {
    try {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");
        const type = params.get("type");
        const btnStatus = document.querySelectorAll("[btn-status]");
        const btnType = document.querySelectorAll("[btn-type]");
        if (btnStatus.length > 0) {
            btnStatus.forEach((b) => {
                if (status && b.getAttribute("btn-status") === status)
                    b.classList.add("selected");
                else b.classList.remove("selected");
            });
        }
        if (btnType.length > 0) {
            btnType.forEach((b) => {
                if (type && b.getAttribute("btn-type") === type)
                    b.classList.add("selected");
                else b.classList.remove("selected");
            });
        }
    } catch (err) {
        console.error("Error marking selected buttons:", err);
    }
})();
