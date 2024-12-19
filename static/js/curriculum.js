document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("curriculum-sections");
    const sections = document.querySelectorAll(".resource-category");

    dropdown.addEventListener("change", (event) => {
        const selectedSection = event.target.value;

        // Hide all sections
        sections.forEach((section) => section.classList.add("hidden"));

        // Show the selected section
        const activeSection = document.getElementById(selectedSection);
        if (activeSection) {
            activeSection.classList.remove("hidden");
        }
    });
});
