using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Server.Data.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;

namespace Server.App.Controllers
{
    [ApiController]
    [Route("api/employee")]
    public class EmployeeController
    {
        private string _connectionString = "Server=(localdb)\\mssqllocaldb;Database=testTaskDb;Trusted_Connection=True;";

        [HttpGet]
        public async Task<string> Get()
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sqlExpression = "SELECT * FROM dbo.EmployeeTable FOR JSON auto;";

                SqlCommand command = new SqlCommand(sqlExpression, connection);
                SqlDataReader reader = await command.ExecuteReaderAsync();
                var jsonResult = new StringBuilder();

                if (!reader.HasRows)
                {
                    jsonResult.Append("[]");
                }
                else
                {
                    while (await reader.ReadAsync())
                    {
                        jsonResult.Append(reader.GetValue(0).ToString());
                    }
                }

                return jsonResult.ToString();
            }
            return "";
        }

        [HttpPost]
        [Route("create")]
        public async Task Create([Required][FromBody] EmployeeCreateDto body)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sqlIdExpression = "SELECT MAX(Id) FROM dbo.EmployeeTable;";
                SqlCommand idCommand = new SqlCommand(sqlIdExpression, connection);
                int id = (int)idCommand.ExecuteScalar();

                StringBuilder sb = new StringBuilder();
                sb.Append("INSERT INTO dbo.EmployeeTable(Id, Department, FullName, BirthDate, EmployeeDate, Salary) VALUES (");
                sb.Append($"'{id + 1}', ");
                sb.Append($"'{body.Department}', ");
                sb.Append($"'{body.FullName}', ");
                sb.Append($"'{body.BirthDate.ToString("yyyy-MM-dd")}', ");
                sb.Append($"'{body.EmployeeDate.ToString("yyyy-MM-dd")}', ");
                sb.Append($"'{body.Salary}'");
                sb.Append(");");

                string sqlExpression = sb.ToString();

                SqlCommand command = new SqlCommand(sqlExpression, connection);
                await command.ExecuteNonQueryAsync();
            }
        }

        [HttpPost]
        [Route("update")]
        public async Task Update([Required][FromBody] EmployeeDto body)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sqlExpression = $"SELECT * FROM dbo.EmployeeTable WHERE Id = '{body.Id}'";
                SqlCommand command = new SqlCommand(sqlExpression, connection);
                SqlDataReader reader = await command.ExecuteReaderAsync();

                string sqlUpdateExpression = string.Empty;

                if (!reader.HasRows)
                {
                    return;
                }
                else
                {
                    while (await reader.ReadAsync())
                    {
                        StringBuilder sb = new StringBuilder();
                        sb.Append("UPDATE dbo.EmployeeTable SET ");
                        sb.Append($"Department = '{body.Department}', ");
                        sb.Append($"FullName = '{body.FullName}', ");
                        sb.Append($"BirthDate = '{body.BirthDate.ToString("yyyy-MM-dd")}', ");
                        sb.Append($"EmployeeDate = '{body.EmployeeDate.ToString("yyyy-MM-dd")}', ");
                        sb.Append($"Salary = '{body.Salary}' ");
                        sb.Append($"WHERE Id = '{body.Id}';");
                        
                        sqlUpdateExpression = sb.ToString();
                    }
                }

                reader.Close();

                SqlCommand updateCommand = new SqlCommand(sqlUpdateExpression, connection);
                await updateCommand.ExecuteNonQueryAsync();
            }
        }

        [HttpDelete]
        [Route("delete/{id}")]
        public async Task Delete([Required][FromRoute] int id)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sqlExpression = $"DELETE FROM dbo.EmployeeTable WHERE Id = '{id}'";
                SqlCommand command = new SqlCommand(sqlExpression, connection);
                await command.ExecuteNonQueryAsync();
            }
        }
    }
}