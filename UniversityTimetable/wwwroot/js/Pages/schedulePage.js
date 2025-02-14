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

document.addEventListener("DOMContentLoaded", () => {
    generateTable();
    generateSchedule();
});

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

function createSelect(defaultText, options) {
    return `<select><option value="">${defaultText}</option>${options.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join('')}</select>`;
}

async function generateTable() {
    const tableBody = document.getElementById("table-body");
    const [groups, programs] = await Promise.all([
        fetch("/api/groups").then(res => res.json()),
        fetch("/api/enums/program").then(res => res.json())
    ]);

    const groupsByYearAndProgram = groupDataByYearAndProgram(groups);
    const sortedYears = Object.keys(groupsByYearAndProgram).sort((a, b) => a - b);

    tableBody.innerHTML = generateTableHTML(sortedYears, groupsByYearAndProgram, programs);
}

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


function generateTableHTML(sortedYears, groupsByYearAndProgram, programs) {
    let tableHTML = `<tr><td colspan="2" rowspan="3"></td>`; // Об'єднання верхнього лівого кута

    // Заголовки курсів
    tableHTML += sortedYears.map(year => {
        const totalGroups = Object.values(groupsByYearAndProgram[year]).flat().length;
        return `<td colspan="${totalGroups}">${parseInt(year) + 1} курс</td>`;
    }).join('');
    tableHTML += `</tr><tr>`; // Закриття першого рядка

    // Заголовки груп
    tableHTML += sortedYears.map(year =>
        Object.values(groupsByYearAndProgram[year]).map(programGroups =>
            programGroups.map(group => `<td>${group.name}</td>`).join("")
        ).join("")
    ).join('');
    tableHTML += `</tr><tr>`; // Закриття другого рядка

    // Заголовки програм
    tableHTML += sortedYears.map(year =>
        Object.entries(groupsByYearAndProgram[year]).map(([programId, programGroups]) => {
            const programName = programs[programId];
            const translatedProgram = PROGRAM_TRANSLATIONS[programName] || "Невідома програма";
            return `<td colspan="${programGroups.length}">${translatedProgram}</td>`;
        }).join("")
    ).join('');
    tableHTML += `</tr>`;

    // Генерація розкладу
    tableHTML += DAYS_OF_WEEK.map(day =>
        `<tr><td rowspan="${TIME_SLOTS.length}">${day}</td><td>${TIME_SLOTS[0]}</td>` +
        sortedYears.map(year =>
            Object.values(groupsByYearAndProgram[year]).map(programGroups =>
                "<td></td>".repeat(programGroups.length)
            ).join("")
        ).join("") +
        `</tr>` +
        TIME_SLOTS.slice(1).map(time =>
            `<tr><td>${time}</td>` +
            sortedYears.map(year =>
                Object.values(groupsByYearAndProgram[year]).map(programGroups =>
                    "<td></td>".repeat(programGroups.length)
                ).join("")
            ).join("") +
            `</tr>`
        ).join("")
    ).join("");

    return tableHTML;
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
        <strong>${time}</strong> ${filteredGroups} <br>
        ${createSelect('Оберіть предмет', subjects)}
        ${createSelect('Оберіть викладача', teachers)}
        ${createSelect('Оберіть аудиторію', auditoriums)}
        <button class="add-lesson-btn" onclick="addLesson('${time}', this)">+</button>
        <button class="remove-lesson-btn hidden" onclick="removeLesson(this)">-</button>
    `;
    return div;
}

        //фільтрувати за групами та програмами