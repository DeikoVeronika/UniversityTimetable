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

        // GET: api/Lessons
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetLessons()
        {
            var lessons = await _context.Lessons
                .Include(l => l.Group)      
                .Include(l => l.Subject)   
                .Include(l => l.Teacher)   
                .ToListAsync();

            // Перетворюємо на DTO (Data Transfer Object), щоб повернути лише необхідні дані
            var lessonDtos = lessons.Select(lesson => new
            {
                lesson.Id,
                GroupName = lesson.Group.Name,
                SubjectName = lesson.Subject.Name,
                TeacherName = lesson.Teacher.Name,
                DayOfWeek = lesson.DayOfWeek,
                StartTime = lesson.StartTime.ToString(@"hh\:mm"),
                IsEvenWeek = lesson.IsEvenWeek
            }).ToList();

            return Ok(lessonDtos);
        }


        // GET: api/Lessons/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);

            if (lesson == null)
            {
                return NotFound();
            }

            return lesson;
        }

        // PUT: api/Lessons/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLesson(int id, Lesson lesson)
        {
            if (id != lesson.Id)
            {
                return BadRequest();
            }

            _context.Entry(lesson).State = EntityState.Modified;

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
        public async Task<IActionResult> DeleteLesson(int id)
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

        private bool LessonExists(int id)
        {
            return _context.Lessons.Any(e => e.Id == id);
        }
    }
}
