using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClinicManagementSystem.DataAccess.Models;
using ClinicManagementSystem.Business.DTOs;

namespace ClinicManagementSystem.Business.Services
{
    public class SpecializationService
    {
        private readonly ClinicDbContext _context;

        public SpecializationService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<SpecializationDTO> GetAll()
        {

            var Specializations = _context.Specializations
                .Select(s => new SpecializationDTO
                {
                    SpecializationID = s.SpecializationId,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();

            return Specializations;
        }

        public SpecializationDTO? GetById(int ID)
        {
            var specialization = _context.Specializations
                .Where(s => s.SpecializationId == ID)
                .Select(s => new SpecializationDTO
                {
                    SpecializationID = s.SpecializationId,
                    Name = s.Name,
                    Description = s.Description
                })
                .FirstOrDefault();

            return specialization;
        }

        public int Add(AddSpecializationDTO dto)
        {
            

            bool nameExists = _context.Specializations
                .Any(s => s.Name == dto.Name);

            if (nameExists)
            {
                throw new InvalidOperationException("Specialization Already Exists");
            }
            var specialization = new Specialization
            {
                Name = dto.Name,
                Description = dto.Description
            };
            _context.Specializations.Add(specialization);

            _context.SaveChanges();
            return specialization.SpecializationId;
        }

        public bool Update(int id, UpdateSpecializationDTO dto)
        {
            Specialization? specialization = _context.Specializations.Find(id);

            if (specialization == null)
                return false;
            bool nameExists = _context.Specializations
                .Any(s => s.Name == dto.Name && s.SpecializationId != id);

            if (nameExists)
            {
                throw new InvalidOperationException("Specialization Already Exists");
            }
            specialization.Name = dto.Name;
            specialization.Description = dto.Description;

            _context.SaveChanges();

            return true;
        }

        public bool Delete(int id)
        {
            Specialization? specialization = _context.Specializations.Find(id);

            if (specialization == null)
            {
                return false;
            }

            _context.Specializations.Remove(specialization);
            _context.SaveChanges();

            return true;
        }
    }
}
