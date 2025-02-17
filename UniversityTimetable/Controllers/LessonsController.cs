using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniversityTimetable.Constants;
using UniversityTimetable.Models;

namespace UniversityTimetable.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly UniversityTimetableContext _context;

        public LessonsController(UniversityTimetableContext context)
        {
            _context = context;
        }

        [HttpGet("check-lesson")]
        public async Task<IActionResult> CheckLesson([FromQuery] string day, [FromQuery] string time, [FromQuery] List<string> groups)
        {
            if (!Enum.TryParse<DayOfWeek>(day, out var parsedDay))
            {
                return BadRequest("Невірний день тижня");
            }

            if (!TimeSpan.TryParse(time, out var parsedTime))
            {
                return BadRequest("Невірний час. Використовуйте формат 'HH:mm'");
            }

            var lesson = await _context.Lessons
                .Where(l => l.DayOfWeek == parsedDay && l.StartTime == parsedTime && groups.Contains(l.GroupId.ToString()))
                .FirstOrDefaultAsync();

            if (lesson == null)
            {
                return Ok(new { exists = false });
            }

            return Ok(new
            {
                exists = true,
                subjectId = lesson.SubjectId,
                teacherId = lesson.TeacherId,
                auditoriumId = lesson.AuditoriumId,
                lessonType = lesson.LessonType.ToString(),
                week = lesson.Week.ToString(),
                id = lesson.Id // Додаємо id до відповіді
            });


        }

        // GET: api/Lessons
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetLessons()
        {
            var lessons = await _context.Lessons
                .Include(l => l.Group)
                .Include(l => l.Subject)
                .Include(l => l.Teacher)
                .Include(l => l.Auditorium)
                .Include(l => l.Semester)
                .ToListAsync();

            var lessonDtos = lessons.Select(lesson => new
            {
                lesson.Id,
                GroupId = lesson.Group.Id,
                GroupName = lesson.Group.Name,
                SubjectId = lesson.Subject.Id,
                SubjectName = lesson.Subject.Name,
                AuditoriumId = lesson.Auditorium.Id,
                AuditoriumName = lesson.Auditorium.Name,
                TeacherId = lesson.Teacher.Id,
                TeacherName = lesson.Teacher.Name,
                SemesterId = lesson.Semester.Id,
                SemesterName = lesson.Semester.Name,
                DayOfWeek = lesson.DayOfWeek,
                StartTime = lesson.StartTime.ToString(@"hh\:mm"),
                Week = lesson.Week,
                LessonType = lesson.LessonType
            }).ToList();

            return Ok(lessonDtos);
        }


        // GET: api/Lessons/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetLesson(Guid id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Group)
                .Include(l => l.Subject)
                .Include(l => l.Teacher)
                .Include(l => l.Auditorium)
                .Include(l => l.Semester)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                lesson.Id,
                GroupId = lesson.Group.Id,
                SubjectId = lesson.Subject.Id,
                TeacherId = lesson.Teacher.Id,
                AuditoriumId = lesson.Auditorium.Id,
                SemesterId = lesson.Semester.Id,
                DayOfWeek = lesson.DayOfWeek,
                StartTime = lesson.StartTime.ToString(@"hh\:mm"),
                Week = lesson.Week,
                LessonType = lesson.LessonType
            });
        }

        // PUT: api/Lessons/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLesson(Guid id, [FromBody] Lesson lesson)
        {
            if (id != lesson.Id)
            {
                return BadRequest();
            }

            var existingLesson = await _context.Lessons.FindAsync(id);
            if (existingLesson == null)
            {
                return NotFound();
            }

            existingLesson.GroupId = lesson.GroupId;
            existingLesson.SubjectId = lesson.SubjectId;
            existingLesson.TeacherId = lesson.TeacherId;
            existingLesson.AuditoriumId = lesson.AuditoriumId;
            existingLesson.SemesterId = lesson.SemesterId;
            existingLesson.DayOfWeek = lesson.DayOfWeek;
            existingLesson.StartTime = lesson.StartTime;
            existingLesson.Week = lesson.Week;
            existingLesson.LessonType = lesson.LessonType;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LessonExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Lessons
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Lesson>> PostLesson(Lesson lesson)
        {
            if (lesson.Id == Guid.Empty)
            {
                lesson.Id = Guid.NewGuid(); 
            }

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLesson", new { id = lesson.Id }, lesson);
        }

        // DELETE: api/Lessons/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLesson(Guid id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LessonExists(Guid id)
        {
            return _context.Lessons.Any(e => e.Id == id);
        }

        [HttpGet("IsAuditoriumAvailable")]
        public async Task<bool> IsAuditoriumAvailable(Guid auditoriumId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId)
        {
            return await CheckResourceAvailability(auditoriumId, dayOfWeek, startTime, week, lessonId, semesterId, false);
        }

        [HttpGet("IsTeacherAvailable")]
        public async Task<bool> IsTeacherAvailable(Guid teacherId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId)
        {
            return await CheckResourceAvailability(teacherId, dayOfWeek, startTime, week, lessonId, semesterId, true);
        }

        [HttpGet("IsGroupAvailable")]
        public async Task<bool> IsGroupAvailable(Guid groupId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId)
        {
            return await CheckResourceAvailability(groupId, dayOfWeek, startTime, week, lessonId, semesterId, false, true);
        }

        private async Task<bool> CheckResourceAvailability(Guid resourceId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId, bool isTeacherCheck, bool isGroupCheck = false)
        {
            var timeSpan = TimeSpan.Parse(startTime);
            var query = _context.Lessons.AsQueryable();

            if (isTeacherCheck)
            {
                query = query.Where(l => l.TeacherId == resourceId);
            }
            else if (isGroupCheck)
            {
                query = query.Where(l => l.GroupId == resourceId);
            }
            else
            {
                query = query.Where(l => l.AuditoriumId == resourceId);
            }

            return !await query
                .AnyAsync(l =>
                    l.SemesterId == semesterId &&
                    l.DayOfWeek == dayOfWeek &&
                    l.StartTime == timeSpan &&
                    (lessonId == null || l.Id != lessonId) &&
                    (
                        (l.Week == WeekType.Both) ||
                        (l.Week == week) ||
                        (week == WeekType.Both && (l.Week == WeekType.Even || l.Week == WeekType.Odd))
                    )
                );
        }



    }
}
