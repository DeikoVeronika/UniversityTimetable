const WEEK_TYPE = {
    BOTH: "Н/П",
    ODD: "Непарний",
    EVEN: "Парний"
}

const WEEK_DAYS = {
    MONDAY: "Понеділок",
    TUESDAY: "Вівторок",
    WEDNESDAY: "Середа",
    THURSDAY: "Четвер",
    FRIDAY: "П'ятниця",
    SATURDAY: "Субота"
}

const LESSON_TYPE = {
    LECTURE: "Лекція",
    PRACTICE: "Практика",
    CONSULTATION: "Консультація",
    SEMINAR: "Семінар",
    LAB: "Лаб"
}

function getLessonsData() {
    let weekValue;
    const selectedWeek = document.querySelector('input[name="add-Lessons-week"]:checked');
    if (selectedWeek) {
        weekValue = parseInt(selectedWeek.value, 10);
    }

    const body = {
        groupId: document.getElementById('add-Lessons-group').value,
        subjectId: document.getElementById('add-Lessons-subject').value,
        teacherId: document.getElementById('add-Lessons-teacher').value,
        auditoriumId: document.getElementById('add-Lessons-auditorium').value,
        dayOfWeek: getDayOfWeekIndex(document.getElementById('add-Lessons-day').value),
        startTime: formatTime(document.getElementById('add-Lessons-time').value),
        week: weekValue,
        semesterId: document.getElementById('add-Lessons-semester').value,
        lessonType: parseInt(document.getElementById('add-Lessons-lessonType').value, 10)
    };

    return body;
}

async function loadAllDropdowns() {
    await loadDropdownData('/api/groups', 'edit-Lessons-group');
    await loadDropdownData('/api/subjects', 'edit-Lessons-subject');
    await loadDropdownData('/api/teachers', 'edit-Lessons-teacher');
    await loadDropdownData('/api/auditoriums', 'edit-Lessons-auditorium');
    await loadDropdownData('/api/semesters', 'edit-Lessons-semester');
    populateDaysEdit();
    populateTimesEdit();
    populateLessonTypesEdit();
    //populateWeeksEdit();
}
function setLessonsEditFormValues(item) {
    document.getElementById('edit-Lessons-group').value = item.groupId;
    document.getElementById('edit-Lessons-subject').value = item.subjectId;
    document.getElementById('edit-Lessons-teacher').value = item.teacherId;
    document.getElementById('edit-Lessons-auditorium').value = item.auditoriumId;
    document.getElementById('edit-Lessons-day').value = item.dayOfWeek;
    document.getElementById('edit-Lessons-time').value = item.startTime;
    document.getElementById('edit-Lessons-semester').value = item.semesterId;
    document.getElementById('edit-Lessons-lessonType').value = item.lessonType;

    const weekRadioButtons = document.querySelectorAll('input[name="edit-Lessons-week"]');
    weekRadioButtons.forEach(radio => {
        if (parseInt(radio.value, 10) === item.week) {
            radio.checked = true;
        }
    });

    const deleteButton = document.getElementById('delete-lesson-button');
    deleteButton.onclick = () => {
        //if (confirm("Ви впевнені, що хочете видалити цей урок?")) {
        //    deleteEntity("Lessons", item.id);
        //    closeInput("Lessons");
        //}
        deleteEntity("Lessons", item.id);
        closeInput("Lessons");
    };
}


function getLessonsEditFormData() {
    let weekValue;
    const selectedWeek = document.querySelector('input[name="edit-Lessons-week"]:checked');
    if (selectedWeek) {
        weekValue = parseInt(selectedWeek.value, 10);
    } 

    return {
        groupId: document.getElementById('edit-Lessons-group').value,
        subjectId: document.getElementById('edit-Lessons-subject').value,
        teacherId: document.getElementById('edit-Lessons-teacher').value,
        auditoriumId: document.getElementById('edit-Lessons-auditorium').value,
        dayOfWeek: parseInt(document.getElementById('edit-Lessons-day').value, 10),
        startTime: formatTime(document.getElementById('edit-Lessons-time').value),
        week: weekValue,
        semesterId: document.getElementById('edit-Lessons-semester').value,
        lessonType: parseInt(document.getElementById('edit-Lessons-lessonType').value, 10)
    };
}


