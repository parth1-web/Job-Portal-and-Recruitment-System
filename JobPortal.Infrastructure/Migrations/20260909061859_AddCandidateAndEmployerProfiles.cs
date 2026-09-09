using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateAndEmployerProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_candidate_skills_candidates_CandidateId",
                table: "candidate_skills");

            migrationBuilder.DropForeignKey(
                name: "FK_candidates_Users_UserId",
                table: "candidates");

            migrationBuilder.DropForeignKey(
                name: "FK_employers_Users_UserId",
                table: "employers");

            migrationBuilder.DropForeignKey(
                name: "FK_employers_companies_CompanyId",
                table: "employers");

            migrationBuilder.DropForeignKey(
                name: "FK_job_applications_candidates_CandidateId",
                table: "job_applications");

            migrationBuilder.DropForeignKey(
                name: "FK_jobs_employers_EmployerId",
                table: "jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_resumes_candidates_CandidateId",
                table: "resumes");

            migrationBuilder.DropForeignKey(
                name: "FK_saved_jobs_candidates_CandidateId",
                table: "saved_jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_roles_RoleId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_employers",
                table: "employers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_candidates",
                table: "candidates");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "employers");

            migrationBuilder.RenameTable(
                name: "employers",
                newName: "Employers");

            migrationBuilder.RenameTable(
                name: "candidates",
                newName: "Candidates");

            migrationBuilder.RenameIndex(
                name: "IX_employers_UserId",
                table: "Employers",
                newName: "IX_Employers_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_employers_CompanyId",
                table: "Employers",
                newName: "IX_Employers_CompanyId");

            migrationBuilder.RenameColumn(
                name: "ProfileImageUrl",
                table: "Candidates",
                newName: "ResumeUrl");

            migrationBuilder.RenameIndex(
                name: "IX_candidates_UserId",
                table: "Candidates",
                newName: "IX_Candidates_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "CompanyId",
                table: "Employers",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "CompanyDescription",
                table: "Employers",
                type: "character varying(3000)",
                maxLength: 3000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyLogoUrl",
                table: "Employers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Employers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Industry",
                table: "Employers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Employers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Employers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalTitle",
                table: "Candidates",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Employers",
                table: "Employers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Candidates",
                table: "Candidates",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_candidate_skills_Candidates_CandidateId",
                table: "candidate_skills",
                column: "CandidateId",
                principalTable: "Candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Candidates_Users_UserId",
                table: "Candidates",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Employers_Users_UserId",
                table: "Employers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Employers_companies_CompanyId",
                table: "Employers",
                column: "CompanyId",
                principalTable: "companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_job_applications_Candidates_CandidateId",
                table: "job_applications",
                column: "CandidateId",
                principalTable: "Candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_jobs_Employers_EmployerId",
                table: "jobs",
                column: "EmployerId",
                principalTable: "Employers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_resumes_Candidates_CandidateId",
                table: "resumes",
                column: "CandidateId",
                principalTable: "Candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_saved_jobs_Candidates_CandidateId",
                table: "saved_jobs",
                column: "CandidateId",
                principalTable: "Candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_candidate_skills_Candidates_CandidateId",
                table: "candidate_skills");

            migrationBuilder.DropForeignKey(
                name: "FK_Candidates_Users_UserId",
                table: "Candidates");

            migrationBuilder.DropForeignKey(
                name: "FK_Employers_Users_UserId",
                table: "Employers");

            migrationBuilder.DropForeignKey(
                name: "FK_Employers_companies_CompanyId",
                table: "Employers");

            migrationBuilder.DropForeignKey(
                name: "FK_job_applications_Candidates_CandidateId",
                table: "job_applications");

            migrationBuilder.DropForeignKey(
                name: "FK_jobs_Employers_EmployerId",
                table: "jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_resumes_Candidates_CandidateId",
                table: "resumes");

            migrationBuilder.DropForeignKey(
                name: "FK_saved_jobs_Candidates_CandidateId",
                table: "saved_jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_roles_RoleId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Employers",
                table: "Employers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Candidates",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "CompanyDescription",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "CompanyLogoUrl",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "Industry",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Employers");

            migrationBuilder.DropColumn(
                name: "ProfessionalTitle",
                table: "Candidates");

            migrationBuilder.RenameTable(
                name: "Employers",
                newName: "employers");

            migrationBuilder.RenameTable(
                name: "Candidates",
                newName: "candidates");

            migrationBuilder.RenameIndex(
                name: "IX_Employers_UserId",
                table: "employers",
                newName: "IX_employers_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Employers_CompanyId",
                table: "employers",
                newName: "IX_employers_CompanyId");

            migrationBuilder.RenameColumn(
                name: "ResumeUrl",
                table: "candidates",
                newName: "ProfileImageUrl");

            migrationBuilder.RenameIndex(
                name: "IX_Candidates_UserId",
                table: "candidates",
                newName: "IX_candidates_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<int>(
                name: "CompanyId",
                table: "employers",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "employers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_employers",
                table: "employers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_candidates",
                table: "candidates",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_candidate_skills_candidates_CandidateId",
                table: "candidate_skills",
                column: "CandidateId",
                principalTable: "candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_candidates_Users_UserId",
                table: "candidates",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_employers_Users_UserId",
                table: "employers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_employers_companies_CompanyId",
                table: "employers",
                column: "CompanyId",
                principalTable: "companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_job_applications_candidates_CandidateId",
                table: "job_applications",
                column: "CandidateId",
                principalTable: "candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_jobs_employers_EmployerId",
                table: "jobs",
                column: "EmployerId",
                principalTable: "employers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_resumes_candidates_CandidateId",
                table: "resumes",
                column: "CandidateId",
                principalTable: "candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_saved_jobs_candidates_CandidateId",
                table: "saved_jobs",
                column: "CandidateId",
                principalTable: "candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
