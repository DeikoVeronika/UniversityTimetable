using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniversityTimetable.Models;

[Route("api/[controller]")]
[ApiController]
public class ScheduleController : ControllerBase
{
    private readonly UniversityTimetableContext _context;

    public ScheduleController(UniversityTimetableContext context)
    {
        _context = context;
    }

    ///api/schedule/export

    [HttpGet("export")]
    public async Task<IActionResult> ExportSchedule()
    {
        var lessons = await _context.Lessons
            .Include(l => l.Group)
            .Include(l => l.Subject)
            .Include(l => l.Teacher)
            .Include(l => l.Auditorium)
            .OrderBy(l => l.DayOfWeek)
            .ThenBy(l => l.StartTime)
            .ToListAsync();

        var fileContent = GenerateScheduleExcel(lessons);
        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Schedule.xlsx");
    }

    private byte[] GenerateScheduleExcel(List<Lesson> lessons)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        using (var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add("Schedule");

            worksheet.Cells[1, 1].Value = "Day";
            worksheet.Cells[1, 2].Value = "Time";

            var groups = lessons.Select(l => l.Group).Distinct().OrderBy(g => g?.Name).ToList();

            int col = 3;
            foreach (var group in groups)
            {
                worksheet.Cells[1, col].Value = group?.Year; 
                worksheet.Cells[2, col].Value = group?.Program; 
                worksheet.Cells[3, col].Value = group?.Name; 
                col++;
            }

            var schedule = lessons
                .GroupBy(l => new { l.DayOfWeek, l.StartTime })
                .OrderBy(g => g.Key.DayOfWeek)
                .ThenBy(g => g.Key.StartTime)
                .ToList();

            int row = 4;
            string currentDay = string.Empty; 

            foreach (var lessonGroup in schedule)
            {
                var dayOfWeek = lessonGroup.Key.DayOfWeek.ToString();
                var startTime = lessonGroup.Key.StartTime.ToString(@"hh\:mm");

                if (dayOfWeek != currentDay)
                {
                    worksheet.Cells[row, 1].Value = dayOfWeek;
                    currentDay = dayOfWeek;
                }

                worksheet.Cells[row, 2].Value = startTime;

                col = 3;
                foreach (var group in groups)
                {
                    var lesson = lessonGroup.FirstOrDefault(l => l.GroupId == group?.Id);
                    if (lesson != null)
                    {
                        worksheet.Cells[row, col].Value =
                            $"{lesson.Subject?.Name}\n{lesson.Teacher?.Name}\n{lesson.Auditorium?.Name}";
                    }
                    col++;
                }
                row++;
            }

            int lastColumn = col - 1;

            MergeDayCells(worksheet, row);           
            MergeCellsYearRow(worksheet, lastColumn);
            MergeCellsProgramRow(worksheet, lastColumn);

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }
    }


    private void MergeDayCells(ExcelWorksheet worksheet, int lastRow)
    {
        int startMergeRow = 4;
        for (int i = 4; i <= lastRow; i++)
        {
            if (worksheet.Cells[i, 1].Text != worksheet.Cells[i + 1, 1].Text || i == lastRow)
            {
                if (startMergeRow != i)
                {
                    worksheet.Cells[startMergeRow, 1, i, 1].Merge = true;
                }
                startMergeRow = i + 1;
            }
        }
    }

    private void MergeCellsYearRow(ExcelWorksheet worksheet, int lastColumn)
    {
        int startMergeCol = 3;  
        string previousValue = worksheet.Cells[1, startMergeCol].Text;

        for (int col = startMergeCol + 1; col <= lastColumn; col++)
        {
            string currentValue = worksheet.Cells[1, col].Text;

            if (previousValue == currentValue)
            {
                worksheet.Cells[1, startMergeCol, 1, col].Merge = true;
            }
            else
            {
                startMergeCol = col;
            }

            previousValue = currentValue;
        }
    }

    private void MergeCellsProgramRow(ExcelWorksheet worksheet, int lastColumn)
    {
        int startMergeCol = 3; 
        string previousValue = worksheet.Cells[2, startMergeCol].Text;

        for (int col = startMergeCol + 1; col <= lastColumn; col++)
        {
            string currentValue = worksheet.Cells[2, col].Text;

            if (previousValue == currentValue)
            {
                worksheet.Cells[2, startMergeCol, 2, col].Merge = true;
            }
            else
            {
                startMergeCol = col;
            }

            previousValue = currentValue;
        }
    }



}

