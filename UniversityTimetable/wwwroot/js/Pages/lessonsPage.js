const WEEK_TYPE = {
    BOTH: "Н/П",
    ODD: "Непарний",
    EVEN: "Парний"
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
        semesterId: document.getElementById('add-Lessons-semester').value
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
        semesterId: document.getElementById('edit-Lessons-semester').value
    };
}


function populateSchedule(data) {
    const scheduleBody = document.getElementById("schedule-body");
    scheduleBody.innerHTML = "";

    const lessonTimes = ["08:40", "10:35", "12:20", "14:05"];
    const dayMapping = { /*0: 6,*/ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

    lessonTimes.forEach(time => {
        const row = document.createElement("tr");
        row.appendChild(createTableCell(time, true));

        const lessonDivsByDay = Array.from({ length: 6 }, () => document.createElement("div"));

        data.forEach(item => {
            if (item.startTime.startsWith(time)) {
                const mappedDay = dayMapping[item.dayOfWeek];
                const lessonDiv = createLessonDiv(item);
                lessonDivsByDay[mappedDay].appendChild(lessonDiv);
            }
        });

        lessonDivsByDay.forEach(lessonDiv => {
            const cell = createTableCell("");
            cell.appendChild(lessonDiv);
            row.appendChild(cell);
        });

        scheduleBody.appendChild(row);
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
}


function getDayOfWeekString(dayOfWeek) {
    return [/*'Неділя',*/ 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'][dayOfWeek];
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
        { value: 1, name: 'Понеділок' },
        { value: 2, name: 'Вівторок' },
        { value: 3, name: 'Середа' },
        { value: 4, name: 'Четвер' },
        { value: 5, name: 'П\'ятниця' },
        { value: 6, name: 'Субота' }
    ];
    populateSelect(id, days);
}

//function populateWeeks(id) {
//    const weeks = [
//        { value: 0, name: WEEK_TYPE.BOTH },
//        { value: 1, name: WEEK_TYPE.EVEN },
//        { value: 2, name: WEEK_TYPE.ODD }
//    ];
//    populateSelect(id, weeks);
//}

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

//function populateWeeksCreate() {
//    populateWeeks('add-Lessons-week');
//}

//function populateWeeksEdit() {
//    populateWeeks('edit-Lessons-week');
//}

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

    const lessonInfo = document.createElement("div");
    lessonInfo.classList.add("lesson-info");

    let weekType = WEEK_TYPE.BOTH;
    if (item.week === 1) weekType = WEEK_TYPE.ODD;
    else if (item.week === 2) weekType = WEEK_TYPE.EVEN;

    lessonInfo.innerHTML = `
        <div>
            <span class="week-type">${weekType}</span>
            <span class="auditorium-name">каб: ${item.auditoriumName}</span>
        </div>
        <span class="subject-name">${item.subjectName}</span>
        <span class="teacher-name">${item.teacherName}</span>
    `;

    lessonDiv.appendChild(lessonInfo);
    lessonDiv.addEventListener("click", () => displayEditForm("Lessons", item));

    return lessonDiv;
}



function createLessonButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    return button;
}