// Auto Questionnaire Filler Script - Exact cURL Implementation
// This script replicates the exact cURL request for each questionnaire

(function() {
    'use strict';
    
    // Configuration
    const DELAY_BETWEEN_QUESTIONNAIRES = 1500; // 1.5 seconds between requests
    const NPM = 2217051133;
    
    // Get all questionnaire buttons
    function getAllQuestionnaireButtons() {
        return document.querySelectorAll("[data-type='cedit']");
    }
    
    // Get all cookies as a string (like in the cURL)
    function getAllCookies() {
        return document.cookie;
    }
    
    // Submit questionnaire using exact cURL format
    async function submitQuestionnaire(nip, kelas) {
        try {
            const url = `https://siakadu.unila.ac.id/siakad/data_angket/add/${NPM}/${nip}/${kelas}`;
            
            // Exact form data from cURL
            const formData = new URLSearchParams();
            formData.append('jawaban_1', '4');
            formData.append('jawaban_2', '4');
            formData.append('jawaban_3', '4');
            formData.append('jawaban_4', '4');
            formData.append('jawaban_5', '4');
            formData.append('jawaban_6', '4');
            formData.append('jawaban_7', '4');
            formData.append('jawaban_8', '4');
            formData.append('jawaban_9', '4');
            formData.append('jawaban_10', '4');
            formData.append('jawaban_11', '4');
            formData.append('jawaban_12', '4');
            formData.append('jawaban_13', '4');
            formData.append('jawaban_14', '4');
            formData.append('jawaban_15', '4');
            formData.append('jawaban_16', '4');
            formData.append('isvalid', '1');
            formData.append('key', '');
            formData.append('act', 'save');
            
            console.log(`Submitting questionnaire: ${url}`);
            console.log('Form data:', formData.toString());
            
            // Exact headers from cURL
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8,ms;q=0.7,ja;q=0.6',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': getAllCookies(),
                    'Origin': 'https://siakadu.unila.ac.id',
                    'Referer': url,
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Linux"'
                },
                body: formData.toString()
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            console.log('Response received:', responseText.substring(0, 200) + '...');
            
            return {
                success: true,
                status: response.status,
                response: responseText
            };
            
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Process single questionnaire
    async function processSingleQuestionnaire(button, index, total) {
        try {
            const nip = button.getAttribute('data-nip');
            const kelas = button.getAttribute('data-kelas');
            const courseName = button.closest('tr').querySelector('td:nth-child(3)').textContent.trim();
            const teacherName = button.closest('tr').querySelector('td:nth-child(4)').textContent.split(' - ')[1] || 'Unknown';
            
            console.log(`\n=== Processing questionnaire ${index + 1} of ${total} ===`);
            console.log(`Course: ${courseName}`);
            console.log(`Teacher: ${teacherName}`);
            console.log(`NIP: ${nip}, Kelas: ${kelas}`);
            
            // Update progress
            updateProgressIndicator(index + 1, total, courseName);
            
            // Submit questionnaire
            const result = await submitQuestionnaire(nip, kelas);
            
            if (result.success) {
                console.log(`✅ Questionnaire ${index + 1} submitted successfully`);
                markQuestionnaireAsCompleted(button);
                return { success: true };
            } else {
                console.log(`❌ Questionnaire ${index + 1} failed: ${result.error}`);
                markQuestionnaireAsError(button);
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            console.error(`❌ Error processing questionnaire ${index + 1}:`, error);
            markQuestionnaireAsError(button);
            return { success: false, error: error.message };
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
            min-width: 320px;
            font-family: Arial, sans-serif;
        `;
        
        progressDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #007bff;">🚀 Auto-filling Questionnaires</div>
            <div id="progress-bar" style="background: #f0f0f0; height: 20px; border-radius: 10px; margin-bottom: 10px;">
                <div id="progress-fill" style="background: linear-gradient(90deg, #28a745, #20c997); height: 100%; border-radius: 10px; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="progress-text" style="font-weight: bold;">Initializing...</div>
            <div id="current-course" style="font-size: 12px; color: #666; margin-top: 5px; word-wrap: break-word;"></div>
            <div id="progress-stats" style="font-size: 11px; color: #888; margin-top: 8px; display: flex; justify-content: space-between;">
                <span>✅ <span id="success-count">0</span></span>
                <span>❌ <span id="error-count">0</span></span>
                <span>⏱️ <span id="time-elapsed">0s</span></span>
            </div>
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
            progressText.textContent = `Processing ${current} of ${total} (${Math.round((current/total)*100)}%)`;
        }
        
        if (currentCourse) {
            currentCourse.textContent = `📚 ${courseName}`;
        }
    }
    
    // Update statistics
    function updateStats(successCount, errorCount, startTime) {
        const successEl = document.getElementById('success-count');
        const errorEl = document.getElementById('error-count');
        const timeEl = document.getElementById('time-elapsed');
        
        if (successEl) successEl.textContent = successCount;
        if (errorEl) errorEl.textContent = errorCount;
        if (timeEl) {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            timeEl.textContent = `${elapsed}s`;
        }
    }
    
    // Mark questionnaire as completed
    function markQuestionnaireAsCompleted(button) {
        const row = button.closest('tr');
        row.style.backgroundColor = '#d4edda';
        row.style.transition = 'background-color 0.3s';
        
        // Update status columns
        const diisiCell = row.querySelector('td:nth-child(5)');
        const validCell = row.querySelector('td:nth-child(6)');
        
        if (diisiCell) diisiCell.innerHTML = '<i class="fa fa-check text-success" title="Filled"></i>';
        if (validCell) validCell.innerHTML = '<i class="fa fa-check text-success" title="Validated"></i>';
        
        // Update button
        button.disabled = true;
        button.innerHTML = '<i class="fa fa-check"></i>';
        button.classList.remove('btn-info');
        button.classList.add('btn-success');
        button.title = 'Completed';
    }
    
    // Mark questionnaire as error
    function markQuestionnaireAsError(button) {
        const row = button.closest('tr');
        row.style.backgroundColor = '#f8d7da';
        row.style.transition = 'background-color 0.3s';
        
        button.classList.remove('btn-info');
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="fa fa-times"></i>';
        button.title = 'Error occurred';
    }
    
    // Main function to process all questionnaires
    async function processAllQuestionnaires() {
        const startTime = Date.now();
        
        try {
            const buttons = Array.from(getAllQuestionnaireButtons());
            
            if (buttons.length === 0) {
                alert('No questionnaire buttons found!');
                return;
            }
            
            console.log(`🎯 Starting auto-fill process for ${buttons.length} questionnaires`);
            console.log('📋 Each questionnaire will be filled with highest ratings (option 4) and validated');
            
            // Create progress indicator
            createProgressIndicator();
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            // Process each questionnaire
            for (let i = 0; i < buttons.length; i++) {
                const result = await processSingleQuestionnaire(buttons[i], i, buttons.length);
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push(`Questionnaire ${i + 1}: ${result.error}`);
                }
                
                // Update statistics
                updateStats(successCount, errorCount, startTime);
                
                // Wait between requests (except for the last one)
                if (i < buttons.length - 1) {
                    console.log(`⏳ Waiting ${DELAY_BETWEEN_QUESTIONNAIRES/1000}s before next questionnaire...`);
                    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_QUESTIONNAIRES));
                }
            }
            
            // Final results
            const totalTime = Math.round((Date.now() - startTime) / 1000);
            const progressText = document.getElementById('progress-text');
            const currentCourse = document.getElementById('current-course');
            
            if (progressText) {
                progressText.textContent = `🎉 Completed! ${successCount}/${buttons.length} successful`;
                progressText.style.color = successCount === buttons.length ? '#28a745' : '#ffc107';
            }
            if (currentCourse) {
                currentCourse.textContent = `✨ All questionnaires processed in ${totalTime}s`;
            }
            
            // Show results
            let message = `🎉 Auto-fill Process Completed!\n\n`;
            message += `📊 Results:\n`;
            message += `✅ Successful: ${successCount}\n`;
            message += `❌ Errors: ${errorCount}\n`;
            message += `📝 Total: ${buttons.length}\n`;
            message += `⏱️ Time taken: ${totalTime} seconds\n`;
            
            if (errorCount > 0) {
                message += `\n❌ Errors encountered:\n${errors.slice(0, 3).join('\n')}`;
                if (errors.length > 3) {
                    message += `\n... and ${errors.length - 3} more (check console)`;
                }
            }
            
            alert(message);
            
            console.log('\n=== 🏁 FINAL RESULTS ===');
            console.log(`✅ Successful: ${successCount}`);
            console.log(`❌ Errors: ${errorCount}`);
            console.log(`📝 Total: ${buttons.length}`);
            console.log(`⏱️ Time taken: ${totalTime} seconds`);
            
            if (errors.length > 0) {
                console.log('\n❌ Error details:');
                errors.forEach(error => console.log(`  - ${error}`));
            }
            
        } catch (error) {
            console.error('❌ Critical error in processAllQuestionnaires:', error);
            alert(`Critical error occurred: ${error.message}\n\nCheck console for details.`);
        }
    }
    
    // Add UI controls
    function addUIControls() {
        const buttons = getAllQuestionnaireButtons();
        
        if (buttons.length === 0) {
            console.log('No questionnaire buttons found on this page');
            return;
        }
        
        console.log(`🎯 Found ${buttons.length} questionnaires ready for auto-fill`);
        
        // Main start button
        const startButton = document.createElement('button');
        startButton.textContent = `🚀 Auto Fill All (${buttons.length})`;
        startButton.className = 'btn btn-primary btn-lg';
        startButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            transition: all 0.3s;
        `;
        
        startButton.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(0,123,255,0.4)';
        };
        
        startButton.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
        };
        
        startButton.onclick = function() {
            const message = `🎯 Auto-fill ${buttons.length} questionnaires?\n\n` +
                          `📝 Each questionnaire will be:\n` +
                          `• Filled with highest ratings (option 4)\n` +
                          `• Marked as valid\n` +
                          `• Automatically saved\n\n` +
                          `⏱️ Estimated time: ${Math.ceil(buttons.length * DELAY_BETWEEN_QUESTIONNAIRES / 1000)} seconds\n\n` +
                          `Continue?`;
            
            if (confirm(message)) {
                startButton.style.display = 'none';
                processAllQuestionnaires();
            }
        };
        
        document.body.appendChild(startButton);
        
        // Test single button
        const testButton = document.createElement('button');
        testButton.textContent = '🧪 Test First';
        testButton.className = 'btn btn-warning btn-sm';
        testButton.style.cssText = `
            position: fixed;
            top: 60px;
            right: 150px;
            z-index: 9999;
            background: #ffc107;
            color: #212529;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        `;
        
        testButton.onclick = function() {
            if (confirm('🧪 Test with the first questionnaire only?')) {
                testButton.style.display = 'none';
                createProgressIndicator();
                processSingleQuestionnaire(buttons[0], 0, 1);
            }
        };
        
        document.body.appendChild(testButton);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addUIControls);
    } else {
        addUIControls();
    }
    
    // Export functions
    window.autoQuestionnaire = {
        processAll: processAllQuestionnaires,
        testFirst: () => {
            const buttons = getAllQuestionnaireButtons();
            if (buttons[0]) {
                createProgressIndicator();
                return processSingleQuestionnaire(buttons[0], 0, 1);
            }
        },
        submit: submitQuestionnaire
    };
    
    console.log('🚀 Auto Questionnaire Filler (cURL Implementation) loaded!');
    console.log('📋 Available functions:');
    console.log('  • autoQuestionnaire.processAll() - Process all questionnaires');
    console.log('  • autoQuestionnaire.testFirst() - Test first questionnaire');
    console.log('  • autoQuestionnaire.submit(nip, kelas) - Submit specific questionnaire');
    
})();
