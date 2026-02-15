document.addEventListener('DOMContentLoaded', function() {
    const sensitivityInput = document.getElementById('sensitivity');
    const resultDiv = document.getElementById('result');

    sensitivityInput.addEventListener('input', calculateSensitivity);

    resultDiv.textContent = '—';

    function calculateSensitivity() {
        const mouseSensitivity = parseFloat(sensitivityInput.value);

        if (isNaN(mouseSensitivity) || sensitivityInput.value === '') {
            resultDiv.textContent = '—';
            resultDiv.classList.remove('show');
            resultDiv.classList.remove('error');
            return;
        }

        if (mouseSensitivity < 0 || mouseSensitivity > 1) {
            resultDiv.textContent = 'Must be between 0 and 1';
            resultDiv.classList.remove('show');
            resultDiv.classList.add('error');
            return;
        }

        resultDiv.classList.remove('error');

        const numerator = Math.pow((0.6 * mouseSensitivity + 0.2), 3) * 1.2;
        const denominator = Math.pow((0.6 * 0.02291165 + 0.2), 3) * 1.2;
        const result = numerator / denominator;

        resultDiv.textContent = result.toFixed(2);
        resultDiv.classList.add('show');
    }
});