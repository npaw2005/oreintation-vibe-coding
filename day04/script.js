document.addEventListener('DOMContentLoaded', () => {
    // Theme Switcher Logic
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });

    // GPA Calculator Logic
    const courseList = document.getElementById('course-list');
    const addCourseBtn = document.getElementById('add-course');
    const calculateGpaBtn = document.getElementById('calculate-gpa');
    const gpaValueSpan = document.getElementById('gpa-value');

    const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    // Event delegation for removing courses
    courseList.addEventListener('click', (e) => {
        if (e.target.closest('.remove-course')) {
            if (courseList.children.length > 1) {
                e.target.closest('.course-row').remove();
            } else {
                // Clear the first row instead of deleting if it's the last one
                const row = courseList.children[0];
                row.querySelector('.grade-input').value = '';
                row.querySelector('.credit-input').value = '';
            }
        }
    });

    addCourseBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'course-row';
        row.innerHTML = `
            <input type="text" placeholder="Grade (e.g. A, B+, 4.0)" class="grade-input">
            <input type="number" placeholder="Credits" class="credit-input" min="1">
            <button class="remove-course btn-icon"><i class="fas fa-times"></i></button>
        `;
        courseList.appendChild(row);
    });

    calculateGpaBtn.addEventListener('click', () => {
        const gradeInputs = document.querySelectorAll('.grade-input');
        const creditInputs = document.querySelectorAll('.credit-input');
        
        let totalPoints = 0;
        let totalCredits = 0;

        for (let i = 0; i < gradeInputs.length; i++) {
            const gradeVal = gradeInputs[i].value.trim().toUpperCase();
            const creditVal = parseFloat(creditInputs[i].value);

            if (!gradeVal || isNaN(creditVal)) continue;

            let points = 0;
            if (!isNaN(parseFloat(gradeVal))) {
                points = parseFloat(gradeVal);
            } else if (gradePoints[gradeVal] !== undefined) {
                points = gradePoints[gradeVal];
            } else {
                alert(`Invalid grade: ${gradeVal}`);
                return;
            }

            totalPoints += points * creditVal;
            totalCredits += creditVal;
        }

        if (totalCredits === 0) {
            gpaValueSpan.textContent = '0.00';
        } else {
            const gpa = totalPoints / totalCredits;
            gpaValueSpan.textContent = gpa.toFixed(2);
        }
    });

    // Pomodoro Timer Logic
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-timer');
    const resetBtn = document.getElementById('reset-timer');
    const bellSound = document.getElementById('bell-sound');

    let timerInterval;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let isRunning = false;

    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        minutesDisplay.textContent = mins.toString().padStart(2, '0');
        secondsDisplay.textContent = secs.toString().padStart(2, '0');
    }

    function startTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            startBtn.textContent = 'Start';
            isRunning = false;
        } else {
            isRunning = true;
            startBtn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.textContent = 'Start';
                    bellSound.play();
                    alert('Time is up! Take a break.');
                }
            }, 1000);
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 25 * 60;
        isRunning = false;
        startBtn.textContent = 'Start';
        updateDisplay();
    }

    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Idea Board Logic
    const studentSelect = document.getElementById('student-name');
    const ideaContent = document.getElementById('idea-content');
    const postIdeaBtn = document.getElementById('post-idea');
    const ideasGrid = document.getElementById('ideas-grid');

    window.formatDoc = (cmd, val) => {
        document.execCommand(cmd, false, val);
        ideaContent.focus();
    };

    postIdeaBtn.addEventListener('click', () => {
        const student = studentSelect.value;
        const content = ideaContent.innerHTML.trim();

        if (!student) {
            alert('Please select a student name.');
            return;
        }

        if (!content || content === '<br>') {
            alert('Please write your idea.');
            return;
        }

        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card';
        
        // Generate a random ID for the content wrapper to handle read more
        const wrapperId = 'content-' + Date.now();

        ideaCard.innerHTML = `
            <div class="idea-author">Posted by: ${student}</div>
            <div id="${wrapperId}" class="idea-content-wrapper">
                ${content}
            </div>
            <button class="read-more-btn" data-target="${wrapperId}">Read More</button>
        `;

        ideasGrid.prepend(ideaCard);

        // Reset form
        studentSelect.value = '';
        ideaContent.innerHTML = '';

        // Check if content is long enough to need "Read More"
        const wrapper = document.getElementById(wrapperId);
        if (wrapper.scrollHeight <= 100) {
            ideaCard.querySelector('.read-more-btn').style.display = 'none';
        }
    });

    // Event delegation for "Read More" buttons
    ideasGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more-btn')) {
            const btn = e.target;
            const targetId = btn.getAttribute('data-target');
            const wrapper = document.getElementById(targetId);
            
            if (wrapper.classList.contains('expanded')) {
                wrapper.classList.remove('expanded');
                btn.textContent = 'Read More';
            } else {
                wrapper.classList.add('expanded');
                btn.textContent = 'Show Less';
            }
        }
    });
});
