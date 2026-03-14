/* CPTec Academy - Certification Link Admin JS */

(function() {
    'use strict';

    // Helpers para o card de link único (complemento ao inline do admin)
    window.editLink = window.editLink || function() {
        var linkDisplay = document.getElementById('linkDisplay');
        var editControls = document.getElementById('editControls');
        var editBtn = document.getElementById('editLinkBtn');
        if (linkDisplay) linkDisplay.style.display = 'none';
        if (editControls) editControls.style.display = 'block';
        if (editBtn) editBtn.style.display = 'none';
        var newInput = document.getElementById('newLinkInput');
        if (newInput) newInput.focus();
    };

    window.cancelEdit = window.cancelEdit || function() {
        var linkDisplay = document.getElementById('linkDisplay');
        var editControls = document.getElementById('editControls');
        var editBtn = document.getElementById('editLinkBtn');
        if (linkDisplay) linkDisplay.style.display = 'block';
        if (editControls) editControls.style.display = 'none';
        if (editBtn) editBtn.style.display = 'block';
    };

    window.saveLink = window.saveLink || function() {
        var newInput = document.getElementById('newLinkInput');
        if (!newInput) return;
        var newLink = newInput.value.trim();
        if (!newLink) {
            alert('O link não pode estar vazio!');
            return;
        }
        var linkField = document.getElementById('id_unique_link');
        if (linkField) linkField.value = newLink;
        var linkInput = document.getElementById('linkInput');
        if (linkInput) linkInput.value = newLink;
        alert('Link atualizado! Clique em SALVAR no final da página para confirmar.');
        window.cancelEdit();
    };

})();
