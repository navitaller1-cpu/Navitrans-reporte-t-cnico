// Global state
let conditionCount = 0;
let correctionCount = 0;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form initialized');
    
    // Add initial condition and correction for better UX
    addCondition();
    addCorrection();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup responsive behaviors
    setupResponsiveBehaviors();
});

// Add new condition
function addCondition() {
    conditionCount++;
    const template = document.getElementById('condition-template');
    const clone = document.importNode(template.content, true);
    
    // Update IDs for accessibility
    const textInput = clone.querySelector('.cond-text');
    const checkbox = clone.querySelector('.cond-checked');
    
    textInput.id = `condition-text-${conditionCount}`;
    checkbox.id = `condition-check-${conditionCount}`;
    
    const label = clone.querySelector('.checkbox');
    label.setAttribute('for', checkbox.id);
    
    // Add to container
    document.getElementById('conditions-list').appendChild(clone);
    
    // Focus on new input for better UX
    setTimeout(() => {
        textInput.focus();
    }, 100);
    
    updateConditionsJSON();
}

// Add new correction
function addCorrection() {
    correctionCount++;
    const template = document.getElementById('correction-template');
    const clone = document.importNode(template.content, true);
    
    // Update IDs for accessibility
    const titleInput = clone.querySelector('input[name="corrections_title[]"]');
    const fileInput = clone.querySelector('input[type="file"]');
    const textarea = clone.querySelector('textarea');
    
    titleInput.id = `correction-title-${correctionCount}`;
    fileInput.id = `correction-file-${correctionCount}`;
    textarea.id = `correction-desc-${correctionCount}`;
    
    // Set default title with correction number
    titleInput.placeholder = `Corrección ${correctionCount}`;
    
    // Add file validation
    fileInput.addEventListener('change', validateFile);
    
    // Add to container
    document.getElementById('corrections-list').appendChild(clone);
    
    updateUI();
}

// Remove row (works for both conditions and corrections)
function removeRow(button) {
    const row = button.closest('.item-row');
    if (row) {
        // If it's a correction, update correction count
        if (row.classList.contains('correction-row')) {
            correctionCount = Math.max(0, correctionCount - 1);
            updateCorrectionNumbers();
        }
        
        row.remove();
        updateConditionsJSON();
        updateUI();
    }
}

// Update correction numbers after deletion
function updateCorrectionNumbers() {
    const correctionRows = document.querySelectorAll('#corrections-list .correction-row');
    correctionRows.forEach((row, index) => {
        const titleInput = row.querySelector('input[name="corrections_title[]"]');
        if (titleInput && !titleInput.value.trim()) {
            titleInput.placeholder = `Corrección ${index + 1}`;
        }
    });
}

// File validation
function validateFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = 32 * 1024 * 1024; // 32MB
    
    if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, JPEG, GIF, WEBP)');
        event.target.value = '';
        return;
    }
    
    if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Tamaño máximo: 32MB');
        event.target.value = '';
        return;
    }
    
    // Show preview on mobile
    if (window.innerWidth <= 768) {
        showImagePreview(file, event.target);
    }
}

