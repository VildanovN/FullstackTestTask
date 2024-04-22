using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Data.Dto
{
    public class EmployeeCreateDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        public string Department { get; set; }

        [Required]
        public DateTime BirthDate { get; set; }

        [Required]
        public DateTime EmployeeDate { get; set; }

        [Required]
        public int Salary { get; set; }
    }
}
