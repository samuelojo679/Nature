const heroHeader = document.querySelector("[data-scroll-nav]");
const floatingHeader = document.querySelector("[data-floating-nav]");
const heroSection = document.querySelector("[data-nav-hero]");

if (heroHeader && floatingHeader && heroSection) {
    const headers = [heroHeader, floatingHeader];
    const menuQuery = window.matchMedia("(max-width: 700px)");
    const sectionIds = ["discover", "stories", "about"];
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section) => section);
    const progressValue = floatingHeader.querySelector(".nav-progress-value");
    let progressFrame = 0;
    let floatingVisible = false;

    const updateMenuContent = (header, open) => {
        const nav = header.querySelector(".main-nav");
        const journalLink = header.querySelector(".header-link");
        const contentEnabled = !menuQuery.matches || open;

        header.classList.toggle("nav-open", open);
        nav.inert = !contentEnabled;
        journalLink.inert = !contentEnabled;
    };

    const closeMenus = (exceptHeader = null) => {
        headers.forEach((header) => {
            if (header !== exceptHeader) {
                const toggle = header.querySelector(".nav-menu-toggle");
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-label", "Open navigation menu");
                updateMenuContent(header, false);
            }
        });
    };

    const setHeaderAvailability = (header, available) => {
        header.inert = !available;
        header.setAttribute("aria-hidden", String(!available));
        header.querySelectorAll("a, button").forEach((element) => {
            if (available) {
                element.removeAttribute("tabindex");
            } else {
                element.setAttribute("tabindex", "-1");
            }
        });
    };

    const setFloatingVisibility = (visible) => {
        if (floatingVisible === visible) {
            return;
        }

        floatingVisible = visible;
        const activeElement = document.activeElement;
        const focusWasInNavigation = headers.some((header) => header.contains(activeElement));
        const focusedLink = activeElement.closest("a")?.getAttribute("href");
        const focusWasMenuToggle = activeElement.matches(".nav-menu-toggle");

        heroHeader.classList.toggle("is-scrolled", visible);
        floatingHeader.classList.toggle("is-visible", visible);
        setHeaderAvailability(heroHeader, !visible);
        setHeaderAvailability(floatingHeader, visible);
        closeMenus();
        updateMenuContent(heroHeader, false);
        updateMenuContent(floatingHeader, false);

        if (focusWasInNavigation) {
            const nextHeader = visible ? floatingHeader : heroHeader;
            const target = focusWasMenuToggle
                ? nextHeader.querySelector(".nav-menu-toggle")
                : Array.from(nextHeader.querySelectorAll("a"))
                    .find((link) => link.getAttribute("href") === focusedLink);
            target?.focus({ preventScroll: true });
        }
    };

    headers.forEach((header) => {
        const toggle = header.querySelector(".nav-menu-toggle");

        toggle.addEventListener("click", () => {
            const open = toggle.getAttribute("aria-expanded") !== "true";
            closeMenus(header);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute(
                "aria-label",
                open ? "Close navigation menu" : "Open navigation menu"
            );
            updateMenuContent(header, open);
        });

        header.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-label", "Open navigation menu");
                updateMenuContent(header, false);
            });
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        const openHeader = headers.find((header) => (
            header.querySelector(".nav-menu-toggle").getAttribute("aria-expanded") === "true"
        ));
        if (openHeader) {
            const toggle = openHeader.querySelector(".nav-menu-toggle");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation menu");
            updateMenuContent(openHeader, false);
            toggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!headers.some((header) => header.contains(event.target))) {
            closeMenus();
        }
    });

    menuQuery.addEventListener("change", () => {
        headers.forEach((header) => {
            const toggle = header.querySelector(".nav-menu-toggle");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation menu");
            updateMenuContent(header, false);
        });
    });

    const heroObserver = new IntersectionObserver(() => {
        if (heroSection.getBoundingClientRect().bottom <= 90) {
            setFloatingVisibility(true);
        }
    }, {
        rootMargin: "-90px 0px 0px 0px"
    });
    heroObserver.observe(heroSection);

    const heroHeaderObserver = new IntersectionObserver(() => {
        const headerBounds = heroHeader.getBoundingClientRect();
        if (headerBounds.bottom > 0 && headerBounds.top < window.innerHeight) {
            setFloatingVisibility(false);
        }
    });
    heroHeaderObserver.observe(heroHeader);

    const updateProgress = () => {
        progressFrame = 0;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0
            ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
            : 0;
        progressValue.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener("scroll", () => {
        if (!progressFrame) {
            progressFrame = window.requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    const setActiveSection = (sectionId) => {
        headers.forEach((header) => {
            header.querySelectorAll(".nav-link").forEach((link) => {
                if (link.getAttribute("href") === `#${sectionId}`) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length > 0) {
            const currentSection = visibleSections.reduce((closest, entry) => (
                entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
            ));
            setActiveSection(currentSection.target.id);
        }
    }, {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));
    setHeaderAvailability(floatingHeader, false);
    updateMenuContent(heroHeader, false);
    updateMenuContent(floatingHeader, false);
}