// Show image preview (especially useful on mobile)
function showImagePreview(file, input) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Remove existing preview
        const existingPreview = input.parentNode.querySelector('.image-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Create new preview
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 4px; margin-top: 10px;">
            <button type="button" class="link" onclick="removePreview(this)" style="display: block; margin-top: 5px;">Quitar imagen</button>
        `;
        
        input.parentNode.appendChild(preview);
    };
    reader.readAsDataURL(file);
}

// Remove image preview
function removePreview(button) {
    const preview = button.closest('.image-preview');
    const row = button.closest('.item-row');
    const fileInput = row.querySelector('input[type="file"]');
    
    if (preview) preview.remove();
    if (fileInput) fileInput.value = '';
}

// Update conditions JSON for form submission
function updateConditionsJSON() {
    const conditions = [];
    const conditionRows = document.querySelectorAll('#conditions-list .item-row');
    
    conditionRows.forEach(row => {
        const text = row.querySelector('.cond-text').value.trim();
        const checked = row.querySelector('.cond-checked').checked;
        
        if (text) {
            conditions.push({ text, checked });
        }
    });
    
    document.getElementById('conditions_json').value = JSON.stringify(conditions);
}

// Setup form submission with loading state
function setupFormSubmission() {
    const form = document.getElementById('mantenimiento-form');
    
    form.addEventListener('submit', function(e) {
        // Update conditions JSON before submit
        updateConditionsJSON();
        
        // Validate form
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        // **CRÍTICO**: Remover el overlay de loading después de enviar el form
        // para evitar que se quede pegado si hay errores o redirecciones
        setTimeout(() => {
            hideLoadingState();
        }, 30000); // 30 segundos máximo
    });
    
    // Update conditions JSON when inputs change
    document.addEventListener('input', function(e) {
        if (e.target.matches('.cond-text')) {
            updateConditionsJSON();
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.matches('.cond-checked')) {
            updateConditionsJSON();
        }
    });
}

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let valid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!valid) {
        alert('Por favor completa todos los campos obligatorios (marcados con *)');
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
    
    return valid;
}

// Show loading state
function showLoadingState() {
    // Mostrar overlay si existe
    const existingOverlay = document.getElementById('loading-overlay');
    if (existingOverlay) {
        existingOverlay.style.display = 'flex';
    }
    
    const form = document.getElementById('mantenimiento-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    form.classList.add('loading');
    submitButton.disabled = true;
    submitButton.textContent = 'Generando reporte...';
}

// Hide loading state
function hideLoadingState() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    const form = document.getElementById('mantenimiento-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (form) {
        form.classList.remove('loading');
    }
    
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Generar Reporte DOCX';
    }
    
    // Remover listener de beforeunload
    window.removeEventListener('beforeunload', preventUnload);
}

// Prevent accidental navigation during form submission
function preventUnload(e) {
    e.preventDefault();
    e.returnValue = '';
}

// Setup responsive behaviors
function setupResponsiveBehaviors() {
    // Auto-resize textareas
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'TEXTAREA') {
            autoResize(e.target);
        }
    });
    
    // Handle viewport changes (orientation change, etc.)
    window.addEventListener('resize', debounce(handleViewportChange, 250));
    
    // Handle mobile keyboard
    if (isMobile()) {
        setupMobileKeyboard();
    }
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Handle viewport changes
function handleViewportChange() {
    updateUI();
    
    // Adjust for mobile keyboard
    if (isMobile()) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            setTimeout(() => {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
}

// Setup mobile keyboard handling
function setupMobileKeyboard() {
    let initialViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        const currentHeight = window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        
        // If keyboard is likely open (height reduced significantly)
        if (heightDiff > 150) {
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
    });
}

// Update UI elements
function updateUI() {
    // Update button states
    const conditionsCount = document.querySelectorAll('#conditions-list .item-row').length;
    const correctionsCount = document.querySelectorAll('#corrections-list .item-row').length;
    
    // Auto-resize all textareas
    document.querySelectorAll('textarea').forEach(autoResize);
    
    // Update correction numbers
    updateCorrectionNumbers();
}

// Utility functions
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Detectar cuando la página se carga (después de form submission)
window.addEventListener('load', function() {
    // Si estamos en la página de resultado, asegurarse de que no hay loading state
    if (window.location.pathname.includes('result') || 
        document.querySelector('.card-header.bg-success')) {
        hideLoadingState();
    }
});

// Detectar errores de página y ocultar loading
window.addEventListener('error', function(e) {
    console.error('Page error detected:', e);
    hideLoadingState();
});

// Add error styling to CSS if not present
if (!document.querySelector('style[data-error-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-error-styles', 'true');
    style.textContent = `
        .error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
        
        .keyboard-open {
            padding-bottom: 0;
        }
        
        .image-preview {
            text-align: center;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            margin-top: 10px;
        }
        
        @media (max-width: 768px) {
            .keyboard-open .footer {
                display: none;
            }
        }
        
        /* Mejoras para el loading overlay */
        #loading-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.7) !important;
            z-index: 9999 !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
        }
    `;
    document.head.appendChild(style);
}