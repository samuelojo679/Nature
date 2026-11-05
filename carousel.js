document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".gallery-track");
    const viewport = carousel.querySelector(".gallery-viewport");
    const previousButton = carousel.querySelector(".gallery-previous");
    const nextButton = carousel.querySelector(".gallery-next");
    const autoplayButton = carousel.querySelector(".gallery-autoplay");
    const pagination = Array.from(carousel.querySelectorAll(".gallery-dot"));
    const liveRegion = carousel.querySelector(".gallery-live");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let position = 1;
    let pointerStart = null;
    let pointerPause = false;
    let focusPause = false;
    let userPaused = prefersReducedMotion;

    if (!track || !viewport || !previousButton || !nextButton || !autoplayButton || !liveRegion) {
        return;
    }

    const slides = Array.from(track.querySelectorAll(".gallery-slide"));
    const slideCount = slides.length;
    if (slideCount < 2) {
        return;
    }

    const leadingClone = slides[slideCount - 1].cloneNode(true);
    const trailingClone = slides[0].cloneNode(true);
    leadingClone.setAttribute("aria-hidden", "true");
    trailingClone.setAttribute("aria-hidden", "true");
    track.insertBefore(leadingClone, slides[0]);
    track.appendChild(trailingClone);

    const slideOffset = (index) => (
        track.children[index].offsetLeft - track.offsetLeft
    );

    const activeSlideIndex = () => {
        if (position === 0) {
            return slideCount - 1;
        }
        if (position === slideCount + 1) {
            return 0;
        }
        return position - 1;
    };

    const updateControls = () => {
        const activeIndex = activeSlideIndex();
        slides.forEach((slide, index) => {
            slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
        });
        pagination.forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle("is-active", active);
            if (active) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
        liveRegion.textContent = `Slide ${activeIndex + 1} of ${slideCount}`;
        autoplayButton.textContent = userPaused ? "PLAY" : "PAUSE";
        autoplayButton.setAttribute(
            "aria-label",
            userPaused ? "Play slideshow" : "Pause slideshow"
        );
    };

    const moveTo = (nextPosition) => {
        position = Math.max(0, Math.min(slideCount + 1, nextPosition));
        track.style.transform = `translate3d(-${slideOffset(position)}px, 0, 0)`;
        updateControls();
    };

    const goToSlide = (slideIndex) => {
        moveTo(slideIndex + 1);
    };

    const next = () => {
        moveTo(position + 1);
    };

    const previous = () => {
        moveTo(position - 1);
    };

    const isPaused = () => (
        userPaused
        || pointerPause
        || focusPause
        || document.visibilityState !== "visible"
    );

    track.addEventListener("transitionend", (event) => {
        if (event.target !== track || event.propertyName !== "transform") {
            return;
        }
        if (position === 0 || position === slideCount + 1) {
            position = position === 0 ? slideCount : 1;
            track.style.transition = "none";
            track.style.transform = `translate3d(-${slideOffset(position)}px, 0, 0)`;
            track.offsetHeight;
            track.style.transition = "";
            updateControls();
        }
    });

    previousButton.addEventListener("click", previous);
    nextButton.addEventListener("click", next);
    pagination.forEach((dot, index) => {
        dot.addEventListener("click", () => goToSlide(index));
    });

    autoplayButton.addEventListener("click", () => {
        userPaused = !userPaused;
        updateControls();
    });

    carousel.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") {
            pointerPause = true;
        }
    });
    carousel.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
            pointerPause = false;
        }
    });
    carousel.addEventListener("focusin", () => {
        focusPause = true;
    });
    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            focusPause = false;
        }
    });
    carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previous();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
        }
    });

    viewport.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) {
            return;
        }
        pointerStart = event.clientX;
    });
    viewport.addEventListener("pointerup", (event) => {
        if (pointerStart === null) {
            return;
        }
        const distance = event.clientX - pointerStart;
        pointerStart = null;
        if (distance > 45) {
            previous();
        } else if (distance < -45) {
            next();
        }
    });
    viewport.addEventListener("pointercancel", () => {
        pointerStart = null;
    });

    window.addEventListener("resize", () => {
        track.style.transition = "none";
        track.style.transform = `translate3d(-${slideOffset(position)}px, 0, 0)`;
        track.offsetHeight;
        track.style.transition = "";
    });

    updateControls();
    track.style.transform = `translate3d(-${slideOffset(position)}px, 0, 0)`;

    if (prefersReducedMotion) {
        autoplayButton.textContent = "PLAY";
        autoplayButton.setAttribute("aria-label", "Play slideshow");
    }

    window.setInterval(() => {
        if (!isPaused()) {
            next();
        }
    }, 5500);
});
