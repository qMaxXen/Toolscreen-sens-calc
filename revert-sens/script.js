document.addEventListener('DOMContentLoaded', function() {
    const toolscreenSensInput = document.getElementById('toolscreenSens');
    const originalMcSensDiv = document.getElementById('originalMcSens');
    const originalMinecraftSensText = originalMcSensDiv.querySelector('.result-text');
    const helpBtn = document.getElementById('help-btn');
    const helpPopupOverlay = document.getElementById('help-popup-overlay');
    const helpPopupClose = document.getElementById('help-popup-close');
    const helpPopup = document.getElementById('help-popup');

    toolscreenSensInput.addEventListener('input', calculateSensitivity);
    copyButtons();
    helpButton();
    restoreSavedSensitivity();

    function restoreSavedSensitivity() {
        const savedToolscreenSsens = localStorage.getItem('toolscreen-sens');
        if (savedToolscreenSsens !== null) {
            toolscreenSensInput.value = savedToolscreenSsens;
            calculateSensitivity();
        }
    }

    function copyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            let resetTimeout = null;
            let isCurrentlyHovering = false;

            button.addEventListener('mouseenter', function() {
                isCurrentlyHovering = true;
                if (resetTimeout) {
                    clearTimeout(resetTimeout);
                    resetTimeout = null;
                }
            });

            button.addEventListener('mouseleave', function() {
                isCurrentlyHovering = false;
                if (this.classList.contains('copied')) {
                    resetTimeout = setTimeout(() => {
                        this.classList.remove('copied');
                        resetTimeout = null;
                    }, 1000);
                }
            });

            button.addEventListener('click', function(e) {
                const targetId = this.getAttribute('data-copy');
                const targetElement = document.getElementById(targetId);
                const textToCopy = targetElement.querySelector('.result-text').textContent;

                if (textToCopy === '-' || this.disabled) {
                    return;
                }

                if (resetTimeout) {
                    clearTimeout(resetTimeout);
                    resetTimeout = null;
                }

                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.classList.add('copied');

                    if (!isCurrentlyHovering) {
                        resetTimeout = setTimeout(() => {
                            this.classList.remove('copied');
                            resetTimeout = null;
                        }, 1000);
                    }
                });
            });
        });
    }

    function helpButton() {
        helpBtn.addEventListener('click', function() {
            helpPopupOverlay.classList.add('open');
        });

        helpPopupClose.addEventListener('click', function() {
            helpPopupOverlay.classList.remove('open');
        });

        helpPopupOverlay.addEventListener('click', function(e) {
            if (!helpPopup.contains(e.target)) {
                helpPopupOverlay.classList.remove('open');
            }
        });
    }

    function calculateSensitivity() {
        const toolscreenSens = parseFloat(toolscreenSensInput.value);
        const minecraftCopyBtn = originalMcSensDiv.querySelector('.copy-btn');

        if (toolscreenSensInput.value === '') {
            localStorage.removeItem('toolscreen-sens');
        } else {
            localStorage.setItem('toolscreen-sens', toolscreenSensInput.value);
        }

        if (isNaN(toolscreenSens) || toolscreenSensInput.value === '') {
            originalMinecraftSensText.textContent = '-';
            originalMcSensDiv.classList.remove('show');
            minecraftCopyBtn.disabled = true;
            return;
        }

        const denominator = Math.pow((0.6 * 0.02291165 + 0.2), 3) * 1.2;
        const numerator = toolscreenSens * denominator;
        const result = (Math.cbrt(numerator / 1.2) - 0.2) / 0.6;

        originalMinecraftSensText.textContent = result.toFixed(10);
        originalMcSensDiv.classList.add('show');
        minecraftCopyBtn.disabled = false;
    }
});
