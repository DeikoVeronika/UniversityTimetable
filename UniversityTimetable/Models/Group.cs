using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UniversityTimetable.Models;

public enum Year
{
    First,
    Second,
    Third,
    Fourth
}

public enum Program
{
    AppliedMath,
    SystemAnalysis,
    Informatics,
    SoftwareEngineering
}

public partial class Group
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }
    public Year Year { get; set; }
    public Program Program { get; set; }

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
