const categoryCards = Array.from(document.querySelectorAll(".category-card"));
const touchOnly = window.matchMedia("(hover: none)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

categoryCards.forEach((card) => {
    let lastPointerType = "";

    card.addEventListener("pointerdown", (event) => {
        lastPointerType = event.pointerType;
    });

    card.addEventListener("click", (event) => {
        const isTouch = lastPointerType === "touch" || touchOnly.matches;
        lastPointerType = "";

        if (!isTouch || event.detail === 0 || prefersReducedMotion.matches) {
            return;
        }

        categoryCards.forEach((otherCard) => {
            if (otherCard !== card) {
                otherCard.classList.remove("is-flipped");
            }
        });

        if (!card.classList.contains("is-flipped")) {
            event.preventDefault();
            card.classList.add("is-flipped");
        } else {
            card.classList.remove("is-flipped");
        }
    });
});

document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".category-card")) {
        categoryCards.forEach((card) => card.classList.remove("is-flipped"));
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        categoryCards.forEach((card) => card.classList.remove("is-flipped"));
    }
});