function populateSchedule(data) {
    const scheduleBody = document.getElementById("schedule-body");
    scheduleBody.innerHTML = "";

    const lessonTimes = ["08:40", "10:35", "12:20", "14:05"];
    const dayMapping = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    const mappedCurrentDay = getCurrentDayIndex(dayMapping);

    highlightCurrentDay(mappedCurrentDay);
    lessonTimes.forEach(time => createScheduleRow(time, data, scheduleBody, dayMapping, mappedCurrentDay));
}

function getCurrentDayIndex(dayMapping) {
    const currentDayIndex = new Date().getDay();
    return dayMapping[currentDayIndex];
}

function highlightCurrentDay(mappedCurrentDay) {
    const scheduleThead = document.getElementById("schedule-thead").querySelector("tr");
    const headerCells = scheduleThead.querySelectorAll("th");

    if (mappedCurrentDay !== undefined && headerCells.length > mappedCurrentDay + 1) {
        headerCells[mappedCurrentDay + 1].classList.add("today");
    }
}

function createScheduleRow(time, data, scheduleBody, dayMapping, mappedCurrentDay) {
    const row = document.createElement("tr");
    row.appendChild(createTableCell(time, true));

    const lessonDivsByDay = Array.from({ length: 6 }, () => document.createElement("div"));

    populateLessonDivs(lessonDivsByDay, data, time, dayMapping);

    lessonDivsByDay.forEach((lessonDiv, index) => {
        const cell = createTableCell("");
        cell.appendChild(lessonDiv);
        row.appendChild(cell);

        if (index === mappedCurrentDay) {
            cell.classList.add("today");
        }
    });

    scheduleBody.appendChild(row);
}

function populateLessonDivs(lessonDivsByDay, data, time, dayMapping) {
    data.forEach(item => {
        if (item.startTime.startsWith(time)) {
            const mappedDay = dayMapping[item.dayOfWeek];
            lessonDivsByDay[mappedDay].appendChild(createLessonDiv(item));
        }
    });
}

function populateLessonsRow(row, item) {
    row.insertCell().textContent = item.startTime;
    row.insertCell().textContent = item.groupName;
    row.insertCell().textContent = item.subjectName;
    row.insertCell().textContent = item.teacherName;
    row.insertCell().textContent = item.auditoriumName;
    row.insertCell().textContent = getDayOfWeekString(item.dayOfWeek);
    row.insertCell().textContent = item.week;
    row.insertCell().textContent = item.semester;
    row.insertCell().textContent = item.lessonType;
}


function getDayOfWeekString(dayOfWeek) {
    return [
        WEEK_DAYS.MONDAY,
        WEEK_DAYS.TUESDAY,
        WEEK_DAYS.WEDNESDAY,
        WEEK_DAYS.THURSDAY,
        WEEK_DAYS.FRIDAY,
        WEEK_DAYS.SATURDAY
    ][dayOfWeek];
}

function populateGroups(data) {
    populateSelect('add-Lessons-group', data.map(group => ({ id: group.id, name: group.name })));

    const groupFilter = document.getElementById('group-filter');
    groupFilter.innerHTML = '<option value="">Всі групи</option>'

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

function populateAuditoriums(data) {
    populateSelect('add-Lessons-auditorium', data.map(auditorium => ({ id: auditorium.id, name: auditorium.name })));
}

function populateSemesters(data) {
    populateSelect('add-Lessons-semester', data.map(semester => ({ id: semester.id, name: semester.name })));
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
        //{ value: 0, name: 'Неділя' },
        { value: 1, name: WEEK_DAYS.MONDAY },
        { value: 2, name: WEEK_DAYS.TUESDAY },
        { value: 3, name: WEEK_DAYS.WEDNESDAY },
        { value: 4, name: WEEK_DAYS.THURSDAY },
        { value: 5, name: WEEK_DAYS.FRIDAY },
        { value: 6, name: WEEK_DAYS.SATURDAY }
    ];
    populateSelect(id, days);
}

