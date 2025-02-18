const DAYS_OF_WEEK = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
const TIME_SLOTS = ["08:40", "10:35", "12:20", "14:05"];
const PROGRAM_TRANSLATIONS = {
    "Informatics": "Інформатика",
    "AppliedMath": "Прикладна математика",
    "SystemAnalysis": "Системний аналіз",
    "SoftwareEngineering": "Програмна інженерія"
};

let selectedCourse = 1;
let selectedDay = 1;
let isSelecting = false;
let selectedCells = [];
let lastEnteredCell = null;

document.addEventListener("DOMContentLoaded", async () => {
    await generateTable();
    initializeModal();
    generateSchedule();
});

// Main Functions
async function generateTable() {
    const tableBody = document.getElementById("table-body");

    try {
        const [groups, programs] = await fetchData();
        const groupsByYearAndProgram = groupDataByYearAndProgram(groups);
        const sortedYears = Object.keys(groupsByYearAndProgram).sort((a, b) => a - b);

        tableBody.innerHTML = generateTableHTML(sortedYears, groupsByYearAndProgram, programs);

        const lessons = await fetchLessons();

        await fillSchedule(lessons);
    } catch (error) {
        console.error("Помилка при генерації таблиці:", error);
    }
}

async function fetchData() {
    return Promise.all([
        fetch("/api/groups").then(res => res.json()),
        fetch("/api/enums/program").then(res => res.json())
    ]);
}

