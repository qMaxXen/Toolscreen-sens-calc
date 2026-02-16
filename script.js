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