document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const themeToggle = document.getElementById('theme-toggle');
    const clearCompleted = document.getElementById('clearCompleted');
    const saveAll = document.getElementById('saveAll');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    const totalTasksEl = document.getElementById('totalTasks');
    const activeTasksEl = document.getElementById('activeTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    
    const currentYearEl = document.getElementById('current-year');
    currentYearEl.textContent = new Date().getFullYear();
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // تحميل المهام عند بدء التشغيل
    loadTasks();
    updateStats();
    
    // إضافة مهمة جديدة
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // تبديل وضع التصميم
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.querySelector('i').classList.toggle('fa-moon');
        themeToggle.querySelector('i').classList.toggle('fa-sun');
        
        // حفظ الوضع في localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // تحميل وضع التصميم من localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    
    // حذف المهام المكتملة
    clearCompleted.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });
    
    // حفظ جميع المهام
    saveAll.addEventListener('click', () => {
        saveTasks();
        alert('تم حفظ جميع المهام بنجاح!');
    });
    
    // تطبيق الفلتر
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });
    
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('الرجاء إدخال مهمة');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toLocaleString('ar-SA')
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
        
        // إضافة تأثير للعنصر الجديد
        const newTaskItem = taskList.firstChild;
        newTaskItem.style.animation = 'pulse 0.5s';
        setTimeout(() => {
            newTaskItem.style.animation = '';
        }, 500);
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty">لا توجد مهام لعرضها</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
        
        // إضافة مستمعي الأحداث
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTask);
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', editTask);
        });
        
        updateStats();
    }
    
    function toggleTask(e) {
        const id = parseInt(e.target.dataset.id);
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }
    
    function deleteTask(e) {
        const id = parseInt(e.target.closest('button').dataset.id);
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }
    
    function editTask(e) {
        const id = parseInt(e.target.closest('button').dataset.id);
        const task = tasks.find(task => task.id === id);
        const newText = prompt('تعديل المهمة:', task.text);
        
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        renderTasks();
    }
    
    function updateStats() {
        totalTasksEl.textContent = tasks.length;
        activeTasksEl.textContent = tasks.filter(task => !task.completed).length;
        completedTasksEl.textContent = tasks.filter(task => task.completed).length;
    }
});
