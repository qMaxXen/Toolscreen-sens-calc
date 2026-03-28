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

    const WIN_SPEED = [
        0.03125,    
        0.0625,  
        0.125,   
        0.25,    
        0.375,   
        0.5,     
        0.625,   
        0.75,   
        0.875,   
        1.0,    
        1.125,   
        1.5,   
        1.75, 
        2.0,     
        2.25,  
        2.5,  
        2.75,    
        3.0,     
        3.25,    
        3.5,     
    ];

    const CS_IDX = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 19];

    function csToIdx(cs)      { return CS_IDX[cs - 1]; }
    function settingsToIdx(s) { return s - 1; }

    function csToSettings(cs) {
        const idx = csToIdx(cs);
        return idx + 1; 
    }

    function settingsToCs(s) {
        const idx = settingsToIdx(s);
        const csIdx = CS_IDX.indexOf(idx);
        return csIdx === -1 ? null : csIdx + 1;
    }

    function cursorRatioFromIdx(idx) {
        return WIN_SPEED[idx] / WIN_SPEED[9];
    }

    let source        = null;
    let csValue       = null;
    let settingsValue = null;

    const csDisplay       = document.getElementById('win-display');
    const settingsDisplay = document.getElementById('cs-display');
    const csSpin          = document.getElementById('win-spin');
    const settingsSpin    = document.getElementById('cs-spin');
    const csUp            = document.getElementById('win-up');
    const csDown          = document.getElementById('win-down');
    const settingsUp      = document.getElementById('cs-up');
    const settingsDown    = document.getElementById('cs-down');

    function renderSteppers() {
        if (source === 'cs' && csValue !== null) {
            csDisplay.textContent = csValue;
            csSpin.classList.add('active');
            csSpin.classList.remove('passive');

            const equiv = csToSettings(csValue);
            settingsDisplay.textContent = (equiv >= 1 && equiv <= 20) ? equiv : '—';
            settingsSpin.classList.remove('active');
            settingsSpin.classList.add('passive');

        } else if (source === 'settings' && settingsValue !== null) {
            settingsDisplay.textContent = settingsValue;
            settingsSpin.classList.add('active');
            settingsSpin.classList.remove('passive');

            const equiv = settingsToCs(settingsValue);
            csDisplay.textContent = equiv !== null ? equiv : '—';
            csSpin.classList.remove('active');
            csSpin.classList.add('passive');

        } else {
            csDisplay.textContent       = '—';
            settingsDisplay.textContent = '—';
            csSpin.classList.remove('active', 'passive');
            settingsSpin.classList.remove('active', 'passive');
        }

        csUp.disabled         = source === 'cs'       && csValue       >= 11;
        csDown.disabled       = source === 'cs'       && csValue       <= 1;
        settingsUp.disabled   = source === 'settings' && settingsValue >= 20;
        settingsDown.disabled = source === 'settings' && settingsValue <= 1;
    }

    function stepCs(delta) {
        if (source !== 'cs') {
            if (source === 'settings' && settingsValue !== null) {
                const equiv = settingsToCs(settingsValue);
                csValue = equiv !== null ? equiv : Math.min(11, Math.max(1, Math.round(settingsToIdx(settingsValue) / 2 + 1)));
            } else {
                csValue = 6;
            }
            source        = 'cs';
            settingsValue = null;
        }
        csValue = Math.min(11, Math.max(1, csValue + delta));
        renderSteppers();
        calculateSensitivity();
    }

    function stepSettings(delta) {
        if (source !== 'settings') {
            if (source === 'cs' && csValue !== null) {
                settingsValue = csToSettings(csValue);
            } else {
                settingsValue = 10;
            }
            source   = 'settings';
            csValue  = null;
        }
        settingsValue = Math.min(20, Math.max(1, settingsValue + delta));
        renderSteppers();
        calculateSensitivity();
    }

    csUp.addEventListener('click',         () => stepCs(+1));
    csDown.addEventListener('click',       () => stepCs(-1));
    settingsUp.addEventListener('click',   () => stepSettings(+1));
    settingsDown.addEventListener('click', () => stepSettings(-1));

    const cursorToggle = document.getElementById('cursor-toggle');
    const cursorFields = document.getElementById('cursor-fields');

    cursorToggle.addEventListener('click', function () {
        const next = this.getAttribute('aria-checked') !== 'true';
        this.setAttribute('aria-checked', String(next));
        if (next) {
            cursorFields.classList.remove('hidden');
        } else {
            cursorFields.classList.add('hidden');
            source = null; csValue = null; settingsValue = null;
            renderSteppers();
        }
        calculateSensitivity();
    });

    const infoIconBtn      = document.getElementById('info-icon-btn');
    const dpiPanel         = document.getElementById('dpi-panel');
    const dpiBackdrop      = document.getElementById('dpi-panel-backdrop');
    const dpiPanelClose    = document.getElementById('dpi-panel-close');
    const cursorInfoBtn    = document.getElementById('cursor-info-icon-btn');
    const cursorPanel      = document.getElementById('cursor-panel');
    const cursorPanelClose = document.getElementById('cursor-panel-close');

    function openPanel(p) {
        [dpiPanel, cursorPanel].forEach(x => x.classList.remove('open'));
        p.classList.add('open');
        dpiBackdrop.classList.add('open');
    }

    function closePanel() {
        [dpiPanel, cursorPanel].forEach(x => x.classList.remove('open'));
        dpiBackdrop.classList.remove('open');
    }

    infoIconBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openPanel(dpiPanel);
    });

    infoIconBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(dpiPanel); }
    });

    cursorInfoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openPanel(cursorPanel);
    });

    cursorInfoBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(cursorPanel); }
    });

    dpiPanelClose.addEventListener('click', closePanel);
    cursorPanelClose.addEventListener('click', closePanel);
    dpiBackdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', function(e) {
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

        const cursorOn = cursorToggle.getAttribute('aria-checked') === 'true';
        let cursorRatio = 1;
        if (cursorOn) {
            if (source === 'cs' && csValue !== null) {
                cursorRatio = cursorRatioFromIdx(csToIdx(csValue));
            } else if (source === 'settings' && settingsValue !== null) {
                cursorRatio = cursorRatioFromIdx(settingsToIdx(settingsValue));
            }
        }

        const numerator = Math.pow((0.6 * mouseSensitivity + 0.2), 3) * 1.2;
        const denominator = Math.pow((0.6 * 0.02291165 + 0.2), 3) * 1.2;
        const result = (numerator / denominator) * dpiRatio * cursorRatio;

        resultText.textContent = result.toFixed(2);
        resultDiv.classList.add('show');
        resultCopyBtn.disabled = false;

        minecraftSensText.textContent = '0.02291165';
        minecraftSensDiv.classList.add('show');
        minecraftCopyBtn.disabled = false;
    }

    renderSteppers();
});
