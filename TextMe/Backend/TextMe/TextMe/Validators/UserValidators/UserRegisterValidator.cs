using FluentValidation;
using TextMe.DTOs;

namespace TextMe.Validators.UserValidators;

public class UserRegisterValidator : AbstractValidator<RegisterRequestDTO>
{
    public UserRegisterValidator()
    {
        RuleFor(u => u.UserName)
            .NotEmpty().WithMessage("Username required!")
            .MaximumLength(100).WithMessage("Username cannot exceed 100 characters!");

        RuleFor(u => u.FirstName)
            .NotEmpty().WithMessage("First name required!")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters!");

        RuleFor(u => u.LastName)
            .NotEmpty().WithMessage("Last name required!")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters!");

        RuleFor(u => u.Email)
            .NotEmpty().WithMessage("Email required!")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required!")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long!")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters!");

        RuleFor(x => x.ConfirmPassword)
           .NotEmpty().WithMessage("Confirmed Password required!")
           .Equal(x => x.Password).WithMessage("Passwords do not match!");

        RuleFor(x => x.AvatarUrl)
    .Must(file => file == null ||
                 new[] { ".png", ".jpg", ".jpeg" }
                 .Contains(Path.GetExtension(file.FileName).ToLower()))
    .WithMessage("Можно загружать только PNG или JPEG файлы");
    }
}