function populateLessonTypes(id) {
    const lessonTypes = [
        { value: 0, name: LESSON_TYPE.LECTURE },
        { value: 1, name: LESSON_TYPE.PRACTICE },
        { value: 2, name: LESSON_TYPE.CONSULTATION },
        { value: 3, name: LESSON_TYPE.SEMINAR },
        { value: 4, name: LESSON_TYPE.LAB }
    ];

    populateSelect(id, lessonTypes);
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

function populateLessonTypesCreate() {
    populateLessonTypes('add-Lessons-lessonType');
}

function populateLessonTypesEdit() {
    populateLessonTypes('edit-Lessons-lessonType');
}

function formatTime(time) {
    return time.length === 5 ? time + ":00" : time;
}

function createTableCell(content, isFirstColumn = false) {
    const cell = document.createElement("td");

    if (isFirstColumn) {
        const span = document.createElement("span");
        span.classList.add("start-lesson-time");
        span.textContent = content;
        cell.appendChild(span);
    } // else {
    //    if (typeof content === "string") {
    //        cell.innerHTML = content; 
    //    } else if (content instanceof Node) {
    //        cell.appendChild(content); 
    //    }
    //}

    return cell;
}

function createLessonDiv(item) {
    const lessonDiv = document.createElement("div");
    lessonDiv.classList.add("lesson-card");

    // Додаємо клас відповідно до типу уроку
    const lessonTypeClass = getLessonTypeClass(item.lessonType);
    lessonDiv.classList.add(lessonTypeClass);

    const lessonInfo = document.createElement("div");
    lessonInfo.classList.add("lesson-info");

    let weekType = WEEK_TYPE.BOTH;
    if (item.week === 1) weekType = WEEK_TYPE.ODD;
    else if (item.week === 2) weekType = WEEK_TYPE.EVEN;

    let lessonType = LESSON_TYPE.LECTURE;
    if (item.lessonType === 1) {
        lessonType = LESSON_TYPE.PRACTICE
    } else if (item.lessonType === 2) {
        lessonType = LESSON_TYPE.CONSULTATION
    } else if (item.lessonType === 3) {
        lessonType = LESSON_TYPE.SEMINAR
    } else if (item.lessonType === 4) {
        lessonType = LESSON_TYPE.LAB
    }

    lessonInfo.innerHTML = `
        <div class="lesson-card-header">
            <span class="week-type">${weekType}</span>
            <div class="auditorium-lessonType">
                <span class="auditorium-name">каб: ${item.auditoriumName}</span>
                <span class="lessonType">${lessonType}</span>
            </div>
        </div>
        <span class="subject-name">${item.subjectName}</span>
        <span class="teacher-name">${item.teacherName}</span>
    `;

    lessonDiv.appendChild(lessonInfo);
    lessonDiv.addEventListener("click", () => displayEditForm("Lessons", item));

    return lessonDiv;
}

// Функція для отримання CSS-класу за типом уроку
function getLessonTypeClass(lessonType) {
    const classMap = {
        0: "lecture-card",
        1: "practice-card",
        2: "consultation-card",
        3: "seminar-card",
        4: "lab-card"
    };
    return classMap[lessonType] || "default-lesson-card";
}


function isEvenWeek(startDate) {
    const diffDays = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return (Math.floor(diffDays / 7) + 1) % 2 === 0;
}

function updateWeekHeader(startDate) {
    document.querySelector("#schedule-thead tr th:first-child").textContent = isEvenWeek(startDate) ? WEEK_TYPE.EVEN : WEEK_TYPE.ODD;
}

// Викликаємо функцію після завантаження семестрів
async function fetchSemestersAndSetHeader() {
    await fetchData('Semesters', data => {
        if (data.length > 0) {
            const semesterStartDate = data[0].startDate; // Припустимо, що є лише один активний семестр
            updateWeekHeader(semesterStartDate);
        }
    });
}

function createLessonButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    return button;
}