﻿using System;
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
            //if (!LessonTimes.AvailableTimes.Contains(lesson.StartTime))
            //{
            //    return BadRequest("Недопустиме значення часу початку.");
            //}
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
            return await IsResourceAvailable(
                auditoriumId: auditoriumId,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                week: week,
                lessonId: lessonId,
                semesterId: semesterId,
                isTeacherCheck: false
            );
        }

        [HttpGet("IsTeacherAvailable")]
        public async Task<bool> IsTeacherAvailable(Guid teacherId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId)
        {
            return await IsResourceAvailable(
                auditoriumId: teacherId,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                week: week,
                lessonId: lessonId,
                semesterId: semesterId,
                isTeacherCheck: true
            );
        }

        private async Task<bool> IsResourceAvailable(Guid auditoriumId, DayOfWeek dayOfWeek, string startTime, WeekType week, Guid? lessonId, Guid semesterId, bool isTeacherCheck)
        {
            var timeSpan = TimeSpan.Parse(startTime);
            var query = _context.Lessons.AsQueryable();

            if (isTeacherCheck)
            {
                query = query.Where(l => l.TeacherId == auditoriumId);
            }
            else
            {
                query = query.Where(l => l.AuditoriumId == auditoriumId);
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