async function fetchLessons() {
    try {
        const response = await fetch("/api/lessons");
        if (!response.ok) throw new Error("Помилка отримання уроків");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function generateSchedule() {
    const apiEndpoints = ["/api/enums/year", "/api/enums/program", "/api/groups", "/api/subjects", "/api/teachers", "/api/auditoriums"];
    const [years, programs, groups, subjects, teachers, auditoriums] = await Promise.all(
        apiEndpoints.map(url => fetch(url).then(res => res.json()))
    );

    const scheduleContainer = document.getElementById("schedule-container");
    scheduleContainer.innerHTML = "";

    years.forEach((year, courseIndex) => {
        const courseDiv = createCourseDiv(courseIndex);
        DAYS_OF_WEEK.forEach((day, dayId) => {
            const dayDiv = createDayDiv(courseIndex, dayId);
            programs.forEach((program, programIndex) => {
                const programDiv = createProgramDiv(program, day, courseIndex);
                TIME_SLOTS.forEach(time => {
                    const lessonDiv = createLessonDiv(time, groups, courseIndex, programIndex, subjects, teachers, auditoriums);
                    programDiv.appendChild(lessonDiv);
                });
                dayDiv.appendChild(programDiv);
            });
            courseDiv.appendChild(dayDiv);
        });
        scheduleContainer.appendChild(courseDiv);
    });

    showCourse(1);
    showDay(selectedDay);
}

// Modal Initialization
function initializeModal() {
    const modal = document.getElementById("modal");
    const modalInfo = document.getElementById("modal-info");
    const closeModal = document.querySelector(".close");
    const saveLesson = document.getElementById("save-lesson");

    document.querySelectorAll(".schedule-cell").forEach(cell => {
        cell.addEventListener("mousedown", (event) => startSelection(event, cell));
        cell.addEventListener("mouseenter", (event) => handleMouseEnter(event, cell));
        cell.addEventListener("mouseup", () => endSelection(modal, modalInfo, saveLesson));
    });

    closeModal.addEventListener("click", () => closeModalWindow(modal));
    window.addEventListener("mouseup", () => { isSelecting = false; });
}

// Lesson Management
let blockNumber = 1;
function addLessonContainer(time, btn) {
    const lessonDiv = btn.closest(".lesson-block");
    const newLessonDiv = lessonDiv.cloneNode(true);
    newLessonDiv.querySelector(".add-lesson-btn").remove();
    newLessonDiv.querySelector(".remove-lesson-btn").classList.remove("hidden");
    resetLessonInputs(newLessonDiv);

    const weekDiv = newLessonDiv.querySelector(".week");
    weekDiv.innerHTML = createWeekOptions(time, blockNumber);

    blockNumber++;

    lessonDiv.parentNode.insertBefore(newLessonDiv, lessonDiv.nextSibling);
}


function removeLesson(btn) {
    btn.closest(".lesson-block").remove();
}

function resetLessonInputs(lessonDiv) {
    lessonDiv.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
    lessonDiv.querySelectorAll(".group-checkbox").forEach(checkbox => checkbox.checked = false);
    lessonDiv.querySelectorAll("input[type='radio']").forEach(radio => radio.checked = false);
}

// Day and Course Display
function showDay(dayId) {
    selectedDay = dayId;
    hideAll(`#course-${selectedCourse} > div`);
    show(`#day-${dayId}-course-${selectedCourse}`);
}

function showCourse(courseId) {
    selectedCourse = courseId;
    hideAll("#schedule-container > div");
    show(`#course-${courseId}`);
    showDay(selectedDay);
}

function hideAll(selector) {
    document.querySelectorAll(selector).forEach(el => el.classList.add("hidden"));
}

function show(selector) {
    document.querySelector(selector).classList.remove("hidden");
}

// Selection Handling
function startSelection(event, cell) {
    if (event.button !== 0) return; 
    isSelecting = true;
    selectedCells = [cell];
    lastEnteredCell = cell;
    updateCellHighlight();
}

function handleMouseEnter(event, cell) {
    if (!isSelecting) return;

    const cellIndex = selectedCells.indexOf(cell);
    const lastIndex = selectedCells.indexOf(lastEnteredCell);

    if (cellIndex === -1) {
        selectedCells.push(cell);
    } else if (cellIndex < lastIndex) {
        selectedCells.pop();
    }

    lastEnteredCell = cell;
    updateCellHighlight();
}

async function endSelection(modal, modalInfo, saveLesson) {
    if (selectedCells.length === 0) return;
    isSelecting = false;

    const { day, time, groupIds } = extractSelectionData(selectedCells);
    if (!isValidSelection(day, time)) return;

    const lessonExists = await checkLessonExists(day, time, groupIds);
    const groupNames = await getGroupNames(groupIds);

    showModal(modal, modalInfo, day, time, groupNames.join(", "));
    loadModalOptions(saveLesson, groupIds, lessonExists, lessonExists.exists ? lessonExists : undefined);
}

function extractSelectionData(selectedCells) {
    const uniqueDays = new Set();
    const uniqueTimes = new Set();
    const groupIds = new Set();

    selectedCells.forEach(cell => {
        uniqueDays.add(cell.getAttribute("data-day"));
        uniqueTimes.add(cell.getAttribute("data-time"));

        const cellGroupIds = cell.getAttribute("data-group-ids") || cell.getAttribute("data-group-id");
        cellGroupIds.split(",").forEach(groupId => groupIds.add(groupId.trim()));
    });

    return {
        day: [...uniqueDays][0],
        time: [...uniqueTimes][0],
        groupIds: [...groupIds],
    };
}

function isValidSelection(day, time) {
    return day && time;
}

async function getGroupNames(groupIds) {
    try {
        const response = await fetch(`/api/groups?ids=${groupIds.join(",")}`);
        if (!response.ok) throw new Error('Failed to fetch group names');
        const groups = await response.json();
        return groups.filter(group => groupIds.includes(group.id)).map(group => group.name);
    } catch (error) {
        console.error(error);
        return [];
    }
}

function showModal(modal, modalInfo, day, time, groupNames) {
    modal.style.display = "block";
    modalInfo.innerHTML = `<strong>${day}, ${time}</strong><br>Групи: ${groupNames}`;
}

async function checkLessonExists(day, time, groupIds) {
    const dayOfWeek = getDayOfWeek(day);
    const encodedDay = encodeURIComponent(dayOfWeek);
    const encodedTime = time;
    const encodedGroups = groupIds.map(groupId => encodeURIComponent(groupId)).join(",");

    const response = await fetch(`/api/lessons/check-lesson?day=${encodedDay}&time=${encodedTime}&groups=${encodedGroups}`);

    if (response.ok) {
        const data = await response.json();
        return data.exists ? {
            exists: true,
            subjectId: data.subjectId,
            teacherId: data.teacherId,
            auditoriumId: data.auditoriumId,
            lessonType: data.lessonType,
            week: data.week,
            id: data.id 
        } : { exists: false };
    } else {
        console.error("Помилка при перевірці уроку", response.status);
        return { exists: false };
    }
}

async function loadModalOptions(saveLesson, groupIds, lessonExists, existingLessonData = null) {
    const apiEndpoints = ["/api/subjects", "/api/teachers", "/api/auditoriums"];

    try {
        const [subjects, teachers, auditoriums] = await fetchAllData(apiEndpoints);

        const modalSelects = document.getElementById("modal-selects");
        modalSelects.innerHTML = generateModalContent(subjects, teachers, auditoriums, existingLessonData);

        saveLesson.onclick = () => saveSelection(groupIds, lessonExists, existingLessonData);

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchAllData(endpoints) {
    return Promise.all(
        endpoints.map(url =>
            fetch(url)
                .then(res => res.ok ? res.json() : Promise.reject(`Request error: ${url}`))
        )
    );
}

function generateModalContent(subjects, teachers, auditoriums, existingLessonData) {
    return `
        <div class="selects">
            <div class="subjects">${createSelect('Оберіть предмет', subjects, existingLessonData?.subjectId)}</div>
            <div class="teachers">${createSelect('Оберіть викладача', teachers, existingLessonData?.teacherId)}</div>
            <div class="auditoriums">${createSelect('Оберіть аудиторію', auditoriums, existingLessonData?.auditoriumId)}</div>
            <div class="lesson-type">
                ${createLessonTypeSelect('Оберіть тип заняття', existingLessonData?.lessonType)}
            </div>
        </div>
        <div class="week">
            ${generateWeekOptions(existingLessonData?.week)}
        </div>
        ${existingLessonData ? `<button class="delete-lesson" onclick="deleteLesson('${existingLessonData.id}')">Видалити</button>` : ''}
    `;
}


function generateWeekOptions(selectedWeek) {
    const options = ['Both', 'Odd', 'Even'];
    return options.map(week => `
        <label>
            <input type="radio" name="week-type" value="${week}" ${selectedWeek === week ? 'checked' : ''}> ${week === 'Both' ? 'Обидва' : week === 'Odd' ? 'Непарний' : 'Парний'}
        </label>
    `).join('');
}

function createLessonTypeSelect(defaultText, selectedValue = null) {
    const lessonTypes = [
        { value: "Lecture", text: "Лекція" },
        { value: "Practice", text: "Практика" },
        { value: "Consultation", text: "Консультація" },
        { value: "Seminar", text: "Семінар" },
        { value: "Lab", text: "Лабораторна" }
    ];

    return `
        <select id="lesson-type">
            <option value="">${defaultText}</option>
            ${lessonTypes.map(type => {
        const selected = type.value === selectedValue ? 'selected' : '';
        return `<option value="${type.value}" ${selected}>${type.text}</option>`;
    }).join("")}
        </select>
    `;
}

async function saveSelection(groupIds, lessonExists, existingLessonData) {
    const selectedValues = {
        subject: document.querySelector(".subjects select") ? document.querySelector(".subjects select").value : null,
        teacher: document.querySelector(".teachers select") ? document.querySelector(".teachers select").value : null,
        auditorium: document.querySelector(".auditoriums select") ? document.querySelector(".auditoriums select").value : null,
        weekType: document.querySelector('input[name="week-type"]:checked') ? document.querySelector('input[name="week-type"]:checked').value : null,
        lessonType: document.querySelector(".lesson-type select") ? document.querySelector(".lesson-type select").value : null
    };

    const lessons = groupIds.map(groupId => createLessonObject(groupId, selectedValues, existingLessonData));

    try {
        await Promise.all(lessons.map(lesson => lesson.Id ? updateLesson(lesson) : addLesson([lesson])));
        await generateTable();
        initializeModal();
        closeModalWindow(document.getElementById("modal"));
    } catch (error) {
        console.error("Error saving lesson:", error);
    }
}


function createLessonObject(groupId, selectedValues, existingLessonData) {
    const cell = selectedCells.find(cell => cell.getAttribute("data-group-id") === groupId);
    return {
        GroupId: groupId,
        SubjectId: selectedValues.subject,
        TeacherId: selectedValues.teacher,
        AuditoriumId: selectedValues.auditorium,
        SemesterId: "96b7f32f-4b33-4627-335f-08dd4d23c634",
        DayOfWeek: getDayOfWeek(cell.getAttribute("data-day")),
        StartTime: `${cell.getAttribute("data-time")}:00`,
        Week: getWeekType(selectedValues.weekType),
        LessonType: getLessonType(selectedValues.lessonType),
        Id: existingLessonData ? existingLessonData.id : undefined
    };
}

function getDayOfWeek(day) {
    switch (day) {
        case "Понеділок":
            return 1;
        case "Вівторок":
            return 2;
        case "Середа":
            return 3;
        case "Четвер":
            return 4;
        case "П'ятниця":
            return 5;
        case "Субота":
            return 6;
        case "Неділя":
            return 0;
        default:
            return 0;
    }
}

const DAY_NUM_TO_NAME = {
    1: "Понеділок",
    2: "Вівторок",
    3: "Середа",
    4: "Четвер",
    5: "П'ятниця",
    6: "Субота",
    0: "Неділя"
};

function getWeekType(weekType) {
    switch (weekType) {
        case "Both":
            return 0;
        case "Odd":
            return 1;
        case "Even":
            return 2;
        default:
            return 0;
    }
}

function getLessonType(lessonType) {
    switch (lessonType) {
        case "Lecture":
            return 0;
        case "Practice":
            return 1;
        case "Consultation":
            return 2;
        case "Seminar":
            return 3;
        case "Lab":
            return 4;
        default:
            return 0;
    }
}

// Highlighting Functions
function updateCellHighlight() {
    document.querySelectorAll(".schedule-cell").forEach(cell => {
        cell.classList.toggle("highlight", selectedCells.includes(cell));
    });
}

function clearSelection() {
    selectedCells = [];
    updateCellHighlight();
}

function closeModalWindow(modal) {
    modal.style.display = "none";
    clearSelection(); 
}

// Table Generation Functions
function generateTableHTML(sortedYears, groupsByYearAndProgram, programs) {
    return `
        <tr>
            <td colspan="2" rowspan="3"></td>
            ${generateYearHeaders(sortedYears, groupsByYearAndProgram)}
        </tr>
        <tr>
            ${generateGroupHeaders(sortedYears, groupsByYearAndProgram)}
        </tr>
        <tr>
            ${generateProgramHeaders(sortedYears, groupsByYearAndProgram, programs)}
        </tr>
        ${generateTableRows(sortedYears, groupsByYearAndProgram)}
    `;
}

function generateYearHeaders(sortedYears, groupsByYearAndProgram) {
    return sortedYears.map(year => {
        const totalGroups = Object.values(groupsByYearAndProgram[year]).flat().length;
        return `<td colspan="${totalGroups}">${parseInt(year) + 1} курс</td>`;
    }).join('');
}

function generateGroupHeaders(sortedYears, groupsByYearAndProgram) {
    return sortedYears.flatMap(year =>
        Object.values(groupsByYearAndProgram[year]).flatMap(programGroups =>
            programGroups.map(group => `<td>${group.name}</td>`)
        )
    ).join('');
}

function generateProgramHeaders(sortedYears, groupsByYearAndProgram, programs) {
    return sortedYears.flatMap(year =>
        Object.entries(groupsByYearAndProgram[year]).map(([programId, programGroups]) => {
            const programName = programs[programId];
            const translatedProgram = PROGRAM_TRANSLATIONS[programName] || "Невідома програма";
            return `<td colspan="${programGroups.length}">${translatedProgram}</td>`;
        })
    ).join('');
}

function generateTableRows(sortedYears, groupsByYearAndProgram) {
    return DAYS_OF_WEEK.map(day =>
        TIME_SLOTS.map((time, index) => {
            return `
                <tr>
                    ${index === 0 ? `<td rowspan="${TIME_SLOTS.length}">${day}</td>` : ''}
                    <td>${time}</td>
                    ${generateTableCells(sortedYears, groupsByYearAndProgram, day, time)}
                </tr>
            `;
        }).join('')
    ).join('');
}

function generateTableCells(sortedYears, groupsByYearAndProgram, day, time) {
    return sortedYears.flatMap(year =>
        Object.values(groupsByYearAndProgram[year]).flatMap(programGroups =>
            programGroups.map(group => `
                <td data-group-id="${group.id}" 
                    data-group="${group.name}" 
                    data-day="${day}" 
                    data-time="${time}" 
                    class="schedule-cell"></td>
            `)
        )
    ).join('');
}

function fillSchedule(lessons) {
    lessons.forEach(lesson => {
        const normalizedTime = normalizeTime(lesson.startTime);
        const day = DAY_NUM_TO_NAME[lesson.dayOfWeek];

        const cell = document.querySelector(`td[data-group-id="${lesson.groupId}"][data-day="${day}"][data-time="${normalizedTime}"]`);
        if (cell) {
            const lessonKey = `${lesson.subjectId}-${lesson.teacherId}-${lesson.auditoriumId}-${lesson.lessonType}-${lesson.week}`;
            cell.dataset.lessonKey = lessonKey;
            cell.classList.add(getLessonTypeClass(lesson.lessonType));

            const groupIds = cell.dataset.groupIds ? new Set(cell.dataset.groupIds.split(",")) : new Set();
            groupIds.add(lesson.groupId);
            cell.dataset.groupIds = Array.from(groupIds).join(",");

            cell.innerHTML = `
                <div class="lessonInfo">
                    <span class="subjectName"><strong>${lesson.subjectName}</strong></span>
                    <br>
                    <span class="teacherName">${lesson.teacherName}</span>
                    <br>
                    <span class="auditoriumName">Аудиторія: ${lesson.auditoriumName}</span>
                </div>`;
        }
    });

    mergeAdjacentCells();
}

function mergeAdjacentCells() {
    document.querySelectorAll("tr").forEach(row => {
        let previousCell = null;
        let colspan = 1;
        let groupIds = [];

        row.querySelectorAll("td.schedule-cell").forEach(cell => {
            if (!cell.dataset.lessonKey || !cell.innerHTML.trim()) {
                previousCell = null;
                colspan = 1;
                groupIds = [];
                return;
            }

            if (previousCell && previousCell.dataset.lessonKey === cell.dataset.lessonKey) {
                colspan++;
                previousCell.setAttribute("colspan", colspan);
                groupIds.push(cell.dataset.groupId);
                previousCell.setAttribute("data-group-ids", groupIds.join(","));
                cell.remove();
            } else {
                previousCell = cell;
                colspan = 1;
                groupIds = [cell.dataset.groupId];
                previousCell.setAttribute("data-group-ids", groupIds.join(","));
            }
        });
    });
}

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

function normalizeTime(time) {
    if (typeof time === "string" && time.includes(":")) {
        return time.slice(0, 5);
    }
}

// Data Grouping Function
function groupDataByYearAndProgram(groups) {
    const result = {};
    groups.forEach(group => {
        result[group.year] = result[group.year] || {};
        result[group.year][group.program] = result[group.year][group.program] || [];
        result[group.year][group.program].push(group);
        result[group.year][group.program].sort((a, b) => a.name.localeCompare(b.name, "uk"));
    });
    return result;
}

// UI Element Creation Functions
function createSelect(defaultText, options, selectedValue = null) {
    return `
        <select>
            <option value="">${defaultText}</option>
            ${options.map(opt => {
        const selected = opt.id === selectedValue ? 'selected' : '';
        return `<option value="${opt.id}" ${selected}>${opt.name}</option>`;
    }).join('')}
        </select>
    `;
}

function createCourseDiv(courseIndex) {
    const div = document.createElement("div");
    div.id = `course-${courseIndex + 1}`;
    div.classList.add("hidden");
    return div;
}

function createDayDiv(courseIndex, dayId) {
    const div = document.createElement("div");
    div.id = `day-${dayId + 1}-course-${courseIndex + 1}`;
    div.classList.add("hidden");
    return div;
}

function createProgramDiv(program, day, courseIndex) {
    const div = document.createElement("div");
    div.classList.add("program");
    const translatedProgram = PROGRAM_TRANSLATIONS[program] || program;
    div.innerHTML = `<h3>${translatedProgram} (${day}, ${courseIndex + 1} курс)</h3>`;
    return div;
}

function createLessonDiv(time, groups, courseIndex, programIndex, subjects, teachers, auditoriums, blockNumber) {
    const div = document.createElement("div");
    div.classList.add("lesson-block");

    const filteredGroups = getFilteredGroups(groups, courseIndex, programIndex);

    div.innerHTML = `
        <div class="time">
            <strong>${time}</strong>
            <button class="add-lesson-btn" onclick="addLessonContainer('${time}', this)">+</button>
            <button class="remove-lesson-btn hidden" onclick="removeLesson(this)">-</button>
        </div>
        <div class="groups">${filteredGroups}</div>
        <div class="selects">
            ${createSelects(subjects, teachers, auditoriums)}
            <div class="lesson-type">${createLessonTypeSelect('Оберіть тип заняття')}</div>
        </div>
        <div class="week">${createWeekOptions(time, blockNumber)}</div>
    `;
    return div;
}


function getFilteredGroups(groups, courseIndex, programIndex) {
    return groups
        .filter(group => group.year === courseIndex && group.program === programIndex)
        .map(group => `<label><input type="checkbox" class="group-checkbox" value="${group.id}">${group.name}</label>`)
        .join(" ");
}

function createSelects(subjects, teachers, auditoriums) {
    return `
        <div class="subjects">${createSelect('Оберіть предмет', subjects)}</div>
        <div class="teachers">${createSelect('Оберіть викладача', teachers)}</div>
        <div class="auditoriums">${createSelect('Оберіть аудиторію', auditoriums)}</div>
    `;
}

function createWeekOptions(time, blockNumber) {
    return `
        <label><input type="radio" name="week-${time}-block-${blockNumber}" value="Both"> Обидва тижні</label>
        <label><input type="radio" name="week-${time}-block-${blockNumber}" value="Odd"> Непарний</label>
        <label><input type="radio" name="week-${time}-block-${blockNumber}" value="Even"> Парний</label>
    `;
}



async function addLesson(lessons) {
    try {
        for (const lesson of lessons) {
            //// Перевірка наявності уроку перед додаванням
            //await checkLessonAvailability(lesson);

            // Відправка запиту на створення уроку
            await sendCreateRequest('Lessons', lesson);
        }

        //await updateEntityData('Lessons'); // Оновлення даних
        //resetForm('Lessons'); // Скидання форми після збереження уроків
    } catch (error) {
        console.error("Помилка при додаванні уроків:", error);
    }
}

async function sendCreateRequest(entity, body) {
    const response = await fetch(`api/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        await handleResponseError(response);
    } else {
        console.log(`${entity} successfully added.`);
    }
}

async function updateLesson(lesson) {
    try {
        const response = await fetch(`/api/lessons/${lesson.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lesson),
        });

        if (!response.ok) {
            await handleResponseError(response);
        } else {
            console.log("Lesson successfully updated.");
        }
    } catch (error) {
        console.error("Помилка при оновленні уроку:", error);
    }
}

async function deleteLesson(lessonId) {

    try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            await generateTable();
            initializeModal();
            closeModalWindow(document.getElementById("modal"));
        } else {
            console.error("Помилка при видаленні уроку", response.status);
        }
    } catch (error) {
        console.error("Помилка при видаленні:", error);
    }
}


async function handleResponseError(response) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
}