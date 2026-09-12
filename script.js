document.addEventListener('DOMContentLoaded', function() {
    const sensitivityInput = document.getElementById('mcSens');
    const resultDiv = document.getElementById('toolscreenSens');
    const resultText = resultDiv.querySelector('.result-text');
    const minecraftSensDiv = document.getElementById('newMcSens');
    const minecraftSensText = minecraftSensDiv.querySelector('.result-text');
    const helpBtn = document.getElementById('help-btn');
    const helpPopupOverlay = document.getElementById('help-popup-overlay');
    const helpPopupClose = document.getElementById('help-popup-close');
    const helpPopup = document.getElementById('help-popup');

    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-msg';
    errorMsg.textContent = 'Must be between 0 and 1';
    sensitivityInput.insertAdjacentElement('afterend', errorMsg);

    sensitivityInput.addEventListener('input', calculateSensitivity);
    helpButton();
    copyButtons();
    restoreSavedSensitivity();

    function restoreSavedSensitivity() {
        const savedMcSensitivity = localStorage.getItem('minecraft-sensitivity');
        if (savedMcSensitivity !== null) {
            sensitivityInput.value = savedMcSensitivity;
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
        const mouseSensitivity = parseFloat(sensitivityInput.value);
        const resultCopyBtn = resultDiv.querySelector('.copy-btn');
        const minecraftCopyBtn = minecraftSensDiv.querySelector('.copy-btn');

        if (sensitivityInput.value === '') {
            localStorage.removeItem('minecraft-sensitivity');
        } else {
            localStorage.setItem('minecraft-sensitivity', sensitivityInput.value);
        }

        if (isNaN(mouseSensitivity) || sensitivityInput.value === '') {
            sensitivityInput.classList.remove('input-error');
            errorMsg.style.display = 'none';
            resultText.textContent = '-';
            resultDiv.classList.remove('show');
            resultDiv.classList.remove('error');
            resultCopyBtn.disabled = true;
            minecraftSensText.textContent = '-';
            minecraftSensDiv.classList.remove('show');
            minecraftCopyBtn.disabled = true;
            return;
        }

        if (mouseSensitivity < 0 || mouseSensitivity > 1) {
            sensitivityInput.classList.add('input-error');
            errorMsg.style.display = 'block';
            resultText.textContent = '-';
            resultDiv.classList.remove('show');
            resultDiv.classList.add('error');
            resultCopyBtn.disabled = true;
            minecraftSensText.textContent = '-';
            minecraftSensDiv.classList.remove('show');
            minecraftCopyBtn.disabled = true;
            return;
        }

        sensitivityInput.classList.remove('input-error');
        errorMsg.style.display = 'none';

        const numerator = Math.pow((0.6 * mouseSensitivity + 0.2), 3) * 1.2;
        const denominator = Math.pow((0.6 * 0.02291165 + 0.2), 3) * 1.2;
        const result = numerator / denominator;

        resultText.textContent = result.toFixed(2);
        resultDiv.classList.add('show');
        resultCopyBtn.disabled = false;

        minecraftSensText.textContent = '0.02291165';
        minecraftSensDiv.classList.add('show');
        minecraftCopyBtn.disabled = false;
    }
});
