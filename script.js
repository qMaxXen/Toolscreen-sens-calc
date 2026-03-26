document.addEventListener('DOMContentLoaded', function() {
    const sensitivityInput = document.getElementById('sensitivity');
    const resultDiv = document.getElementById('result');
    const resultText = resultDiv.querySelector('.result-text');
    const minecraftSensDiv = document.getElementById('minecraft-sens');
    const minecraftSensText = minecraftSensDiv.querySelector('.result-text');

    sensitivityInput.addEventListener('input', calculateSensitivity);

    sensitivityInput.value = '';
    resultText.textContent = '—';
    minecraftSensText.textContent = '—';

    resultDiv.querySelector('.copy-btn').disabled = true;
    minecraftSensDiv.querySelector('.copy-btn').disabled = true;

    const dpiToggle   = document.getElementById('dpi-toggle');
    const dpiFields   = document.getElementById('dpi-fields');
    const oldDpiInput = document.getElementById('old-dpi');
    const newDpiInput = document.getElementById('new-dpi');

    dpiToggle.addEventListener('click', function () {
        const next = this.getAttribute('aria-checked') !== 'true';
        this.setAttribute('aria-checked', String(next));
        if (next) {
            dpiFields.classList.remove('hidden');
        } else {
            dpiFields.classList.add('hidden');
            oldDpiInput.value = '';
            newDpiInput.value = '';
        }
        calculateSensitivity();
    });

    oldDpiInput.addEventListener('input', calculateSensitivity);
    newDpiInput.addEventListener('input', calculateSensitivity);

    const infoIconBtn   = document.getElementById('info-icon-btn');
    const dpiPanel      = document.getElementById('dpi-panel');
    const dpiBackdrop   = document.getElementById('dpi-panel-backdrop');
    const dpiPanelClose = document.getElementById('dpi-panel-close');

    function openPanel() {
        dpiPanel.classList.add('open');
        dpiBackdrop.classList.add('open');
    }

    function closePanel() {
        dpiPanel.classList.remove('open');
        dpiBackdrop.classList.remove('open');
    }

    infoIconBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openPanel();
    });

    infoIconBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
    });

    dpiPanelClose.addEventListener('click', closePanel);
    dpiBackdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePanel();
    });


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

            if (textToCopy === '—' || this.disabled) {
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
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    });

    function calculateSensitivity() {
        const mouseSensitivity = parseFloat(sensitivityInput.value);
        const resultCopyBtn = resultDiv.querySelector('.copy-btn');
        const minecraftCopyBtn = minecraftSensDiv.querySelector('.copy-btn');

        if (isNaN(mouseSensitivity) || sensitivityInput.value === '') {
            resultText.textContent = '—';
            resultDiv.classList.remove('show');
            resultDiv.classList.remove('error');
            resultCopyBtn.disabled = true;
            minecraftSensText.textContent = '—';
            minecraftSensDiv.classList.remove('show');
            minecraftCopyBtn.disabled = true;
            return;
        }

        if (mouseSensitivity < 0 || mouseSensitivity > 1) {
            resultText.textContent = 'Must be between 0 and 1';
            resultDiv.classList.remove('show');
            resultDiv.classList.add('error');
            resultCopyBtn.disabled = true;
            minecraftSensText.textContent = '—';
            minecraftSensDiv.classList.remove('show');
            minecraftCopyBtn.disabled = true;
            return;
        }

        resultDiv.classList.remove('error');

        const dpiModeOn = dpiToggle.getAttribute('aria-checked') === 'true';
        let dpiRatio = 1;
        if (dpiModeOn) {
            const oldDpi    = parseFloat(oldDpiInput.value);
            const newDpi    = parseFloat(newDpiInput.value);
            const oldFilled = oldDpiInput.value !== '' && !isNaN(oldDpi);
            const newFilled = newDpiInput.value !== '' && !isNaN(newDpi);
            if (!oldFilled && !newFilled) {
            } else if (!oldFilled || !newFilled) {
                resultText.textContent = '—';
                resultDiv.classList.remove('show');
                resultDiv.classList.remove('error');
                resultCopyBtn.disabled = true;
                minecraftSensText.textContent = '—';
                minecraftSensDiv.classList.remove('show');
                minecraftCopyBtn.disabled = true;
                return;
            } else if (oldDpi <= 0 || newDpi <= 0) {
                resultText.textContent = 'DPI must be greater than 0';
                resultDiv.classList.remove('show');
                resultDiv.classList.add('error');
                resultCopyBtn.disabled = true;
                minecraftSensText.textContent = '—';
                minecraftSensDiv.classList.remove('show');
                minecraftCopyBtn.disabled = true;
                return;
            } else {
                dpiRatio = oldDpi / newDpi;
            }
        }

        const numerator = Math.pow((0.6 * mouseSensitivity + 0.2), 3) * 1.2;
        const denominator = Math.pow((0.6 * 0.02291165 + 0.2), 3) * 1.2;
        const result = (numerator / denominator) * dpiRatio;

        resultText.textContent = result.toFixed(2);
        resultDiv.classList.add('show');
        resultCopyBtn.disabled = false;
        
        minecraftSensText.textContent = '0.02291165';
        minecraftSensDiv.classList.add('show');
        minecraftCopyBtn.disabled = false;
    }
});