// Auto Questionnaire Filler Script - Modal/AJAX Version
// This script automatically fills out all questionnaires using modals/fetch

(function() {
    'use strict';
    
    // Configuration
    const DELAY_BETWEEN_ACTIONS = 800; // Shorter delay for AJAX
    const DELAY_BETWEEN_QUESTIONNAIRES = 1200;
    
    // Get all questionnaire buttons
    function getAllQuestionnaireButtons() {
        return document.querySelectorAll("[data-type='cedit']");
    }
    
    // Fetch questionnaire content via AJAX
    async function fetchQuestionnaireContent(nip, kelas) {
        try {
            const url = `/siakad/data_angket/add/2217051133/${nip}/${kelas}`;
            console.log(`Fetching questionnaire: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            return html;
            
        } catch (error) {
            console.error('Error fetching questionnaire:', error);
            throw error;
        }
    }
    
    // Submit questionnaire data via AJAX
    async function submitQuestionnaireData(formData, nip, kelas) {
        try {
            const url = `/siakad/data_angket/add/2217051133/${nip}/${kelas}`;
            console.log('Submitting questionnaire data...');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json, text/javascript, */*; q=0.01'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.text();
            console.log('Questionnaire submitted successfully');
            return result;
            
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
            throw error;
        }
    }
    
    // Create form data for submission
    function createFormData() {
        const formData = new FormData();
        
        // Add answers (all set to option 4)
        for (let i = 1; i <= 16; i++) {
            formData.append(`jawaban_${i}`, '4');
        }
        
        // Add validation
        formData.append('isvalid', '1');
        
        // Add any other required fields that might be needed
        formData.append('submit', 'save');
        
        return formData;
    }
    
    // Process single questionnaire via AJAX
    async function processSingleQuestionnaireAjax(button, index, total) {
        try {
            const nip = button.getAttribute('data-nip');
            const kelas = button.getAttribute('data-kelas');
            const courseName = button.closest('tr').querySelector('td:nth-child(3)').textContent.trim();
            const teacherName = button.closest('tr').querySelector('td:nth-child(4)').textContent.trim();
            
            console.log(`\n=== Processing questionnaire ${index + 1} of ${total} ===`);
            console.log(`Course: ${courseName}`);
            console.log(`Teacher: ${teacherName}`);
            console.log(`NIP: ${nip}, Kelas: ${kelas}`);
            
            // Update progress indicator
            updateProgressIndicator(index + 1, total, courseName);
            
            // Fetch questionnaire (to ensure it exists and get any required tokens)
            await fetchQuestionnaireContent(nip, kelas);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ACTIONS));
            
            // Create and submit form data
            const formData = createFormData();
            await submitQuestionnaireData(formData, nip, kelas);
            
            console.log(`✓ Questionnaire ${index + 1} completed successfully`);
            
            // Mark as completed in the UI
            markQuestionnaireAsCompleted(button);
            
            // Wait before next questionnaire
            if (index < total - 1) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_QUESTIONNAIRES));
            }
            
        } catch (error) {
            console.error(`✗ Error processing questionnaire ${index + 1}:`, error);
            markQuestionnaireAsError(button);
            throw error;
        }
    }
    
    // Create progress indicator
    function createProgressIndicator() {
        const existing = document.getElementById('questionnaire-progress');
        if (existing) existing.remove();
        
        const progressDiv = document.createElement('div');
        progressDiv.id = 'questionnaire-progress';
        progressDiv.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            z-index: 10000;
            background: white;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            min-width: 300px;
            font-family: Arial, sans-serif;
        `;
        
        progressDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">Auto-filling Questionnaires</div>
            <div id="progress-bar" style="background: #f0f0f0; height: 20px; border-radius: 10px; margin-bottom: 10px;">
                <div id="progress-fill" style="background: #28a745; height: 100%; border-radius: 10px; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="progress-text">Initializing...</div>
            <div id="current-course" style="font-size: 12px; color: #666; margin-top: 5px;"></div>
        `;
        
        document.body.appendChild(progressDiv);
        return progressDiv;
    }
    
    // Update progress indicator
    function updateProgressIndicator(current, total, courseName) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const currentCourse = document.getElementById('current-course');
        
        if (progressFill) {
            const percentage = (current / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Processing ${current} of ${total}`;
        }
        
        if (currentCourse) {
            currentCourse.textContent = courseName;
        }
    }
    
    // Mark questionnaire as completed in UI
    function markQuestionnaireAsCompleted(button) {
        const row = button.closest('tr');
        row.style.backgroundColor = '#d4edda';
        
        // Update status columns
        const diisiCell = row.querySelector('td:nth-child(5)');
        const validCell = row.querySelector('td:nth-child(6)');
        
        if (diisiCell) diisiCell.innerHTML = '<i class="fa fa-check text-success"></i>';
        if (validCell) validCell.innerHTML = '<i class="fa fa-check text-success"></i>';
        
        // Disable button
        button.disabled = true;
        button.innerHTML = '<i class="fa fa-check"></i>';
        button.classList.remove('btn-info');
        button.classList.add('btn-success');
    }
    
    // Mark questionnaire as error in UI
    function markQuestionnaireAsError(button) {
        const row = button.closest('tr');
        row.style.backgroundColor = '#f8d7da';
        
        button.classList.remove('btn-info');
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="fa fa-times"></i>';
    }
    
    // Main function to process all questionnaires via AJAX
    async function processAllQuestionnaires() {
        try {
            const buttons = Array.from(getAllQuestionnaireButtons());
            
            if (buttons.length === 0) {
                alert('No questionnaire buttons found');
                return;
            }
            
            console.log(`Found ${buttons.length} questionnaires to process`);
            
            // Create progress indicator
            const progressDiv = createProgressIndicator();
            
            let successCount = 0;
            let errorCount = 0;
            
            // Process each questionnaire
            for (let i = 0; i < buttons.length; i++) {
                try {
                    await processSingleQuestionnaireAjax(buttons[i], i, buttons.length);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    console.error(`Failed to process questionnaire ${i + 1}:`, error);
                    
                    // Ask user if they want to continue
                    const continueProcessing = confirm(`Error processing questionnaire ${i + 1}. Continue with remaining questionnaires?`);
                    if (!continueProcessing) {
                        break;
                    }
                }
            }
            
            // Update final progress
            const progressText = document.getElementById('progress-text');
            const currentCourse = document.getElementById('current-course');
            
            if (progressText) {
                progressText.textContent = `Completed! Success: ${successCount}, Errors: ${errorCount}`;
            }
            if (currentCourse) {
                currentCourse.textContent = 'All questionnaires processed';
            }
            
            // Show final result
            const message = `Process completed!\n\nSuccessful: ${successCount}\nErrors: ${errorCount}\nTotal: ${buttons.length}`;
            alert(message);
            
            console.log('=== Final Results ===');
            console.log(`Successful: ${successCount}`);
            console.log(`Errors: ${errorCount}`);
            console.log(`Total: ${buttons.length}`);
            
        } catch (error) {
            console.error('Error in processAllQuestionnaires:', error);
            alert('An error occurred while processing questionnaires. Check console for details.');
        }
    }
    
    // Detect current page and add UI
    function detectPageAndAddUI() {
        const buttons = getAllQuestionnaireButtons();
        
        if (buttons.length > 0) {
            console.log(`Detected questionnaire list page with ${buttons.length} questionnaires`);
            
            // Add start button
            const startButton = document.createElement('button');
            startButton.textContent = `Auto Fill All Questionnaires (${buttons.length})`;
            startButton.className = 'btn btn-primary btn-lg';
            startButton.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                background-color: #007bff;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            
            startButton.onmouseover = function() {
                this.style.backgroundColor = '#0056b3';
            };
            
            startButton.onmouseout = function() {
                this.style.backgroundColor = '#007bff';
            };
            
            startButton.onclick = function() {
                const message = `This will automatically fill all ${buttons.length} questionnaires using AJAX requests.\n\nEach questionnaire will be:\n- Filled with highest ratings (option 4)\n- Validated\n- Saved\n\nContinue?`;
                
                if (confirm(message)) {
                    startButton.style.display = 'none';
                    processAllQuestionnaires();
                }
            };
            
            document.body.appendChild(startButton);
            
            // Add individual test button for first questionnaire
            const testButton = document.createElement('button');
            testButton.textContent = 'Test Single';
            testButton.className = 'btn btn-warning btn-sm';
            testButton.style.cssText = `
                position: fixed;
                top: 60px;
                right: 10px;
                z-index: 9999;
                background-color: #ffc107;
                color: black;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            `;
            
            testButton.onclick = function() {
                if (confirm('Test with first questionnaire only?')) {
                    testButton.style.display = 'none';
                    processSingleQuestionnaireAjax(buttons[0], 0, 1).catch(console.error);
                }
            };
            
            document.body.appendChild(testButton);
        }
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectPageAndAddUI);
    } else {
        detectPageAndAddUI();
    }
    
    // Export functions for manual use
    window.autoQuestionnaire = {
        processAll: processAllQuestionnaires,
        processSingle: (index) => {
            const buttons = getAllQuestionnaireButtons();
            if (buttons[index]) {
                return processSingleQuestionnaireAjax(buttons[index], index, buttons.length);
            }
        },
        testFirst: () => {
            const buttons = getAllQuestionnaireButtons();
            if (buttons[0]) {
                return processSingleQuestionnaireAjax(buttons[0], 0, 1);
            }
        }
    };
    
    console.log('Auto Questionnaire Filler (AJAX Version) loaded successfully!');
    console.log('Available functions:');
    console.log('- autoQuestionnaire.processAll() - Process all questionnaires');
    console.log('- autoQuestionnaire.processSingle(index) - Process specific questionnaire');
    console.log('- autoQuestionnaire.testFirst() - Test with first questionnaire');
    
})();
