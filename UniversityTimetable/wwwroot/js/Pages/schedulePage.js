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
    const [groups, programs] = await fetchData();
    const groupsByYearAndProgram = groupDataByYearAndProgram(groups);
    const sortedYears = Object.keys(groupsByYearAndProgram).sort((a, b) => a - b);
    tableBody.innerHTML = generateTableHTML(sortedYears, groupsByYearAndProgram, programs);
}

async function fetchData() {
    return Promise.all([
        fetch("/api/groups").then(res => res.json()),
        fetch("/api/enums/program").then(res => res.json())
    ]);
}

function createLessonTypeSelect() {
    const lessonTypes = [
        { value: "Lecture", text: "Лекція" },
        { value: "Practice", text: "Практика" },
        { value: "Consultation", text: "Консультація" },
        { value: "Seminar", text: "Семінар" },
        { value: "Lab", text: "Лабораторна" }
    ];

    return `
        <select id="lesson-type">
            ${lessonTypes.map(type => `<option value="${type.value}">${type.text}</option>`).join("")}
        </select>
    `;
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
function addLesson(time, btn) {
    const lessonDiv = btn.closest(".lesson-block");
    const newLessonDiv = lessonDiv.cloneNode(true);
    newLessonDiv.querySelector(".add-lesson-btn").remove();
    newLessonDiv.querySelector(".remove-lesson-btn").classList.remove("hidden");
    resetLessonInputs(newLessonDiv);
    lessonDiv.parentNode.insertBefore(newLessonDiv, lessonDiv.nextSibling);
}

function removeLesson(btn) {
    btn.closest(".lesson-block").remove();
}

function resetLessonInputs(lessonDiv) {
    lessonDiv.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
    lessonDiv.querySelectorAll(".group-checkbox").forEach(checkbox => checkbox.checked = false);
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

function endSelection(modal, modalInfo, saveLesson) {
    isSelecting = false;
    if (selectedCells.length === 0) return;

    const uniqueDays = new Set();
    const uniqueTimes = new Set();
    const uniqueGroups = new Set();

    selectedCells.forEach(cell => {
        uniqueDays.add(cell.getAttribute("data-day"));
        uniqueTimes.add(cell.getAttribute("data-time"));
        uniqueGroups.add(cell.getAttribute("data-group"));
    });

    if (uniqueDays.size !== 1 || uniqueTimes.size !== 1) {
        alert("Оберіть лише клітинки одного часу та дня.");
        clearSelection();
        return;
    }

    const day = [...uniqueDays][0];
    const time = [...uniqueTimes][0];
    const groups = [...uniqueGroups].join(", ");

    modal.style.display = "block";
    modalInfo.innerHTML = `<strong>${day}, ${time}</strong><br>Групи: ${groups}`;
    loadModalOptions(saveLesson);
}

async function loadModalOptions(saveLesson) {
    const apiEndpoints = ["/api/subjects", "/api/teachers", "/api/auditoriums"];
    try {
        const [subjects, teachers, auditoriums] = await Promise.all(
            apiEndpoints.map(url => fetch(url).then(res => res.ok ? res.json() : Promise.reject(`Помилка запиту: ${url}`)))
        );

        const modalSelects = document.getElementById("modal-selects");
        modalSelects.innerHTML = `
            <div class="selects">
                <div class="subjects">${createSelect('Оберіть предмет', subjects)}</div>
                <div class="teachers">${createSelect('Оберіть викладача', teachers)}</div>
                <div class="auditoriums">${createSelect('Оберіть аудиторію', auditoriums)}</div>
                <div class="lesson-type">
                    ${createLessonTypeSelect()}
                </div>
            </div>
            <div class="week">
                <label><input type="radio" name="week-type" value="Both" checked> Обидва</label>
                <label><input type="radio" name="week-type" value="Odd"> Непарний</label>
                <label><input type="radio" name="week-type" value="Even"> Парний</label>
            </div>
        `;

        saveLesson.onclick = () => saveSelection();
    } catch (error) {
        console.error("Помилка при отриманні даних:", error);
    }
}

function saveSelection() {
    const selectedSubject = document.querySelector(".subjects select").value;
    const selectedTeacher = document.querySelector(".teachers select").value;
    const selectedAuditorium = document.querySelector(".auditoriums select").value;

    selectedCells.forEach(cell => {
        cell.textContent = `${selectedSubject}, ${selectedTeacher}, ${selectedAuditorium}`;
    });

    closeModalWindow(document.getElementById("modal"));
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
        TIME_SLOTS.map((time, index) => `
            <tr>
                ${index === 0 ? `<td rowspan="${TIME_SLOTS.length}">${day}</td>` : ''}
                <td>${time}</td>
                ${generateTableCells(sortedYears, groupsByYearAndProgram, day, time)}
            </tr>
        `).join('')
    ).join('');
}

function generateTableCells(sortedYears, groupsByYearAndProgram, day, time) {
    return sortedYears.flatMap(year =>
        Object.values(groupsByYearAndProgram[year]).flatMap(programGroups =>
            programGroups.map(group => `
                <td data-group="${group.name}" data-day="${day}" data-time="${time}" class="schedule-cell"></td>
            `)
        )
    ).join('');
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
function createSelect(defaultText, options) {
    return `<select><option value="">${defaultText}</option>${options.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('')}</select>`;
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

function createLessonDiv(time, groups, courseIndex, programIndex, subjects, teachers, auditoriums) {
    const div = document.createElement("div");
    div.classList.add("lesson-block");

    const filteredGroups = groups
        .filter(group => group.year === courseIndex && group.program === programIndex)
        .map(group => `<label><input type="checkbox" class="group-checkbox" value="${group.id}">${group.name}</label>`)
        .join(" ");

    div.innerHTML = `
        <div class="time">
            <strong>${time}</strong>
            <button class="add-lesson-btn" onclick="addLesson('${time}', this)">+</button>
            <button class="remove-lesson-btn hidden" onclick="removeLesson(this)">-</button>
        </div>
        <div class="groups">${filteredGroups}</div>
        <div class="selects">
            <div class="subjects">${createSelect('Оберіть предмет', subjects)}</div>
            <div class="teachers">${createSelect('Оберіть викладача', teachers)}</div>
            <div class="auditoriums">${createSelect('Оберіть аудиторію', auditoriums)}</div>
            <div class="lesson-type">
                ${createLessonTypeSelect()}
            </div>
        </div>
        <div class="week">
            <label><input type="radio" name="week-${time}" value="Both" checked> Обидва тижні</label>
            <label><input type="radio" name="week-${time}" value="Odd"> Непарний</label>
            <label><input type="radio" name="week-${time}" value="Even"> Парний</label>
        </div>
    `;
    return div;
}