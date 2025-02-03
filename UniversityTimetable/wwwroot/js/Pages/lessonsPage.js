function getLessonsData() {
    const body = {};
    body.groupId = document.getElementById('add-Lessons-group').value;
    body.subjectId = document.getElementById('add-Lessons-subject').value;
    body.teacherId = document.getElementById('add-Lessons-teacher').value;
    body.dayOfWeek = getDayOfWeekIndex(document.getElementById('add-Lessons-day').value);
    body.startTime = document.getElementById('add-Lessons-time').value;
    body.isEvenWeek = document.getElementById('add-Lessons-even-week').checked;
    return body;
}
async function loadAllDropdowns() {
    await loadDropdownData('/api/groups', 'edit-Lessons-group');
    await loadDropdownData('/api/subjects', 'edit-Lessons-subject');
    await loadDropdownData('/api/teachers', 'edit-Lessons-teacher');
    populateDaysEdit();
    populateTimesEdit();
}
function setLessonsEditFormValues(item) {
    document.getElementById('edit-Lessons-group').value = item.groupId;
    document.getElementById('edit-Lessons-subject').value = item.subjectId;
    document.getElementById('edit-Lessons-teacher').value = item.teacherId;
    document.getElementById('edit-Lessons-day').value = item.dayOfWeek;
    document.getElementById('edit-Lessons-time').value = item.startTime;
    document.getElementById('edit-Lessons-even-week').checked = item.isEvenWeek;
}
function getLessonsEditFormData() {
    return {
        groupId: document.getElementById('edit-Lessons-group').value,
        subjectId: document.getElementById('edit-Lessons-subject').value,
        teacherId: document.getElementById('edit-Lessons-teacher').value,
        dayOfWeek: parseInt(document.getElementById('edit-Lessons-day').value, 10),
        startTime: document.getElementById('edit-Lessons-time').value,
        isEvenWeek: document.getElementById('edit-Lessons-even-week').checked
    };
}
function populateLessonsRow(row, item) {
    row.insertCell().textContent = item.groupName;
    row.insertCell().textContent = item.subjectName;
    row.insertCell().textContent = item.teacherName;
    row.insertCell().textContent = getDayOfWeekString(item.dayOfWeek);
    row.insertCell().textContent = item.startTime;
    row.insertCell().textContent = item.isEvenWeek ? 'Парний' : 'Непарний';
}

function getDayOfWeekString(dayOfWeek) {
    return ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'][dayOfWeek];
}
function populateGroups(data) {
    populateSelect('add-Lessons-group', data.map(group => ({ id: group.id, name: group.name })));

    // Додаємо оновлення для фільтра груп
    const groupFilter = document.getElementById('group-filter');
    groupFilter.innerHTML = '<option value="">Всі групи</option>'; // Додаємо варіант "усі"

    data.forEach(group => {
        const option = document.createElement('option');
        option.value = group.name;
        option.textContent = group.name;
        groupFilter.appendChild(option);
    });
}
function populateSubjects(data) {
    populateSelect('add-Lessons-subject', data.map(subject => ({ id: subject.id, name: subject.name })));
}

function populateTeachers(data) {
    populateSelect('add-Lessons-teacher', data.map(teacher => ({ id: teacher.id, name: teacher.name })));
}

function getDayOfWeekIndex(day) {
    return parseInt(day, 10);
}

function populateTimes(id) {
    const times = [
        { value: '08:40', label: '08:40' },
        { value: '10:35', label: '10:35' },
        { value: '12:20', label: '12:20' },
        { value: '14:05', label: '14:05' }
    ];
    populateSelect(id, times);
}

function populateDays(id) {
    const days = [
        { value: 0, name: 'Неділя' },
        { value: 1, name: 'Понеділок' },
        { value: 2, name: 'Вівторок' },
        { value: 3, name: 'Середа' },
        { value: 4, name: 'Четвер' },
        { value: 5, name: 'П\'ятниця' },
        { value: 6, name: 'Субота' }
    ];
    populateSelect(id, days);
}

function populateTimesCreate() {
    populateTimes('add-Lessons-time');
}

function populateTimesEdit() {
    populateTimes('edit-Lessons-time');
}

function populateDaysCreate() {
    populateDays('add-Lessons-day');
}

function populateDaysEdit() {
    populateDays('edit-Lessons-day');
}