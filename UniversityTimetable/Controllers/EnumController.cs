using Microsoft.AspNetCore.Mvc;
using UniversityTimetable.Models;

namespace UniversityTimetable.Controllers;

[ApiController]
[Route("api/enums")]
public class EnumController : ControllerBase
{
    [HttpGet("year")]
    public IActionResult GetYears()
    {
        var years = Enum.GetNames(typeof(Year));
        return Ok(years);
    }

    [HttpGet("program")]
    public IActionResult GetPrograms()
    {
        var programs = Enum.GetNames(typeof(UniversityTimetable.Models.Program));
        return Ok(programs);
    }
}
