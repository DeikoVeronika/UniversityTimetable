using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UniversityTimetable.Models;

public partial class Group
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }
}
